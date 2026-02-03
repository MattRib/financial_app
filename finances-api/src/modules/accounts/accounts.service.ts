import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_CLIENT } from '../../config/supabase.module';
import { addDays, format } from 'date-fns';
import {
  CreateAccountDto,
  UpdateAccountDto,
  FilterAccountDto,
  CreateTransferDto,
} from './dto';
import { Account, AccountWithBalance } from './entities/account.entity';
import { v4 as uuidv4 } from 'uuid';

export interface AccountSummary {
  total_balance: number;
  total_accounts: number;
  by_type: Array<{
    type: string;
    count: number;
    total_balance: number;
  }>;
}

export interface CreditCardInvoice {
  period_start: string;
  period_end: string;
  closing_day: number;
  due_day?: number | null;
  total: number;
  is_paid: boolean;
  paid_at?: string | null;
  transactions?: Array<{
    id: string;
    date: string;
    amount: number;
    description: string | null;
    category?: { name: string; color: string; icon: string } | null;
  }>;
}

@Injectable()
export class AccountsService {
  constructor(@Inject(SUPABASE_CLIENT) private supabase: SupabaseClient) {}

  async create(userId: string, dto: CreateAccountDto): Promise<Account> {
    const { data, error } = await this.supabase
      .from('accounts')
      .insert({
        user_id: userId,
        name: dto.name,
        type: dto.type,
        initial_balance: dto.initial_balance ?? 0,
        credit_limit: dto.credit_limit ?? null,
        closing_day: dto.closing_day ?? null,
        due_day: dto.due_day ?? null,
        color: dto.color ?? '#3b82f6',
        icon: dto.icon ?? '🏦',
        include_in_total: dto.include_in_total ?? true,
        notes: dto.notes,
      })
      .select()
      .single();

    if (error) throw error;
    return data as Account;
  }

  async findAll(
    userId: string,
    filters?: FilterAccountDto,
  ): Promise<AccountWithBalance[]> {
    let query = this.supabase
      .from('accounts')
      .select('*')
      .eq('user_id', userId);

    if (filters?.type) query = query.eq('type', filters.type);
    if (filters?.is_active !== undefined)
      query = query.eq('is_active', filters.is_active);

    const { data, error } = await query.order('name', { ascending: true });
    if (error) throw error;

    const accounts = data as Account[];

    // Calculate balance for each account
    const accountsWithBalance = await Promise.all(
      accounts.map(async (account) => ({
        ...account,
        current_balance: await this.calculateBalance(account),
      })),
    );

    return accountsWithBalance;
  }

  async findOne(userId: string, id: string): Promise<AccountWithBalance> {
    const { data, error } = await this.supabase
      .from('accounts')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    if (!data) throw new NotFoundException('Conta não encontrada');

    const account = data as Account;
    return {
      ...account,
      current_balance: await this.calculateBalance(account),
    };
  }

  async update(
    userId: string,
    id: string,
    dto: UpdateAccountDto,
  ): Promise<AccountWithBalance> {
    await this.findOne(userId, id);

    const { data, error } = await this.supabase
      .from('accounts')
      .update({ ...dto })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    const account = data as Account;
    return {
      ...account,
      current_balance: await this.calculateBalance(account),
    };
  }

  async remove(userId: string, id: string): Promise<void> {
    await this.findOne(userId, id);

    const { error } = await this.supabase
      .from('accounts')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
  }

  async getSummary(userId: string): Promise<AccountSummary> {
    const accounts = await this.findAll(userId, { is_active: true });

    const byType = new Map<string, { count: number; total_balance: number }>();

    for (const account of accounts) {
      if (!account.include_in_total) continue;

      const existing = byType.get(account.type) || {
        count: 0,
        total_balance: 0,
      };
      byType.set(account.type, {
        count: existing.count + 1,
        total_balance: existing.total_balance + account.current_balance,
      });
    }

    const totalBalance = accounts
      .filter((a) => a.include_in_total)
      .reduce((sum, a) => sum + a.current_balance, 0);

    return {
      total_balance: totalBalance,
      total_accounts: accounts.length,
      by_type: Array.from(byType.entries()).map(([type, data]) => ({
        type,
        ...data,
      })),
    };
  }

  async transfer(
    userId: string,
    dto: CreateTransferDto,
  ): Promise<{ transfer_id: string }> {
    // Validate accounts exist and belong to user
    const fromAccount = await this.findOne(userId, dto.from_account_id);
    const toAccount = await this.findOne(userId, dto.to_account_id);

    if (dto.from_account_id === dto.to_account_id) {
      throw new BadRequestException(
        'Conta de origem e destino devem ser diferentes',
      );
    }

    const transferId = uuidv4();
    const description =
      dto.description ||
      `Transferência: ${fromAccount.name} → ${toAccount.name}`;

    // Create expense transaction (from account)
    const { error: error1 } = await this.supabase.from('transactions').insert({
      user_id: userId,
      from_account_id: dto.from_account_id,
      to_account_id: dto.to_account_id,
      amount: dto.amount,
      type: 'expense',
      description: description,
      date: dto.date,
      transfer_id: transferId,
    });

    if (error1) throw error1;

    // Create income transaction (to account)
    const { error: error2 } = await this.supabase.from('transactions').insert({
      user_id: userId,
      from_account_id: dto.from_account_id,
      to_account_id: dto.to_account_id,
      amount: dto.amount,
      type: 'income',
      description: description,
      date: dto.date,
      transfer_id: transferId,
    });

    if (error2) throw error2;

    return { transfer_id: transferId };
  }

  private async calculateBalance(account: Account): Promise<number> {
    const { data, error } = await this.supabase
      .from('transactions')
      .select('amount, type, date')
      .eq('account_id', account.id);

    if (error) throw error;

    const transactions = data || [];

    if (account.type === 'credit_card' && account.credit_limit != null) {
      let used = 0;
      let paidPeriods = new Set<string>();

      if (account.closing_day) {
        const { data: payments, error: paymentsError } = await this.supabase
          .from('credit_card_invoice_payments')
          .select('period_start, period_end')
          .eq('account_id', account.id);

        if (paymentsError) throw paymentsError;

        paidPeriods = new Set(
          (payments || []).map((p: any) => `${p.period_start}|${p.period_end}`),
        );
      }

      for (const tx of transactions) {
        if (account.closing_day) {
          const period = this.getInvoicePeriod(
            new Date(String(tx.date) + 'T00:00:00'),
            account.closing_day,
          );
          const start = format(period.start, 'yyyy-MM-dd');
          const end = format(period.end, 'yyyy-MM-dd');
          const key = `${start}|${end}`;
          if (paidPeriods.has(key)) continue;
        }

        if (tx.type === 'income') {
          used -= Number(tx.amount);
        } else {
          used += Number(tx.amount);
        }
      }
      const available = Number(account.credit_limit) - used;
      return Math.round(available * 100) / 100;
    }

    let balance = Number(account.initial_balance);

    for (const tx of transactions) {
      if (tx.type === 'income') {
        balance += Number(tx.amount);
      } else {
        balance -= Number(tx.amount);
      }
    }

    return Math.round(balance * 100) / 100;
  }

  private buildDate(year: number, monthIndex: number, day: number): Date {
    const lastDay = new Date(year, monthIndex + 1, 0).getDate();
    const safeDay = Math.min(day, lastDay);
    return new Date(year, monthIndex, safeDay);
  }

  private getInvoicePeriod(
    date: Date,
    closingDay: number,
  ): {
    start: Date;
    end: Date;
  } {
    let endYear = date.getFullYear();
    let endMonth = date.getMonth();
    if (date.getDate() > closingDay) {
      endMonth += 1;
      if (endMonth > 11) {
        endMonth = 0;
        endYear += 1;
      }
    }

    const end = this.buildDate(endYear, endMonth, closingDay);
    let prevMonth = endMonth - 1;
    let prevYear = endYear;
    if (prevMonth < 0) {
      prevMonth = 11;
      prevYear -= 1;
    }
    const prevEnd = this.buildDate(prevYear, prevMonth, closingDay);
    const start = addDays(prevEnd, 1);

    return { start, end };
  }

  private async getAccount(userId: string, id: string): Promise<Account> {
    const { data, error } = await this.supabase
      .from('accounts')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    if (!data) throw new NotFoundException('Conta não encontrada');
    return data as Account;
  }

  async getCurrentInvoice(
    userId: string,
    accountId: string,
  ): Promise<CreditCardInvoice> {
    const account = await this.getAccount(userId, accountId);
    if (account.type !== 'credit_card') {
      throw new BadRequestException('Conta não é cartão de crédito');
    }
    if (!account.closing_day) {
      throw new BadRequestException('Dia de fechamento não configurado');
    }

    const period = this.getInvoicePeriod(new Date(), account.closing_day);
    const start = format(period.start, 'yyyy-MM-dd');
    const end = format(period.end, 'yyyy-MM-dd');

    const { data, error } = await this.supabase
      .from('transactions')
      .select('id, date, amount, description, categories(name, color, icon)')
      .eq('user_id', userId)
      .eq('account_id', accountId)
      .eq('type', 'expense')
      .gte('date', start)
      .lte('date', end)
      .order('date', { ascending: true });

    if (error) throw error;

    const total = (data || []).reduce(
      (sum, tx: any) => sum + Number(tx.amount),
      0,
    );

    const { data: payment } = await this.supabase
      .from('credit_card_invoice_payments')
      .select('paid_at')
      .eq('account_id', accountId)
      .eq('period_start', start)
      .eq('period_end', end)
      .single();

    return {
      period_start: start,
      period_end: end,
      closing_day: account.closing_day,
      due_day: account.due_day ?? null,
      total: Math.round(total * 100) / 100,
      is_paid: !!payment,
      paid_at: payment?.paid_at ?? null,
      transactions: (data || []).map((tx: any) => ({
        id: String(tx.id),
        date: String(tx.date),
        amount: Number(tx.amount),
        description: tx.description ?? null,
        category: tx.categories || null,
      })),
    };
  }

  async getInvoiceHistory(
    userId: string,
    accountId: string,
  ): Promise<CreditCardInvoice[]> {
    const account = await this.getAccount(userId, accountId);
    if (account.type !== 'credit_card') {
      throw new BadRequestException('Conta não é cartão de crédito');
    }
    if (!account.closing_day) {
      throw new BadRequestException('Dia de fechamento não configurado');
    }

    const { data, error } = await this.supabase
      .from('transactions')
      .select('date, amount')
      .eq('user_id', userId)
      .eq('account_id', accountId)
      .eq('type', 'expense');

    if (error) throw error;

    const currentPeriod = this.getInvoicePeriod(
      new Date(),
      account.closing_day,
    );
    const currentEnd = format(currentPeriod.end, 'yyyy-MM-dd');

    const map = new Map<
      string,
      { start: string; end: string; total: number }
    >();
    for (const tx of data || []) {
      const period = this.getInvoicePeriod(
        new Date(String(tx.date) + 'T00:00:00'),
        account.closing_day,
      );
      const start = format(period.start, 'yyyy-MM-dd');
      const end = format(period.end, 'yyyy-MM-dd');
      if (end >= currentEnd) continue;
      const key = `${start}|${end}`;
      const existing = map.get(key) || { start, end, total: 0 };
      existing.total += Number(tx.amount);
      map.set(key, existing);
    }

    const { data: payments } = await this.supabase
      .from('credit_card_invoice_payments')
      .select('period_start, period_end, paid_at')
      .eq('account_id', accountId);

    const paymentMap = new Map<string, string | null>();
    for (const payment of payments || []) {
      const key = `${payment.period_start}|${payment.period_end}`;
      const paidAtValue =
        payment.paid_at == null ? null : String(payment.paid_at);
      paymentMap.set(key, paidAtValue);
    }

    return Array.from(map.values())
      .map((invoice) => {
        const key = `${invoice.start}|${invoice.end}`;
        const paidAt = paymentMap.get(key) || null;
        return {
          period_start: invoice.start,
          period_end: invoice.end,
          closing_day: account.closing_day!,
          due_day: account.due_day ?? null,
          total: Math.round(invoice.total * 100) / 100,
          is_paid: !!paidAt,
          paid_at: paidAt,
        };
      })
      .sort((a, b) => (a.period_end < b.period_end ? 1 : -1));
  }

  async markInvoicePaid(
    userId: string,
    accountId: string,
    periodStart: string,
    periodEnd: string,
  ): Promise<{ paid_at: string }> {
    const account = await this.getAccount(userId, accountId);
    if (account.type !== 'credit_card') {
      throw new BadRequestException('Conta não é cartão de crédito');
    }

    const paidAt = new Date().toISOString();
    const { error } = await this.supabase
      .from('credit_card_invoice_payments')
      .upsert(
        {
          account_id: accountId,
          period_start: periodStart,
          period_end: periodEnd,
          paid_at: paidAt,
        },
        { onConflict: 'account_id,period_start,period_end' },
      );

    if (error) throw error;
    return { paid_at: paidAt };
  }
}
