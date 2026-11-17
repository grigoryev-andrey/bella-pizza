import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { EntityNotFoundError, QueryFailedError } from 'typeorm';

interface ExceptionResponse {
  message?: string | string[];
  error?: string;
  [key: string]: any;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);
  private readonly ignoredUrls = [
    '/.well-known/appspecific/com.chrome.devtools.json',
  ];

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    if (response.headersSent) {
      return;
    }

    if (!request || !response) {
      this.logger.error(
        `Non-HTTP exception intercepted: ${exception instanceof Error ? exception.message : exception}`,
      );

      return;
    }

    if (this.shouldIgnoreRequest(request.url)) {
      response.status(HttpStatus.NOT_FOUND).end();
      return;
    }

    let status: HttpStatus;
    let message: string | object;
    let error: string;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
        error = exception.message;
      } else {
        const exceptionResponseObj = exceptionResponse as ExceptionResponse;
        message = exceptionResponseObj.message || exceptionResponse;
        error = exceptionResponseObj.error || exception.name;
      }
    } else if (exception instanceof EntityNotFoundError) {
      status = HttpStatus.NOT_FOUND;
      message = 'Requested entity not found in database';
      error = 'Database Error';

      this.logger.error(
        `Database error: ${exception.message}`,
        exception.stack,
      );
    } else if (exception instanceof QueryFailedError) {
      status = HttpStatus.BAD_REQUEST;
      message = 'Database operation failed';
      error = 'Database Error';

      this.logger.error(
        `Database error: ${exception.message}`,
        exception.stack,
      );
    } else if (exception instanceof Error) {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Internal server error';
      error = exception.name;
      this.logger.error(
        `Unhandled exception: ${exception.message}`,
        exception.stack,
      );
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Internal server error';
      error = 'Internal Server Error';

      this.logger.error(
        `Unexpected error: ${exception instanceof Error ? exception.message : 'Unknown error'}`,
        exception instanceof Error ? exception.stack : '',
      );
    }

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message: message,
      error: error,
    };

    this.logger.error(
      `${request.method} ${request.url} ${status} - ${JSON.stringify(errorResponse)}`,
    );

    response.status(status).json(errorResponse);
  }

  private shouldIgnoreRequest(url: string): boolean {
    return this.ignoredUrls.some(
      (ignoredUrl) => url.includes(ignoredUrl) || url.startsWith(ignoredUrl),
    );
  }
}
