import { Controller, Get, UseGuards } from '@nestjs/common';
import type { User } from '@supabase/supabase-js';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard';
import { CurrentUser } from '../../common/decorators/user.decorator';

@Controller('auth')
export class AuthController {
  @Get('me')
  @UseGuards(SupabaseAuthGuard)
  me(@CurrentUser() user: User) {
    return { user };
  }
}
