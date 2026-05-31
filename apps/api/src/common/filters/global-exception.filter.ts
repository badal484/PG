import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let code = 'INTERNAL_SERVER_ERROR';
    let details: any = null;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse: any = exception.getResponse();

      message =
        typeof exceptionResponse === 'string'
          ? exceptionResponse
          : exceptionResponse.message || exception.message;

      code =
        typeof exceptionResponse === 'object' && exceptionResponse.error
          ? exceptionResponse.error
          : exception.name;

      if (typeof exceptionResponse === 'object' && exceptionResponse.message && Array.isArray(exceptionResponse.message)) {
        details = exceptionResponse.message;
        message = 'Validation Error';
        code = 'VALIDATION_ERROR';
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      code = exception.name;
    }

    this.logger.error(
      `${request.method} ${request.originalUrl} ${status} error: ${exception instanceof Error ? exception.message : 'Unknown'}`,
      exception instanceof Error ? exception.stack : '',
    );

    response.status(status).json({
      success: false,
      error: {
        code,
        message,
        details,
      },
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
