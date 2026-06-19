import 'dotenv/config';
import app from './app';
import { logger } from './utils/logger';
import { db } from './db/client';
import { redis } from './db/redis';

const PORT = parseInt(process.env.PORT ?? '3001', 10);

async function main() {
  // Verify connections on startup
  await db.raw('SELECT 1');
  await redis.ping();
  logger.info('Database and Redis connections verified');

  const server = app.listen(PORT, () => {
    logger.info(`Server listening on port ${PORT}`);
  });

  const shutdown = async (signal: string) => {
    logger.info(`Received ${signal}, shutting down gracefully`);
    server.close(async () => {
      await db.destroy();
      await redis.quit();
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

main().catch((err) => {
  logger.error('Failed to start server', { error: err });
  process.exit(1);
});
