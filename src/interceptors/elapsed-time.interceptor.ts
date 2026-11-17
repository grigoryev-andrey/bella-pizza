import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { Response, Request } from 'express';
import { GqlExecutionContext } from '@nestjs/graphql';
import { performance } from 'perf_hooks';

@Injectable()
export class ElapsedTimeInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const now = performance.now();
    const ctxType = context.getType<'http' | 'graphql'>();

    if (ctxType === 'http') {
      const httpCtx = context.switchToHttp();
      const req = httpCtx.getRequest<Request>();
      const res = httpCtx.getResponse<Response>();
      const isRender = this.isRenderRequest(req, context);

      if (req.headers.accept?.includes('text/event-stream')) {
        return next.handle();
      }

      return next.handle().pipe(
        tap(() => {
          console.log(
            `[${req.method}] ${req.url} took ${Number(performance.now() - now).toFixed(2)}ms`,
          );
        }),
        map((result) => {
          const elapsedStr = `${Number(performance.now() - now).toFixed(2)}ms`;

          if (res?.setHeader) {
            res.setHeader('X-Elapsed-Time', elapsedStr);
          }

          if (isRender && this.isRenderableResult(result)) {
            return {
              ...(result as { [key: string]: any }),
              elapsedTime: elapsedStr,
            };
          }

          return result as unknown;
        }),
      );
    }
    if (ctxType === 'graphql') {
      const gqlCtx = GqlExecutionContext.create(context);
      const info = gqlCtx.getInfo();

      return next.handle().pipe(
        tap(() => {
          const elapsed = performance.now() - now;
          console.log(`[GraphQL] ${info.fieldName} took ${elapsed}ms`);
        }),
      );
    }

    return next.handle();
  }

  private isRenderRequest(req: Request, context: ExecutionContext): boolean {
    if (req.headers.accept?.includes('text/html')) {
      return true;
    }

    const handler = context.getHandler();
    return Reflect.getMetadata('render', handler) !== undefined;
  }

  private isRenderableResult(result: any): boolean {
    return (
      typeof result === 'object' &&
      result !== null &&
      !(result instanceof Buffer)
    );
  }
}
