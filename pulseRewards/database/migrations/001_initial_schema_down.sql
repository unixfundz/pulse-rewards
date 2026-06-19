-- Migration: 001_initial_schema_down.sql
-- Rolls back the initial schema

BEGIN;

DROP TRIGGER IF EXISTS trg_rewards_updated_at   ON rewards;
DROP TRIGGER IF EXISTS trg_campaigns_updated_at ON campaigns;
DROP TRIGGER IF EXISTS trg_users_updated_at     ON users;
DROP FUNCTION  IF EXISTS set_updated_at();
DROP TABLE     IF EXISTS rewards   CASCADE;
DROP TABLE     IF EXISTS campaigns CASCADE;
DROP TABLE     IF EXISTS users     CASCADE;

COMMIT;
