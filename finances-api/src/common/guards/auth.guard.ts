import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Inject,
} from '@nestjs/common';
import type { SupabaseClient, User } from '@supabase/supabase-js';
import { SUPABASE_CLIENT } from '../../config/supabase.module';

interface RequestWithUser {
  headers: {
    authorization?: string;
  };
  user?: User;
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(@Inject(SUPABASE_CLIENT) private supabase: SupabaseClient) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token não fornecido');
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      throw new UnauthorizedException('Token não fornecido');
    }

    const {
      data: { user },
      error,
    } = await this.supabase.auth.getUser(token);

    if (error || !user) {
      throw new UnauthorizedException('Token inválido');
    }

    request.user = user;
    return true;
  }
}
