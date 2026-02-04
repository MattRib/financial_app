import { Injectable, Inject, NotFoundException, Logger } from '@nestjs/common';
import type { SupabaseClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import { addMonths, format } from 'date-fns';
import { SUPABASE_CLIENT } from '../../config/supabase.module';
import {
  CreateTransactionDto,
  UpdateTransactionDto,
  FilterTransactionDto,
  InstallmentDeleteMode,
} from './dto';
import type { Transaction } from './entities/transaction.entity';

export interface TransactionSummary {
  total_income: number;
  total_expense: number;
  balance: number;
}

export interface CategorySummary {
  category_id: string;
  category_name: string;
  category_color: string;
  total: number;
  percentage: number;
}

export interface InstallmentGroupSummary {
  installment_group_id: string;
  description: string;
  category?: { name: string; color: string; icon: string } | null;
  total_installments: number;
  paid_installments: number;
  monthly_amount: number;
  total_amount: number;
  remaining_amount: number;
  first_date: string;
  last_date: string;
  type: 'income' | 'expense';
}

@Injectable()
export class TransactionsService {
  private readonly logger = new Logger(TransactionsService.name);

  constructor(@Inject(SUPABASE_CLIENT) private supabase: SupabaseClient) {}

  async create(
    userId: string,
    dto: CreateTransactionDto,
  ): Promise<Transaction | Transaction[]> {
    // Check if this is a recurring expense
    if (
      'total_recurrences' in dto &&
      (dto as any).total_recurrences &&
      (dto as any).total_recurrences > 1
    ) {
      return this.createRecurringExpenses(userId, dto as any);
    }

    // Check if this is an installment transaction
    if (dto.total_installments && dto.total_installments > 1) {
      return this.createInstallments(userId, dto);
    }

    // Regular single transaction
    const { data, error } = await this.supabase
      .from('transactions')
      .insert({
        user_id: userId,
        amount: dto.amount,
        type: dto.type,
        category_id: dto.category_id ?? null,
        description: dto.description ?? null,
        date: (dto as any).date || (dto as any).start_date,
        tags: dto.tags ?? [],
        attachment_url: dto.attachment_url ?? null,
        account_id: dto.account_id,
      })
      .select()
      .single();

    if (error) throw error;
    return data as Transaction;
  }

  private async createInstallments(
    userId: string,
    dto: CreateTransactionDto,
  ): Promise<Transaction[]> {
    const totalInstallments = dto.total_installments!;
    const installmentGroupId = uuidv4();
    const installmentAmount = dto.amount / totalInstallments;

    // Parse the start date
    const startDate = new Date(
      (dto.date || (dto as any).start_date) + 'T00:00:00',
    );

    // Build installment transactions
    const installments: any[] = [];
    for (let i = 0; i < totalInstallments; i++) {
      const installmentDate = addMonths(startDate, i);
      const installmentNumber = i + 1;

      installments.push({
        user_id: userId,
        amount: installmentAmount,
        type: dto.type,
        category_id: dto.category_id ?? null,
        description: dto.description
          ? `${dto.description} (${installmentNumber}/${totalInstallments})`
          : `Parcela ${installmentNumber}/${totalInstallments}`,
        date: format(installmentDate, 'yyyy-MM-dd'),
        tags: dto.tags ?? [],
        attachment_url: dto.attachment_url ?? null,
        account_id: dto.account_id,
        installment_group_id: installmentGroupId,
        installment_number: installmentNumber,
        total_installments: totalInstallments,
      });
    }

    // Insert all installments in a single query
    const { data, error } = await this.supabase
      .from('transactions')
      .insert(installments)
      .select();

    if (error) throw error;
    return data as Transaction[];
  }

  /**
   * Creates recurring expense transactions
   * Similar to installments, but repeats the FULL amount each month
   */
  private async createRecurringExpenses(
    userId: string,
    dto: any,
  ): Promise<Transaction[]> {
    const totalRecurrences = dto.total_recurrences;
    const recurringGroupId = uuidv4();
    this.logger.log(`💰 [Backend] Group ID gerado: ${recurringGroupId}`);
    const monthlyAmount = dto.amount; // Full amount each month (not divided)

    // Parse the start date
    const startDate = new Date((dto.start_date || dto.date) + 'T00:00:00');

    // Build recurring expense transactions
    const recurrences: any[] = [];
    for (let i = 0; i < totalRecurrences; i++) {
      const recurrenceDate = addMonths(startDate, i);
      const recurrenceNumber = i + 1;

      recurrences.push({
        user_id: userId,
        amount: monthlyAmount, // Full amount (not divided)
        type: dto.type,
        category_id: dto.category_id ?? null,
        description: dto.description || 'Despesa recorrente', // Keep description as-is
        date: format(recurrenceDate, 'yyyy-MM-dd'),
        tags: dto.tags ?? [],
        attachment_url: dto.attachment_url ?? null,
        account_id: dto.account_id,
        recurring_group_id: recurringGroupId,
        recurring_number: recurrenceNumber,
        total_recurrences: totalRecurrences,
        is_recurring: true,
      });
    }

    const { data, error } = await this.supabase
      .from('transactions')
      .insert(recurrences)
      .select();

    if (error) {
      throw error;
    }
    return data as Transaction[];
  }

  async findAll(
    userId: string,
    filters?: FilterTransactionDto,
  ): Promise<Transaction[]> {
    let query = this.supabase
      .from('transactions')
      .select('*, categories(name, color, icon)')
      .eq('user_id', userId);

    if (filters?.type) {
      query = query.eq('type', filters.type);
    }

    if (filters?.category_id) {
      query = query.eq('category_id', filters.category_id);
    }

    if (filters?.account_id) {
      query = query.eq('account_id', filters.account_id);
    }

    if (filters?.start_date) {
      query = query.gte('date', filters.start_date);
    }

    if (filters?.end_date) {
      query = query.lte('date', filters.end_date);
    }

    const { data, error } = await query.order('date', { ascending: false });

    if (error) throw error;
    return (data ?? []) as Transaction[];
  }

  async findOne(userId: string, id: string): Promise<Transaction> {
    const { data, error } = await this.supabase
      .from('transactions')
      .select('*, categories(name, color, icon)')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      throw new NotFoundException('Transação não encontrada');
    }
    return data as Transaction;
  }

  async update(
    userId: string,
    id: string,
    dto: UpdateTransactionDto,
  ): Promise<Transaction> {
    await this.findOne(userId, id);

    const { data, error } = await this.supabase
      .from('transactions')
      .update({ ...dto })
      .eq('id', id)
      .eq('user_id', userId)
      .select('*, categories(name, color, icon)')
      .single();

    if (error) throw error;
    return data as Transaction;
  }

  async remove(
    userId: string,
    id: string,
    mode?: InstallmentDeleteMode,
  ): Promise<void> {
    const transaction = await this.findOne(userId, id);

    // Check if this transaction is part of a recurring group
    if (transaction.is_recurring && transaction.recurring_group_id) {
      // For recurring expenses, just delete this single transaction
      // User should use removeRecurringExpense() to delete future ones
      const { error } = await this.supabase
        .from('transactions')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) throw error;
      return;
    }

    // Check if this transaction is part of an installment group
    if (transaction.installment_group_id) {
      // Use default mode if not provided
      const deleteMode = mode || InstallmentDeleteMode.ALL;

      if (deleteMode === InstallmentDeleteMode.SINGLE) {
        // Delete only this single installment
        const { error } = await this.supabase
          .from('transactions')
          .delete()
          .eq('id', id)
          .eq('user_id', userId);

        if (error) throw error;
      } else if (deleteMode === InstallmentDeleteMode.FUTURE) {
        // Delete this installment and all future ones
        const currentInstallmentNumber = transaction.installment_number || 0;

        const { error } = await this.supabase
          .from('transactions')
          .delete()
          .eq('installment_group_id', transaction.installment_group_id)
          .eq('user_id', userId)
          .gte('installment_number', currentInstallmentNumber);

        if (error) throw error;
      } else {
        // InstallmentDeleteMode.ALL - Delete ALL installments in the group
        const { error } = await this.supabase
          .from('transactions')
          .delete()
          .eq('installment_group_id', transaction.installment_group_id)
          .eq('user_id', userId);

        if (error) throw error;
      }
    } else {
      // Regular single transaction delete
      const { error } = await this.supabase
        .from('transactions')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) throw error;
    }
  }

  async getSummary(
    userId: string,
    startDate: string,
    endDate: string,
  ): Promise<TransactionSummary> {
    const { data, error } = await this.supabase
      .from('transactions')
      .select('amount, type')
      .eq('user_id', userId)
      .gte('date', startDate)
      .lte('date', endDate);

    if (error) throw error;

    const summary = (data || []).reduce(
      (acc, transaction) => {
        if (transaction.type === 'income') {
          acc.total_income += Number(transaction.amount);
        } else {
          acc.total_expense += Number(transaction.amount);
        }
        return acc;
      },
      { total_income: 0, total_expense: 0, balance: 0 },
    );

    summary.balance = summary.total_income - summary.total_expense;
    return summary;
  }

  async getByCategory(
    userId: string,
    startDate: string,
    endDate: string,
  ): Promise<CategorySummary[]> {
    const { data, error } = await this.supabase
      .from('transactions')
      .select('amount, category_id, categories(name, color)')
      .eq('user_id', userId)
      .eq('type', 'expense')
      .gte('date', startDate)
      .lte('date', endDate);

    if (error) throw error;

    const categoryMap = new Map<
      string,
      { name: string; color: string; total: number }
    >();
    let totalExpenses = 0;

    for (const transaction of data || []) {
      const categoryId = String(transaction.category_id ?? 'uncategorized');

      const categories = transaction.categories as any;
      const categoryName = categories?.name || 'Sem categoria';
      const categoryColor = categories?.color || '#6b7280';
      const amount = Number(transaction.amount);

      totalExpenses += amount;

      if (categoryMap.has(categoryId)) {
        categoryMap.get(categoryId)!.total += amount;
      } else {
        categoryMap.set(categoryId, {
          name: String(categoryName),
          color: String(categoryColor),
          total: amount,
        });
      }
    }

    return Array.from(categoryMap.entries())
      .map(([categoryId, data]) => ({
        category_id: categoryId,
        category_name: data.name,
        category_color: data.color,
        total: data.total,
        percentage: totalExpenses > 0 ? (data.total / totalExpenses) * 100 : 0,
      }))
      .sort((a, b) => b.total - a.total);
  }

  async findByInstallmentGroup(
    userId: string,
    installmentGroupId: string,
  ): Promise<Transaction[]> {
    const { data, error } = await this.supabase
      .from('transactions')
      .select('*, categories(name, color, icon)')
      .eq('user_id', userId)
      .eq('installment_group_id', installmentGroupId)
      .order('installment_number', { ascending: true });

    if (error) throw error;
    return (data ?? []) as Transaction[];
  }

  async getInstallmentGroups(
    userId: string,
    activeOnly?: boolean,
  ): Promise<InstallmentGroupSummary[]> {
    // Get all transactions that are part of installments
    const { data, error } = await this.supabase
      .from('transactions')
      .select('*, categories(name, color, icon)')
      .eq('user_id', userId)
      .not('installment_group_id', 'is', null)
      .order('date', { ascending: false });

    if (error) throw error;

    // Group by installment_group_id
    const groupsMap = new Map<string, Transaction[]>();
    for (const transaction of data || []) {
      const groupId = String(transaction.installment_group_id);
      if (!groupsMap.has(groupId)) {
        groupsMap.set(groupId, []);
      }
      groupsMap.get(groupId)!.push(transaction as Transaction);
    }

    // Build summary for each group
    const summaries: InstallmentGroupSummary[] = [];
    const today = new Date();

    for (const [groupId, installments] of groupsMap.entries()) {
      const sorted = installments.sort(
        (a, b) => (a.installment_number || 0) - (b.installment_number || 0),
      );

      const firstInstallment = sorted[0];
      const paidCount = sorted.filter(
        (inst) => new Date(inst.date) <= today,
      ).length;

      const monthlyAmount = Number(firstInstallment.amount);
      const totalAmount =
        monthlyAmount * (firstInstallment.total_installments || 1);
      const paidAmount = monthlyAmount * paidCount;
      const remainingAmount = totalAmount - paidAmount;

      summaries.push({
        installment_group_id: groupId,
        description:
          firstInstallment.description?.replace(/\s*\(\d+\/\d+\)/, '') ||
          'Compra parcelada',
        category: (firstInstallment as any).categories || null,
        total_installments: firstInstallment.total_installments || 0,
        paid_installments: paidCount,
        monthly_amount: monthlyAmount,
        total_amount: totalAmount,
        remaining_amount: remainingAmount,
        first_date: sorted[0].date,
        last_date: sorted[sorted.length - 1].date,
        type: firstInstallment.type,
      });
    }

    // If caller requested only active groups, filter out fully paid groups
    let result = summaries;
    if (activeOnly) {
      result = summaries.filter(
        (s) =>
          (s.paid_installments ?? 0) < (s.total_installments ?? 0) &&
          (s.remaining_amount ?? 0) > 0,
      );
    }

    return result.sort(
      (a, b) =>
        new Date(String(b.first_date)).getTime() -
        new Date(String(a.first_date)).getTime(),
    );
  }

  /**
   * Get all recurring expense groups for the user
   */
  async getRecurringExpenseGroups(userId: string): Promise<any[]> {
    // Get all transactions that are recurring
    const { data, error } = await this.supabase
      .from('transactions')
      .select('*, categories(name, color, icon)')
      .eq('user_id', userId)
      .eq('is_recurring', true)
      .order('date', { ascending: false });

    if (error) {
      throw error;
    }

    // Group by recurring_group_id
    const groupsMap = new Map<string, Transaction[]>();
    for (const transaction of data || []) {
      if (!transaction.recurring_group_id) continue;
      const groupId = String(transaction.recurring_group_id);
      if (!groupsMap.has(groupId)) {
        groupsMap.set(groupId, []);
      }
      groupsMap.get(groupId)!.push(transaction as Transaction);
    }

    // Build summary for each group
    const summaries: any[] = [];
    const today = new Date();

    this.logger.log(`🔍 [Backend] Grupos encontrados: ${groupsMap.size}`);

    for (const [groupId, recurrences] of groupsMap.entries()) {
      const sorted = recurrences.sort(
        (a, b) => (a.recurring_number || 0) - (b.recurring_number || 0),
      );

      const firstRecurrence = sorted[0];
      const completedCount = sorted.filter(
        (rec) => new Date(rec.date) <= today,
      ).length;
      const pendingCount = sorted.length - completedCount;

      const monthlyAmount = Number(firstRecurrence.amount);
      const totalAmount =
        monthlyAmount * (firstRecurrence.total_recurrences || 1);
      const paidAmount = monthlyAmount * completedCount;
      const remainingAmount = totalAmount - paidAmount;

      // Check if all recurrences still exist (not deleted)
      const isActive = sorted.length === firstRecurrence.total_recurrences;

      summaries.push({
        recurring_group_id: groupId,
        description: firstRecurrence.description || 'Despesa recorrente',
        category: (firstRecurrence as any).categories || null,
        total_recurrences: firstRecurrence.total_recurrences || 0,
        completed_recurrences: completedCount,
        pending_recurrences: pendingCount,
        monthly_amount: monthlyAmount,
        total_amount: totalAmount,
        paid_amount: paidAmount,
        remaining_amount: remainingAmount,
        first_date: sorted[0].date,
        last_date: sorted[sorted.length - 1].date,
        type: firstRecurrence.type,
        is_active: isActive,
      });
    }

    this.logger.log(`🔍 [Backend] Summaries gerados: ${summaries.length}`);

    return summaries.sort(
      (a, b) =>
        new Date(String(b.first_date)).getTime() -
        new Date(String(a.first_date)).getTime(),
    );
  }

  /**
   * Get all transactions in a recurring expense group
   */
  async findByRecurringGroup(
    userId: string,
    recurringGroupId: string,
  ): Promise<Transaction[]> {
    const { data, error } = await this.supabase
      .from('transactions')
      .select('*, categories(name, color, icon)')
      .eq('user_id', userId)
      .eq('recurring_group_id', recurringGroupId)
      .order('recurring_number', { ascending: true });

    if (error) throw error;
    return (data ?? []) as Transaction[];
  }

  /**
   * Remove recurring expense (deletes only FUTURE transactions)
   * Keeps past transactions as history
   */
  async removeRecurringExpense(
    userId: string,
    recurringGroupId: string,
  ): Promise<{ deleted: number }> {
    const today = format(new Date(), 'yyyy-MM-dd');

    // Delete only future transactions
    const { data, error } = await this.supabase
      .from('transactions')
      .delete()
      .eq('user_id', userId)
      .eq('recurring_group_id', recurringGroupId)
      .gt('date', today) // Only future dates
      .select();

    if (error) throw error;

    return { deleted: (data || []).length };
  }

  /**
   * Get monthly expenses breakdown for a specific year
   */
  async getMonthlyExpenses(
    userId: string,
    year: number,
  ): Promise<{ month: number; total: number }[]> {
    const startDate = `${year}-01-01`;
    const endDate = `${year}-12-31`;

    const { data, error } = await this.supabase
      .from('transactions')
      .select('amount, date')
      .eq('user_id', userId)
      .eq('type', 'expense')
      .gte('date', startDate)
      .lte('date', endDate);

    if (error) throw error;

    // Group by month
    const monthlyTotals = new Map<number, number>();

    // Initialize all months with 0
    for (let month = 1; month <= 12; month++) {
      monthlyTotals.set(month, 0);
    }

    // Sum expenses by month
    for (const transaction of data || []) {
      const date = new Date(String(transaction.date));
      if (isNaN(date.getTime())) continue;
      const month = date.getMonth() + 1; // 1-12
      const currentTotal = monthlyTotals.get(month) || 0;
      monthlyTotals.set(month, currentTotal + Number(transaction.amount));
    }

    // Convert to array and sort by month
    return Array.from(monthlyTotals.entries())
      .map(([month, total]) => ({ month, total }))
      .sort((a, b) => a.month - b.month);
  }
}
