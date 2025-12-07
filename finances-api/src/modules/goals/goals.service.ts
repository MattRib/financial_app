/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return */
import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_CLIENT } from '../../config/supabase.module';
import { CreateGoalDto, UpdateGoalDto, FilterGoalDto } from './dto';
import { Goal } from './entities/goal.entity';
import { GoalStatus } from '../../common/types/database.types';

export interface GoalSummary {
  total_target: number;
  current_amount: number;
  remaining: number;
  by_status: {
    active: { count: number; total: number };
    completed: { count: number; total: number };
    cancelled: { count: number; total: number };
  };
}

@Injectable()
export class GoalsService {
  constructor(@Inject(SUPABASE_CLIENT) private supabase: SupabaseClient) {}

  async create(userId: string, dto: CreateGoalDto): Promise<Goal> {
    const { data, error } = await this.supabase
      .from('goals')
      .insert({
        user_id: userId,
        name: dto.name,
        target_amount: dto.target_amount,
        current_amount: dto.current_amount ?? 0,
        target_date: dto.target_date,
        status: dto.status ?? 'active',
        category: dto.category,
        notes: dto.notes,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async findAll(userId: string, filters?: FilterGoalDto): Promise<Goal[]> {
    let query: any = this.supabase
      .from('goals')
      .select('*')
      .eq('user_id', userId);

    if (filters?.status) query = query.eq('status', filters.status);
    if (filters?.target_date_start)
      query = query.gte('target_date', filters.target_date_start);
    if (filters?.target_date_end)
      query = query.lte('target_date', filters.target_date_end);
    if (filters?.category) query = query.eq('category', filters.category);

    const { data, error } = await query.order('target_date', {
      ascending: true,
    });
    if (error) throw error;
    return data;
  }

  async findOne(userId: string, id: string): Promise<Goal> {
    const { data, error } = await this.supabase
      .from('goals')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    if (!data) throw new NotFoundException('Meta não encontrada');
    return data;
  }

  async update(userId: string, id: string, dto: UpdateGoalDto): Promise<Goal> {
    await this.findOne(userId, id);
    const { data, error } = await this.supabase
      .from('goals')
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
      .from('goals')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);
    if (error) throw error;
  }

  async getSummary(userId: string): Promise<GoalSummary> {
    const { data, error } = await this.supabase
      .from('goals')
      .select('status, target_amount, current_amount')
      .eq('user_id', userId);
    if (error) throw error;
    const goals = data || [];

    const totalTarget = goals.reduce(
      (sum: number, g: any) => sum + Number(g.target_amount),
      0,
    );
    const currentAmount = goals.reduce(
      (sum: number, g: any) => sum + Number(g.current_amount || 0),
      0,
    );
    const remaining = totalTarget - currentAmount;

    const by_status = {
      active: { count: 0, total: 0 },
      completed: { count: 0, total: 0 },
      cancelled: { count: 0, total: 0 },
    };

    for (const g of goals) {
      const status = g.status as GoalStatus;
      by_status[status].count += 1;
      by_status[status].total += Number(g.target_amount);
    }

    return {
      total_target: totalTarget,
      current_amount: currentAmount,
      remaining,
      by_status,
    };
  }

  async markAsCompleted(userId: string, id: string): Promise<Goal> {
    const goal = await this.findOne(userId, id);
    const { data, error } = await this.supabase
      .from('goals')
      .update({ status: 'completed', current_amount: goal.target_amount })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();
    if (error) throw error;
    return data;
  }
}
