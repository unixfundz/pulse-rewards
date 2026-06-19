import Redis from 'ioredis';
import { logger } from '../utils/logger';

if (!process.env.REDIS_URL) {
  throw new Error('Missing required env var: REDIS_URL');
}

export const redis = new Redis(process.env.REDIS_URL, {
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  lazyConnect: false,
});

redis.on('error', (err) => logger.error('Redis error', { error: err }));
redis.on('connect', () => logger.info('Redis connected'));
