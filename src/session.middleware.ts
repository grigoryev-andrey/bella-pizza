import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { middleware } from 'supertokens-node/framework/express';

@Injectable()
export class SessionMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    middleware()(req, res, (err) => {
      if (err) {
        console.error('SuperTokens middleware error:', err);
        return res.status(500).json({ message: 'Session processing failed' });
      }
      next();
    });
  }
}
