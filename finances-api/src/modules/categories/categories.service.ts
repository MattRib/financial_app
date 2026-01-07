import {
  Injectable,
  Inject,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import type { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_CLIENT } from '../../config/supabase.module';
import { CreateCategoryDto, UpdateCategoryDto } from './dto';
import type { Category } from './entities/category.entity';
import type { CategoryType } from '../../common/types/database.types';

@Injectable()
export class CategoriesService {
  constructor(@Inject(SUPABASE_CLIENT) private supabase: SupabaseClient) {}

  async create(userId: string, dto: CreateCategoryDto): Promise<Category> {
    // Check for duplicate name (case-insensitive)
    await this.checkDuplicateName(userId, dto.name);

    const { data, error } = await this.supabase
      .from('categories')
      .insert({
        user_id: userId,
        name: dto.name.trim(),
        type: dto.type,
        color: dto.color ?? '#6366f1',
        icon: dto.icon ?? 'tag',
      })
      .select()
      .single();

    if (error) throw error;
    return data as Category;
  }

  private async checkDuplicateName(
    userId: string,
    name: string,
    excludeId?: string,
  ): Promise<void> {
    const { data, error } = await this.supabase
      .from('categories')
      .select('id, name')
      .eq('user_id', userId)
      .ilike('name', name.trim());

    if (error) throw error;

    const duplicate = (data ?? []).find(
      (cat) => cat.id !== excludeId && cat.name.toLowerCase() === name.trim().toLowerCase(),
    );

    if (duplicate) {
      throw new ConflictException(
        `Já existe uma categoria com o nome "${name}"`,
      );
    }
  }

  async findAll(userId: string): Promise<Category[]> {
    const { data, error } = await this.supabase
      .from('categories')
      .select('*')
      .eq('user_id', userId)
      .order('name');

    if (error) throw error;
    return (data ?? []) as Category[];
  }

  async findByType(userId: string, type: string): Promise<Category[]> {
    const { data, error } = await this.supabase
      .from('categories')
      .select('*')
      .eq('user_id', userId)
      .eq('type', type)
      .order('name');

    if (error) throw error;
    return (data ?? []) as Category[];
  }

  async findOne(userId: string, id: string): Promise<Category> {
     
    const { data, error } = await this.supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      throw new NotFoundException('Categoria não encontrada');
    }
    return data as Category;
  }

  async update(
    userId: string,
    id: string,
    dto: UpdateCategoryDto,
  ): Promise<Category> {
    await this.findOne(userId, id);

    // Check for duplicate name if name is being updated
    if (dto.name) {
      await this.checkDuplicateName(userId, dto.name, id);
    }

    const updateData: Partial<Category> = {};
    if (dto.name) updateData.name = dto.name.trim();
    if (dto.type) updateData.type = dto.type;
    if (dto.color) updateData.color = dto.color;
    if (dto.icon) updateData.icon = dto.icon;

    const { data, error } = await this.supabase
      .from('categories')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data as Category;
  }

  async remove(userId: string, id: string): Promise<void> {
    const category = await this.findOne(userId, id);

    // Check if category is in use
    const isInUse = await this.isCategoryInUse(userId, id);
    if (isInUse) {
      throw new BadRequestException(
        `Não é possível deletar a categoria "${category.name}" pois ela está sendo usada em transações ou orçamentos`,
      );
    }

    const { error } = await this.supabase
      .from('categories')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
  }

  private async isCategoryInUse(
    userId: string,
    categoryId: string,
  ): Promise<boolean> {
    // Check transactions
    const { data: transactions, error: txError } = await this.supabase
      .from('transactions')
      .select('id')
      .eq('user_id', userId)
      .eq('category_id', categoryId)
      .limit(1);

    if (txError) throw txError;
    if (transactions && transactions.length > 0) return true;

    // Check budgets
    const { data: budgets, error: budgetError } = await this.supabase
      .from('budgets')
      .select('id')
      .eq('user_id', userId)
      .eq('category_id', categoryId)
      .limit(1);

    if (budgetError) throw budgetError;
    if (budgets && budgets.length > 0) return true;

    return false;
  }

  async getCategoryUsageStats(
    userId: string,
    categoryId: string,
  ): Promise<{
    transactionCount: number;
    budgetCount: number;
    totalAmount: number;
  }> {
    await this.findOne(userId, categoryId);

    // Count transactions
    const { data: transactions, error: txError } = await this.supabase
      .from('transactions')
      .select('amount')
      .eq('user_id', userId)
      .eq('category_id', categoryId);

    if (txError) throw txError;

    const transactionCount = transactions?.length ?? 0;
    const totalAmount = transactions?.reduce(
      (sum, tx) => sum + Number(tx.amount),
      0,
    ) ?? 0;

    // Count budgets
    const { data: budgets, error: budgetError } = await this.supabase
      .from('budgets')
      .select('id')
      .eq('user_id', userId)
      .eq('category_id', categoryId);

    if (budgetError) throw budgetError;
    const budgetCount = budgets?.length ?? 0;

    return {
      transactionCount,
      budgetCount,
      totalAmount,
    };
  }

  async createDefaultCategories(userId: string): Promise<Category[]> {
    const defaultCategories = [
      // Expense categories
      { name: 'Alimentação', type: 'expense' as CategoryType, color: '#ef4444', icon: '🍽️' },
      { name: 'Transporte', type: 'expense' as CategoryType, color: '#3b82f6', icon: '🚗' },
      { name: 'Moradia', type: 'expense' as CategoryType, color: '#8b5cf6', icon: '🏠' },
      { name: 'Saúde', type: 'expense' as CategoryType, color: '#10b981', icon: '⚕️' },
      { name: 'Educação', type: 'expense' as CategoryType, color: '#f59e0b', icon: '📚' },
      { name: 'Lazer', type: 'expense' as CategoryType, color: '#ec4899', icon: '🎮' },
      { name: 'Compras', type: 'expense' as CategoryType, color: '#06b6d4', icon: '🛍️' },
      { name: 'Contas', type: 'expense' as CategoryType, color: '#6366f1', icon: '📄' },

      // Income categories
      { name: 'Salário', type: 'income' as CategoryType, color: '#22c55e', icon: '💰' },
      { name: 'Freelance', type: 'income' as CategoryType, color: '#84cc16', icon: '💼' },
      { name: 'Investimentos', type: 'income' as CategoryType, color: '#14b8a6', icon: '📈' },
      { name: 'Outros', type: 'income' as CategoryType, color: '#a3e635', icon: '💵' },

      // Investment categories
      { name: 'Ações', type: 'investment' as CategoryType, color: '#0ea5e9', icon: '📊' },
      { name: 'Renda Fixa', type: 'investment' as CategoryType, color: '#6366f1', icon: '🏦' },
      { name: 'Fundos', type: 'investment' as CategoryType, color: '#8b5cf6', icon: '💎' },
    ];

    const createdCategories: Category[] = [];

    for (const category of defaultCategories) {
      try {
        const created = await this.create(userId, category);
        createdCategories.push(created);
      } catch (error) {
        // Skip if category already exists
        console.error(`Failed to create default category ${category.name}:`, error);
      }
    }

    return createdCategories;
  }
}
