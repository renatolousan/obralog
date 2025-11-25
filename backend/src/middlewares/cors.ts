import cors, { type CorsOptions } from 'cors';

export function parseAllowedOrigins(raw?: string | null) {
  if (!raw) return undefined;
  const origins = raw
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
  return origins.length ? origins : undefined;
}

const allowedOrigins = parseAllowedOrigins(process.env.CORS_ALLOWED_ORIGINS);

export const corsOptions: CorsOptions = {
  origin: allowedOrigins ?? true,
  credentials: true,
};

export const corsMiddleware = cors(corsOptions);
