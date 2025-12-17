import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_CLIENT } from '../../config/supabase.module';
import type { Profile } from './entities/profile.entity';
import type { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class ProfilesService {
  constructor(@Inject(SUPABASE_CLIENT) private supabase: SupabaseClient) {}

  async findById(id: string): Promise<Profile | null> {
    const { data, error } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw error;
    }

    return data as Profile | null;
  }

  async findByUserId(userId: string): Promise<Profile | null> {
    return this.findById(userId);
  }

  async updateProfile(userId: string, dto: UpdateProfileDto): Promise<Profile> {
    const updates = {
      id: userId,
      ...dto,
    };
    const { error } = await this.supabase.from('profiles').upsert(updates, {
      returning: 'representation',
    });
    if (error) throw error;

    const profile = await this.findById(userId);
    if (!profile) throw new NotFoundException('Profile not found after update');
    return profile;
  }
}
