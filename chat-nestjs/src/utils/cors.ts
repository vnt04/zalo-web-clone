const DEFAULT_CORS_ORIGIN = 'http://localhost:3000';

/**
 * Read by the @WebSocketGateway decorator, which is evaluated before
 * ConfigModule loads .env — so CORS_ORIGIN only takes effect when it comes from
 * the real process environment (docker compose), not from .env.development.
 */
export function getCorsOrigins(): string[] {
  return (process.env.CORS_ORIGIN || DEFAULT_CORS_ORIGIN)
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}
