import { Injectable, Logger } from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient, User } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private readonly logger = new Logger(SupabaseService.name);
  private readonly supabase: SupabaseClient;

  constructor() {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      this.logger.warn('SUPABASE_URL and/or SUPABASE_SERVICE_ROLE_KEY not set');
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    this.supabase = createClient(url ?? '', key ?? '');
  }

  get client() {
    return this.supabase;
  }

  async getUserFromAccessToken(accessToken: string): Promise<User | null> {
    if (!accessToken) return null;

    // Pass the access token to the Supabase admin client to retrieve user info
    try {
      const { data, error } = await this.supabase.auth.getUser(accessToken);
      if (error) {
        this.logger.debug('Error verifying access token', error);
        return null;
      }
      return data?.user ?? null;
    } catch (err: unknown) {
      this.logger.debug('Error verifying access token', String(err));
      return null;
    }
  }
}
