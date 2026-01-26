import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import type { SupabaseClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import { addMonths, format } from 'date-fns';
import { SUPABASE_CLIENT } from '../../config/supabase.module';
import {
  CreateTransactionDto,
  UpdateTransactionDto,
  FilterTransactionDto,
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
  constructor(@Inject(SUPABASE_CLIENT) private supabase: SupabaseClient) {}

  async create(
    userId: string,
    dto: CreateTransactionDto,
  ): Promise<Transaction | Transaction[]> {
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
        date: dto.date,
        tags: dto.tags ?? [],
        attachment_url: dto.attachment_url ?? null,
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
    const startDate = new Date(dto.date + 'T00:00:00');

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

  async remove(userId: string, id: string): Promise<void> {
    const transaction = await this.findOne(userId, id);

    // Check if this transaction is part of an installment group
    if (transaction.installment_group_id) {
      // Delete ALL installments in the group
      const { error } = await this.supabase
        .from('transactions')
        .delete()
        .eq('installment_group_id', transaction.installment_group_id)
        .eq('user_id', userId);

      if (error) throw error;
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
      const categoryId = transaction.category_id || 'uncategorized';

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
      const groupId = transaction.installment_group_id!;
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

    return summaries.sort(
      (a, b) =>
        new Date(b.first_date).getTime() - new Date(a.first_date).getTime(),
    );
  }
}
