import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { getSession } from 'supertokens-node/recipe/session';
import { Request, Response } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
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

    try {
      const session = await getSession(req, res);

      if (!session) {
        return this.handleUnauthorized(context, req, res, 'Сессия не найдена');
      }

      (req as any).user = {
        userId: session.getUserId(),
      };
      return true;
    } catch {
      return this.handleUnauthorized(
        context,
        req,
        res,
        'Ошибка аутентификации',
      );
    }
  }

  private handleUnauthorized(
    context: ExecutionContext,
    req: Request,
    res: Response,
    message: string,
  ): boolean {
    if (context.getType() === 'http') {
      if (req.headers.accept?.includes('text/event-stream')) {
        throw new UnauthorizedException(message);
      }
      res.redirect('/');
      return false;
    } else {
      throw new UnauthorizedException(message);
    }
  }
}
