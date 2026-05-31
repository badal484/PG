import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { v4 as uuidv4 } from 'uuid';
import { Request } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse();

    const correlationId = request.headers['x-correlation-id'] || uuidv4();
    request['correlationId'] = correlationId;
    response.setHeader('x-correlation-id', correlationId);

    const { method, originalUrl, ip } = request;
    const userAgent = request.get('user-agent') || '';
    const now = Date.now();

    return next.handle().pipe(
      tap(() => {
        const { statusCode } = response;
        const contentLength = response.get('content-length');
        const delay = Date.now() - now;
        
        this.logger.log(
          `[${correlationId}] ${method} ${originalUrl} ${statusCode} ${contentLength} - ${userAgent} ${ip} - ${delay}ms`,
        );
      }),
    );
  }
}
