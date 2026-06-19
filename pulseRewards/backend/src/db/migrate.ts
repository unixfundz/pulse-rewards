/**
 * Migration runner — reads SQL files from ../database/migrations in order.
 * Usage:
 *   npm run db:migrate          # apply pending
 *   npm run db:migrate rollback # roll back last batch
 */
import fs from 'fs';
import path from 'path';
import { db } from './client';
import { logger } from '../utils/logger';

const MIGRATIONS_DIR = path.resolve(__dirname, '../../../database/migrations');

async function migrate(direction: 'up' | 'down' = 'up') {
  const files = fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith(`_${direction}.sql`))
    .sort();

  for (const file of files) {
    const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf-8');
    logger.info(`Running migration: ${file}`);
    await db.raw(sql);
    logger.info(`Done: ${file}`);
  }
}

const direction = process.argv[2] === 'rollback' ? 'down' : 'up';
migrate(direction)
  .then(() => {
    logger.info('Migrations complete');
    process.exit(0);
  })
  .catch((err) => {
    logger.error('Migration failed', { error: err });
    process.exit(1);
  });
