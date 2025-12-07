/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument */
import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import type { SupabaseClient } from '@supabase/supabase-js';
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

@Injectable()
export class TransactionsService {
  constructor(@Inject(SUPABASE_CLIENT) private supabase: SupabaseClient) {}

  async create(
    userId: string,
    dto: CreateTransactionDto,
  ): Promise<Transaction> {
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
    await this.findOne(userId, id);

    const { error } = await this.supabase
      .from('transactions')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
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
      const categoryName =
        (transaction.categories as any)?.name || 'Sem categoria';
      const categoryColor = (transaction.categories as any)?.color || '#6b7280';
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
}
