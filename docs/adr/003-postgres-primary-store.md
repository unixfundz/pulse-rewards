# ADR-003: PostgreSQL as primary data store

**Status**: Accepted  
**Date**: 2024-01-01

## Context

The application needs a relational store for users, campaigns, and reward records. The on-chain state is the source of truth for balances; the database mirrors reward status for fast querying.

## Decision

Use **PostgreSQL 16** as the primary relational database.

## Rationale

- Strong ACID guarantees — critical for deduplicating reward claims.
- `UNIQUE (user_id, campaign_id)` constraint on `rewards` table prevents double-claims at the DB level, not just application level.
- Rich JSON support for future schema flexibility.
- Mature ecosystem: Knex, pg, excellent AWS RDS support.

## Consequences

- Requires a migration step on deploy.
- Must maintain migration files in `pulseRewards/database/migrations/`.
- On-chain state and DB state can diverge if the Stellar transaction succeeds but the DB update fails — mitigated by setting reward status to `pending` before the on-chain call and updating asynchronously.
