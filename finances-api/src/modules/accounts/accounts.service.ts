import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_CLIENT } from '../../config/supabase.module';
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
      .select('amount, type')
      .eq('account_id', account.id);

    if (error) throw error;

    const transactions = data || [];
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
}
