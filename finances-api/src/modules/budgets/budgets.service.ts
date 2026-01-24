import {
  Injectable,
  Inject,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import type { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_CLIENT } from '../../config/supabase.module';
import { CreateBudgetDto, UpdateBudgetDto } from './dto';
import { Budget } from './entities/budget.entity';

export interface BudgetWithSpent extends Budget {
  spent: number;
  remaining: number;
  percentage: number;
  category?: {
    name: string;
    color: string;
    icon: string;
  };
}

export interface BudgetOverview {
  total_budget: number;
  total_spent: number;
  total_remaining: number;
  percentage: number;
  budgets: BudgetWithSpent[];
}

@Injectable()
export class BudgetsService {
  constructor(@Inject(SUPABASE_CLIENT) private supabase: SupabaseClient) {}

  async create(userId: string, dto: CreateBudgetDto): Promise<Budget> {
    const existing = await this.findExisting(
      userId,
      dto.category_id ?? null,
      dto.month,
      dto.year,
    );

    if (existing) {
      throw new ConflictException(
        'Já existe um orçamento para esta categoria neste período',
      );
    }

    const { data, error } = await this.supabase
      .from('budgets')
      .insert({
        user_id: userId,
        category_id: dto.category_id ?? null,
        amount: dto.amount,
        month: dto.month,
        year: dto.year,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async findAll(
    userId: string,
    month: number,
    year: number,
  ): Promise<BudgetWithSpent[]> {
    const { data: budgets, error } = await this.supabase
      .from('budgets')
      .select('*, categories(name, color, icon)')
      .eq('user_id', userId)
      .eq('month', month)
      .eq('year', year)
      .order('amount', { ascending: false });

    if (error) throw error;

    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = new Date(year, month, 0).toISOString().split('T')[0];

    const budgetsWithSpent = await Promise.all(
      (budgets || []).map(async (budget) => {
        const spent = await this.getSpentAmount(
          userId,
          budget.category_id,
          startDate,
          endDate,
        );
        const remaining = budget.amount - spent;
        const percentage =
          budget.amount > 0 ? (spent / budget.amount) * 100 : 0;

        return {
          ...budget,
          category: budget.categories,
          spent,
          remaining,
          percentage,
        };
      }),
    );

    return budgetsWithSpent;
  }

  async findOne(userId: string, id: string): Promise<Budget> {
    const { data, error } = await this.supabase
      .from('budgets')
      .select('*, categories(name, color, icon)')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      throw new NotFoundException('Orçamento não encontrado');
    }
    return data;
  }

  async update(
    userId: string,
    id: string,
    dto: UpdateBudgetDto,
  ): Promise<Budget> {
    await this.findOne(userId, id);

    const { data, error } = await this.supabase
      .from('budgets')
      .update({ amount: dto.amount })
      .eq('id', id)
      .eq('user_id', userId)
      .select('*, categories(name, color, icon)')
      .single();

    if (error) throw error;
    return data;
  }

  async remove(userId: string, id: string): Promise<void> {
    await this.findOne(userId, id);

    const { error } = await this.supabase
      .from('budgets')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
  }

  async getOverview(
    userId: string,
    month: number,
    year: number,
  ): Promise<BudgetOverview> {
    const budgets = await this.findAll(userId, month, year);

    const totalBudget = budgets.reduce((sum, b) => sum + Number(b.amount), 0);
    const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
    const totalRemaining = totalBudget - totalSpent;
    const percentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

    return {
      total_budget: totalBudget,
      total_spent: totalSpent,
      total_remaining: totalRemaining,
      percentage,
      budgets,
    };
  }

  async getAlerts(
    userId: string,
    month: number,
    year: number,
  ): Promise<BudgetWithSpent[]> {
    const budgets = await this.findAll(userId, month, year);
    return budgets.filter((budget) => budget.percentage >= 80);
  }

  private async findExisting(
    userId: string,
    categoryId: string | null,
    month: number,
    year: number,
  ): Promise<Budget | null> {
    let query = this.supabase
      .from('budgets')
      .select('*')
      .eq('user_id', userId)
      .eq('month', month)
      .eq('year', year);

    if (categoryId) {
      query = query.eq('category_id', categoryId);
    } else {
      query = query.is('category_id', null);
    }

    const { data } = await query.single();
    return data;
  }

  private async getSpentAmount(
    userId: string,
    categoryId: string | null,
    startDate: string,
    endDate: string,
  ): Promise<number> {
    let query = this.supabase
      .from('transactions')
      .select('amount')
      .eq('user_id', userId)
      .eq('type', 'expense')
      .gte('date', startDate)
      .lte('date', endDate);

    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }

    const { data, error } = await query;

    if (error) throw error;

    return (data || []).reduce((sum, t) => sum + Number(t.amount), 0);
  }
}
