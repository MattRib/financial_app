import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { User } from '@supabase/supabase-js';
import { SupabaseService } from '../supabase/supabase.service';

interface RequestWithUser {
  headers?: {
    authorization?: string;
  };
  user?: User;
}

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  constructor(private readonly supabaseService: SupabaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const authHeader = request.headers?.authorization ?? '';
    const token = authHeader.replace(/^Bearer\s+/i, '');
    if (!token) throw new UnauthorizedException('Missing access token');

    const user = await this.supabaseService.getUserFromAccessToken(token);
    if (!user) throw new UnauthorizedException('Invalid access token');

    request.user = user;
    return true;
  }
}
