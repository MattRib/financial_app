/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-return */
import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_CLIENT } from '../../config/supabase.module';
import { CreateDebtDto, UpdateDebtDto, FilterDebtDto } from './dto';
import { Debt } from './entities/debt.entity';
import { DebtStatus } from '../../common/types/database.types';

export interface DebtSummary {
  total_debt: number;
  total_paid: number;
  remaining: number;
  by_status: {
    pending: { count: number; total: number };
    paid: { count: number; total: number };
    overdue: { count: number; total: number };
  };
}

@Injectable()
export class DebtsService {
  constructor(@Inject(SUPABASE_CLIENT) private supabase: SupabaseClient) {}

  async create(userId: string, dto: CreateDebtDto): Promise<Debt> {
    const { data, error } = await this.supabase
      .from('debts')
      .insert({
        user_id: userId,
        name: dto.name,
        amount: dto.amount,
        due_date: dto.due_date,
        status: dto.status ?? 'pending',
        amount_paid: dto.amount_paid ?? 0,
        creditor: dto.creditor,
        notes: dto.notes,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async findAll(userId: string, filters?: FilterDebtDto): Promise<Debt[]> {
    let query = this.supabase.from('debts').select('*').eq('user_id', userId);

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.due_date_start) {
      query = query.gte('due_date', filters.due_date_start);
    }

    if (filters?.due_date_end) {
      query = query.lte('due_date', filters.due_date_end);
    }

    const { data, error } = await query.order('due_date', { ascending: true });

    if (error) throw error;
    return data;
  }

  async findOne(userId: string, id: string): Promise<Debt> {
    const { data, error } = await this.supabase
      .from('debts')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error) throw error;

    if (!data) {
      throw new NotFoundException('Dívida não encontrada');
    }

    return data;
  }

  async update(userId: string, id: string, dto: UpdateDebtDto): Promise<Debt> {
    await this.findOne(userId, id);

    const { data, error } = await this.supabase
      .from('debts')
      .update({ ...dto })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async remove(userId: string, id: string): Promise<void> {
    await this.findOne(userId, id);

    const { error } = await this.supabase
      .from('debts')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
  }

  async getSummary(userId: string): Promise<DebtSummary> {
    const query = this.supabase
      .from('debts')
      .select('status, amount, amount_paid')
      .eq('user_id', userId);

    const { data, error } = await query;

    if (error) throw error;

    const debts = data || [];
    const totalDebt = debts.reduce((sum, debt) => sum + Number(debt.amount), 0);
    const totalPaid = debts.reduce(
      (sum, debt) => sum + Number(debt.amount_paid),
      0,
    );
    const remaining = totalDebt - totalPaid;

    const byStatus = {
      pending: { count: 0, total: 0 },
      paid: { count: 0, total: 0 },
      overdue: { count: 0, total: 0 },
    };

    for (const debt of debts) {
      const status = debt.status as DebtStatus;
      byStatus[status].count += 1;
      byStatus[status].total += Number(debt.amount);
    }

    return {
      total_debt: totalDebt,
      total_paid: totalPaid,
      remaining,
      by_status: byStatus,
    };
  }

  async getOverdue(userId: string): Promise<Debt[]> {
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await this.supabase
      .from('debts')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'pending')
      .lte('due_date', today);

    if (error) throw error;
    return data || [];
  }

  async markAsPaid(userId: string, id: string): Promise<Debt> {
    const debt = await this.findOne(userId, id);

    const { data, error } = await this.supabase
      .from('debts')
      .update({
        status: 'paid',
        amount_paid: debt.amount,
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}
