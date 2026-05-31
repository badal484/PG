import { z } from 'zod';

// ── Schema ───────────────────────────────────────────────────────────────────

const envSchema = z.object({
  // App
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(4000),

  // Database
  DATABASE_URL: z.string().url({ message: 'DATABASE_URL must be a valid PostgreSQL connection URL' }),

  // Redis
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.coerce.number().default(6379),
  REDIS_PASSWORD: z.string().optional(),

  // JWT
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('15m'),
  REFRESH_TOKEN_SECRET: z.string().min(32, 'REFRESH_TOKEN_SECRET must be at least 32 characters'),

  // AWS (optional — logged as warning if missing, not fatal in dev)
  AWS_REGION: z.string().default('ap-south-1'),
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  AWS_S3_BUCKET: z.string().optional(),
  CLOUDFRONT_URL: z.string().optional(),
  SES_FROM_EMAIL: z.string().email().optional(),
  CW_LOG_GROUP: z.string().optional(),

  // Razorpay (optional in dev)
  RAZORPAY_KEY_ID: z.string().optional(),
  RAZORPAY_KEY_SECRET: z.string().optional(),
  RAZORPAY_WEBHOOK_SECRET: z.string().optional(),
  RAZORPAY_PLATFORM_ACCOUNT: z.string().optional(),
  RAZORPAY_PLATFORM_ACCOUNT_NUMBER: z.string().optional(),

  // Algolia (optional)
  ALGOLIA_APP_ID: z.string().optional(),
  ALGOLIA_ADMIN_KEY: z.string().optional(),
  ALGOLIA_INDEX_NAME: z.string().default('properties'),

  // AiSensy WhatsApp (optional)
  AISENSY_API_KEY: z.string().optional(),
  AISENSY_BASE_URL: z.string().url().default('https://backend.aisensy.com/campaign/t1/api/v2'),

  // MSG91 SMS (optional)
  MSG91_AUTH_KEY: z.string().optional(),
  MSG91_SENDER_ID: z.string().default('ROOMLY'),
  MSG91_OTP_TEMPLATE_ID: z.string().optional(),

  // CORS
  CORS_ORIGINS: z.string().default('http://localhost:3000'),
});

export type EnvConfig = z.infer<typeof envSchema>;

// ── Validator ────────────────────────────────────────────────────────────────

const REQUIRED_IN_PRODUCTION: (keyof EnvConfig)[] = [
  'DATABASE_URL',
  'JWT_SECRET',
  'REFRESH_TOKEN_SECRET',
  'AWS_ACCESS_KEY_ID',
  'AWS_SECRET_ACCESS_KEY',
  'AWS_S3_BUCKET',
  'SES_FROM_EMAIL',
  'RAZORPAY_KEY_ID',
  'RAZORPAY_KEY_SECRET',
  'RAZORPAY_WEBHOOK_SECRET',
  'AISENSY_API_KEY',
  'MSG91_AUTH_KEY',
];

export function validateEnv(config: Record<string, unknown>): EnvConfig {
  const result = envSchema.safeParse(config);

  if (!result.success) {
    const errors = result.error.errors
      .map((e) => `  • ${e.path.join('.')}: ${e.message}`)
      .join('\n');

    throw new Error(
      `\n❌ Environment validation failed — the API cannot start.\n\nErrors:\n${errors}\n\nCheck your .env file against .env.example\n`,
    );
  }

  const env = result.data;

  if (env.NODE_ENV === 'production') {
    const missing = REQUIRED_IN_PRODUCTION.filter((key) => !env[key]);
    if (missing.length > 0) {
      throw new Error(
        `\n❌ Missing required production environment variables:\n${missing.map((k) => `  • ${k}`).join('\n')}\n`,
      );
    }
  } else {
    const optionalMissing = REQUIRED_IN_PRODUCTION.filter((key) => !env[key]);
    if (optionalMissing.length > 0) {
      console.warn(
        `\n⚠️  [ENV] Development mode — the following production variables are not set:\n${optionalMissing.map((k) => `  • ${k}`).join('\n')}\n  External services (WhatsApp, SMS, S3, Razorpay) will use mock/dev mode.\n`,
      );
    }
  }

  return env;
}
