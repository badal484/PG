import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger, RequestMethod } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import compression from 'compression';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { validateEnv } from './config/env.validation';

// Validate env before anything else — fail fast with a clear message
validateEnv(process.env as Record<string, unknown>);

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const isProd = process.env.NODE_ENV === 'production';

  const app = await NestFactory.create(AppModule, {
    logger: isProd ? ['error', 'warn', 'log'] : ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  // ── Security ───────────────────────────────────────────────────────────────
  app.use(
    helmet({
      contentSecurityPolicy: isProd
        ? {
            directives: {
              defaultSrc: ["'self'"],
              scriptSrc: ["'self'", "'strict-dynamic'"],
              styleSrc: ["'self'", "'unsafe-inline'"],
              imgSrc: ["'self'", 'data:', 'https:'],
              connectSrc: ["'self'", 'https://api.razorpay.com', 'https://backend.aisensy.com'],
              frameSrc: ["'none'"],
              objectSrc: ["'none'"],
              upgradeInsecureRequests: isProd ? [] : null,
            },
          }
        : false, // Disable CSP in dev to allow Swagger UI inline scripts
      hsts: isProd ? { maxAge: 31_536_000, includeSubDomains: true, preload: true } : false,
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    }),
  );

  app.enableCors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      const allowed = (process.env.CORS_ORIGINS ?? 'http://localhost:3000').split(',').map((s) => s.trim());
      if (!origin || allowed.includes(origin) || !isProd) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: origin ${origin} not allowed`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-correlation-id'],
    exposedHeaders: ['x-correlation-id'],
  });

  // ── Compression ─────────────────────────────────────────────────────────────
  app.use(compression());

  // ── API Prefix ───────────────────────────────────────────────────────────────
  app.setGlobalPrefix('api/v1', {
    exclude: [
      { path: '/', method: RequestMethod.GET },
      { path: 'health', method: RequestMethod.GET },
    ],
  });

  // ── Global Pipes, Filters, Interceptors ──────────────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalInterceptors(new LoggingInterceptor());
  app.useGlobalInterceptors(new TransformInterceptor());

  // ── Swagger (dev + staging only) ──────────────────────────────────────────────
  if (!isProd) {
    const config = new DocumentBuilder()
      .setTitle('ROOMLY API')
      .setDescription(
        'ROOMLY — PG & Co-living Management Platform API\n\n' +
        'All routes except `/health` require a Bearer JWT.\n' +
        'Get a token via `POST /api/v1/auth/send-otp` → `POST /api/v1/auth/verify-otp`.',
      )
      .setVersion('1.0')
      .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' })
      .addTag('auth', 'OTP-based authentication')
      .addTag('properties', 'Property listing and management')
      .addTag('bookings', 'Tenant booking lifecycle')
      .addTag('payments', 'Razorpay payments and escrow')
      .addTag('pms', 'Property Management System')
      .addTag('admin', 'Admin-only operations')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: { persistAuthorization: true },
    });
  }

  // ── Start ─────────────────────────────────────────────────────────────────────
  const port = process.env.PORT ?? 4000;
  await app.listen(port);

  logger.log(`🚀  API running at http://localhost:${port}/api/v1`);
  if (!isProd) {
    logger.log(`📚  Swagger docs at http://localhost:${port}/api/docs`);
  }
}

bootstrap().catch((err) => {
  console.error('Fatal bootstrap error:', err);
  process.exit(1);
});
