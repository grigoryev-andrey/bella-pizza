import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthService } from '../auth.service';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Request, Response } from 'express';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles: string[] =
      this.reflector.get<string[]>('roles', context.getHandler()) ?? ['admin'];

    if (requiredRoles.length === 0) {
      return true;
    }

    let req: Request;
    let res: Response;
    if (context.getType() === 'http') {
      const ctx = context.switchToHttp();
      req = ctx.getRequest<Request>();
      res = ctx.getResponse<Response>();
    } else {
      const ctx = GqlExecutionContext.create(context);
      req = ctx.getContext<{ req: Request }>().req;
      res = ctx.getContext<{ res: Response }>().res;
    }

    const userId = (req as any).user?.userId;

    if (!userId) {
      throw new ForbiddenException('Пользователь не аутентифицирован');
    }

    const user = await this.authService.getUserFromRequest(req, res);
    if (!user || !requiredRoles.includes(user.role)) {
      throw new ForbiddenException('Недостаточно прав');
    }

    return true;
  }
}
