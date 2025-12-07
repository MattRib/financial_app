import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SupabaseService } from '../../common/supabase/supabase.service';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard';
import { AuthGuard } from '../../common/guards/auth.guard';

@Module({
  controllers: [AuthController],
  providers: [AuthService, SupabaseService, SupabaseAuthGuard, AuthGuard],
  exports: [AuthService, SupabaseService, SupabaseAuthGuard, AuthGuard],
})
export class AuthModule {}
