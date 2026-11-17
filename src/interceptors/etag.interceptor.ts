import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Response, Request } from 'express';
import * as crypto from 'crypto';

@Injectable()
export class EtagInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const ifNoneMatch = request.headers['if-none-match'];

    if (request.headers.accept?.includes('text/event-stream')) {
      return next.handle();
    }

    return next.handle().pipe(
      tap((data: unknown) => {
        if (response.headersSent || data === null || data === undefined) {
          return;
        }

        try {
          const etag = this.generateEtag(data);
          response.setHeader('ETag', etag);

          if (ifNoneMatch === etag && !response.headersSent) {
            response.status(304).end();
          }
        } catch (error) {
          console.warn('ETag generation failed:', error);
        }
      }),
      map((data: unknown) => {
        if (response.headersSent) {
          return null;
        }
        return data;
      }),
    );
  }

  private generateEtag(data: unknown): string {
    const str = typeof data === 'string' ? data : JSON.stringify(data);
    const hash = crypto.createHash('sha1').update(str).digest('hex');
    return `W/"${hash}"`;
  }
}
