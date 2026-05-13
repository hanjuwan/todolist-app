'use strict';

const path = require('path');
const dotenv = require('dotenv');
const { z } = require('zod');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const schema = z.object({
  POSTGRES_CONNECTION_STRING: z.string().min(1, 'POSTGRES_CONNECTION_STRING is required'),
  PORT: z.coerce.number().int().positive().default(3000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  CORS_ORIGIN: z.string().min(1).default('http://localhost:5173'),
  JWT_SECRET: z.string().min(16, 'JWT_SECRET must be at least 16 chars'),
  JWT_ACCESS_TOKEN_TTL: z.string().min(1).default('1h'),
  BCRYPT_COST: z.coerce.number().int().min(12, 'BCRYPT_COST must be >= 12').default(12),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  const issues = parsed.error.issues.map((i) => `  - ${i.path.join('.')}: ${i.message}`).join('\n');
  console.error(`[env] 환경변수 검증 실패:\n${issues}`);
  process.exit(1);
}

const env = Object.freeze({
  postgresConnectionString: parsed.data.POSTGRES_CONNECTION_STRING,
  port: parsed.data.PORT,
  nodeEnv: parsed.data.NODE_ENV,
  corsOrigin: parsed.data.CORS_ORIGIN,
  jwtSecret: parsed.data.JWT_SECRET,
  jwtAccessTokenTtl: parsed.data.JWT_ACCESS_TOKEN_TTL,
  bcryptCost: parsed.data.BCRYPT_COST,
  isProduction: parsed.data.NODE_ENV === 'production',
});

module.exports = env;
