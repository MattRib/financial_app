import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

export const SUPABASE_CLIENT = 'SUPABASE_CLIENT';

@Global()
@Module({
  providers: [
    {
      provide: SUPABASE_CLIENT,
      useFactory: (configService: ConfigService): SupabaseClient => {
         
        return createClient(
          configService.get<string>('SUPABASE_URL') ?? '',
          configService.get<string>('SUPABASE_SERVICE_ROLE_KEY') ?? '',
        );
      },
      inject: [ConfigService],
    },
  ],
  exports: [SUPABASE_CLIENT],
})
export class SupabaseModule {}
