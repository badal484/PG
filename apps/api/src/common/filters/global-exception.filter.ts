import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import {
  CloudWatchLogsClient,
  PutLogEventsCommand,
  CreateLogStreamCommand,
} from '@aws-sdk/client-cloudwatch-logs';

const cwClient = process.env.AWS_REGION
  ? new CloudWatchLogsClient({ region: process.env.AWS_REGION })
  : null;

const LOG_GROUP = process.env.CW_LOG_GROUP ?? '/roomly/api/errors';
const LOG_STREAM = `${process.env.NODE_ENV ?? 'development'}-${new Date().toISOString().slice(0, 10)}`;

async function sendToCloudWatch(message: string): Promise<void> {
  if (!cwClient) return;
  try {
    await cwClient.send(new PutLogEventsCommand({
      logGroupName: LOG_GROUP,
      logStreamName: LOG_STREAM,
      logEvents: [{ timestamp: Date.now(), message }],
    }));
  } catch {
    // CloudWatch logging failure must never affect the response
  }
}

// Best-effort stream creation at module load
if (cwClient) {
  cwClient.send(new CreateLogStreamCommand({
    logGroupName: LOG_GROUP,
    logStreamName: LOG_STREAM,
  })).catch(() => { /* stream may already exist */ });
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const correlationId = (request as any)['correlationId'] ?? request.headers['x-correlation-id'] ?? 'unknown';

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let code = 'INTERNAL_SERVER_ERROR';
    let details: unknown = null;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse() as any;
      message = typeof res === 'string' ? res : res.message ?? exception.message;
      code = (typeof res === 'object' && res.error) ? res.error : (typeof res === 'object' && res.code) ? res.code : exception.name;

      if (typeof res === 'object' && Array.isArray(res.message)) {
        details = res.message;
        message = 'Validation error';
        code = 'VALIDATION_ERROR';
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      code = exception.name;
    }

    const logLine = JSON.stringify({
      correlationId,
      method: request.method,
      url: request.originalUrl,
      status,
      code,
      message,
      ...(status >= 500 && exception instanceof Error
        ? { stack: exception.stack, body: this.sanitizeBody(request.body) }
        : {}),
    });

    if (status >= 500) {
      this.logger.error(`[${correlationId}] ${request.method} ${request.originalUrl} → ${status}: ${message}`,
        exception instanceof Error ? exception.stack : '');
      sendToCloudWatch(logLine);
    } else {
      this.logger.warn(`[${correlationId}] ${request.method} ${request.originalUrl} → ${status}: ${message}`);
    }

    response.status(status).json({
      success: false,
      error: { code, message, details },
      timestamp: new Date().toISOString(),
      path: request.url,
      correlationId,
    });
  }

  private sanitizeBody(body: Record<string, unknown>): Record<string, unknown> {
    if (!body || typeof body !== 'object') return {};
    const REDACT = new Set(['password', 'token', 'otp', 'secret', 'pan', 'aadhaar', 'cardNumber']);
    return Object.fromEntries(
      Object.entries(body).map(([k, v]) => [k, REDACT.has(k.toLowerCase()) ? '[REDACTED]' : v]),
    );
  }
}
