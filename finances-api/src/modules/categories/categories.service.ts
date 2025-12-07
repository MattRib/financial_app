import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import type { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_CLIENT } from '../../config/supabase.module';
import { CreateCategoryDto, UpdateCategoryDto } from './dto';
import type { Category } from './entities/category.entity';

@Injectable()
export class CategoriesService {
  constructor(@Inject(SUPABASE_CLIENT) private supabase: SupabaseClient) {}

  async create(userId: string, dto: CreateCategoryDto): Promise<Category> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { data, error } = await this.supabase
      .from('categories')
      .insert({
        user_id: userId,
        name: dto.name,
        type: dto.type,
        color: dto.color ?? '#6366f1',
        icon: dto.icon ?? 'tag',
      })
      .select()
      .single();

    if (error) throw error;
    return data as Category;
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
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
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

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { data, error } = await this.supabase
      .from('categories')
      .update({
        ...dto,
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data as Category;
  }

  async remove(userId: string, id: string): Promise<void> {
    await this.findOne(userId, id);

    const { error } = await this.supabase
      .from('categories')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
  }
}
