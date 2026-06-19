-- Migration: 001_initial_schema_up.sql
-- Creates the core tables for Pulse Rewards

BEGIN;

-- ── Users ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email           TEXT NOT NULL UNIQUE,
    password_hash   TEXT NOT NULL,
    role            TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'merchant', 'admin')),
    wallet_address  TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);

-- ── Campaigns ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS campaigns (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name            TEXT NOT NULL,
    description     TEXT,
    reward_rate     NUMERIC(18, 7) NOT NULL CHECK (reward_rate > 0),
    starts_at       TIMESTAMPTZ NOT NULL,
    ends_at         TIMESTAMPTZ NOT NULL,
    status          TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'expired')),
    contract_id     TEXT,          -- on-chain campaign ID once deployed
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT campaigns_date_order CHECK (ends_at > starts_at)
);

CREATE INDEX IF NOT EXISTS idx_campaigns_merchant ON campaigns (merchant_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status   ON campaigns (status);

-- ── Rewards ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS rewards (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    campaign_id     UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    amount          NUMERIC(18, 7) NOT NULL CHECK (amount > 0),
    wallet_address  TEXT NOT NULL,
    status          TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'failed')),
    tx_hash         TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Each user may claim a campaign only once
    CONSTRAINT rewards_unique_claim UNIQUE (user_id, campaign_id)
);

CREATE INDEX IF NOT EXISTS idx_rewards_user     ON rewards (user_id);
CREATE INDEX IF NOT EXISTS idx_rewards_campaign ON rewards (campaign_id);
CREATE INDEX IF NOT EXISTS idx_rewards_status   ON rewards (status);

-- ── Auto-update updated_at ─────────────────────────────────────
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_campaigns_updated_at
    BEFORE UPDATE ON campaigns
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_rewards_updated_at
    BEFORE UPDATE ON rewards
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMIT;
