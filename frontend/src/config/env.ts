import { z } from 'zod';

const envSchema = z.object({
  NEXT_PUBLIC_API_URL: z
    .string()
    .url()
    .optional()
    .default('http://localhost:8000/api'),
  NEXT_PUBLIC_APP_ENV: z
    .enum(['development', 'production', 'staging', 'test'])
    .optional()
    .default('development'),
  NEXT_PUBLIC_WS_URL: z
    .string()
    .optional()
    .default('ws://localhost:8000/ws'),
});

const parsed = envSchema.safeParse({
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  NEXT_PUBLIC_APP_ENV: process.env.NEXT_PUBLIC_APP_ENV,
  NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL,
});

if (!parsed.success) {
  // Only warn — don't throw in dev so hot reload keeps working
  console.warn('⚠️  Environment variable issues:', parsed.error.format());
}

export const env = parsed.success
  ? parsed.data
  : {
      NEXT_PUBLIC_API_URL: 'http://localhost:8000/api',
      NEXT_PUBLIC_APP_ENV: 'development' as const,
      NEXT_PUBLIC_WS_URL: 'ws://localhost:8000/ws',
    };
