import Knex from 'knex';

if (!process.env.DATABASE_URL) {
  throw new Error('Missing required env var: DATABASE_URL');
}

export const db = Knex({
  client: 'pg',
  connection: process.env.DATABASE_URL,
  pool: { min: 2, max: 10 },
  acquireConnectionTimeout: 10_000,
});
