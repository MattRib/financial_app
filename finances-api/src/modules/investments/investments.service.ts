import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_CLIENT } from '../../config/supabase.module';
import {
  CreateInvestmentDto,
  UpdateInvestmentDto,
  FilterInvestmentDto,
} from './dto';
import { Investment } from './entities/investment.entity';
import { InvestmentType } from '../../common/types/database.types';

export interface InvestmentSummary {
  total_invested: number;
  by_type: TypeSummary[];
  monthly_average: number;
}

export interface TypeSummary {
  type: InvestmentType;
  total: number;
  percentage: number;
  count: number;
}

export interface MonthlyEvolution {
  month: string;
  total: number;
  by_type: Record<InvestmentType, number>;
}

@Injectable()
export class InvestmentsService {
  constructor(@Inject(SUPABASE_CLIENT) private supabase: SupabaseClient) {}

  async create(userId: string, dto: CreateInvestmentDto): Promise<Investment> {
    const { data, error } = await this.supabase
      .from('investments')
      .insert({
        user_id: userId,
        type: dto.type,
        name: dto.name,
        amount: dto.amount,
        date: dto.date,
        notes: dto.notes ?? null,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async findAll(
    userId: string,
    filters?: FilterInvestmentDto,
  ): Promise<Investment[]> {
    let query = this.supabase
      .from('investments')
      .select('*')
      .eq('user_id', userId);

    if (filters?.type) {
      query = query.eq('type', filters.type);
    }

    if (filters?.start_date) {
      query = query.gte('date', filters.start_date);
    }

    if (filters?.end_date) {
      query = query.lte('date', filters.end_date);
    }

    const { data, error } = await query.order('date', { ascending: false });

    if (error) throw error;
    return data;
  }

  async findOne(userId: string, id: string): Promise<Investment> {
    const { data, error } = await this.supabase
      .from('investments')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      throw new NotFoundException('Investimento não encontrado');
    }
    return data;
  }

  async update(
    userId: string,
    id: string,
    dto: UpdateInvestmentDto,
  ): Promise<Investment> {
    await this.findOne(userId, id);

    const { data, error } = await this.supabase
      .from('investments')
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
      .from('investments')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
  }

  async getSummary(
    userId: string,
    startDate?: string,
    endDate?: string,
  ): Promise<InvestmentSummary> {
    let query = this.supabase
      .from('investments')
      .select('type, amount, date')
      .eq('user_id', userId);

    if (startDate) {
      query = query.gte('date', startDate);
    }

    if (endDate) {
      query = query.lte('date', endDate);
    }

    const { data, error } = await query;

    if (error) throw error;

    const investments = data || [];
    const totalInvested = investments.reduce(
      (sum, inv) => sum + Number(inv.amount),
      0,
    );

    const typeMap = new Map<InvestmentType, { total: number; count: number }>();

    for (const inv of investments) {
      const current = typeMap.get(inv.type) || { total: 0, count: 0 };
      current.total += Number(inv.amount);
      current.count += 1;
      typeMap.set(inv.type, current);
    }

    const byType: TypeSummary[] = Array.from(typeMap.entries())
      .map(([type, data]) => ({
        type,
        total: data.total,
        percentage: totalInvested > 0 ? (data.total / totalInvested) * 100 : 0,
        count: data.count,
      }))
      .sort((a, b) => b.total - a.total);

    const months = new Set(investments.map((inv) => inv.date.substring(0, 7)));
    const monthlyAverage = months.size > 0 ? totalInvested / months.size : 0;

    return {
      total_invested: totalInvested,
      by_type: byType,
      monthly_average: monthlyAverage,
    };
  }

  async getMonthlyEvolution(
    userId: string,
    year: number,
  ): Promise<MonthlyEvolution[]> {
    const startDate = `${year}-01-01`;
    const endDate = `${year}-12-31`;

    const { data, error } = await this.supabase
      .from('investments')
      .select('type, amount, date')
      .eq('user_id', userId)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date');

    if (error) throw error;

    const monthlyMap = new Map<
      string,
      { total: number; by_type: Record<string, number> }
    >();

    for (let month = 1; month <= 12; month++) {
      const monthKey = `${year}-${String(month).padStart(2, '0')}`;
      monthlyMap.set(monthKey, {
        total: 0,
        by_type: { renda_fixa: 0, renda_variavel: 0, cripto: 0, outros: 0 },
      });
    }

    for (const inv of data || []) {
      const monthKey = inv.date.substring(0, 7);
      const monthData = monthlyMap.get(monthKey);
      if (monthData) {
        monthData.total += Number(inv.amount);
        monthData.by_type[inv.type] += Number(inv.amount);
      }
    }

    return Array.from(monthlyMap.entries())
      .map(([month, data]) => ({
        month,
        total: data.total,
        by_type: data.by_type as Record<InvestmentType, number>,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }

  async getTotalByMonth(
    userId: string,
    month: number,
    year: number,
  ): Promise<number> {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = new Date(year, month, 0).toISOString().split('T')[0];

    const { data, error } = await this.supabase
      .from('investments')
      .select('amount')
      .eq('user_id', userId)
      .gte('date', startDate)
      .lte('date', endDate);

    if (error) throw error;

    return (data || []).reduce((sum, inv) => sum + Number(inv.amount), 0);
  }
}
