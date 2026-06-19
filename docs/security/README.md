# Security

## Authentication model

- **RS256 JWT** — access tokens (15 min TTL) + refresh tokens (7 days, one-time use).
- Refresh tokens stored as Redis keys; deleting the key immediately revokes.
- Passwords hashed with **bcrypt** (cost factor 12).

## Transport security

- TLS enforced via Nginx in production (cert-manager + Let's Encrypt).
- `Strict-Transport-Security` header set.
- All Stellar API calls use HTTPS.

## Input validation

- All API inputs validated with `express-validator` before reaching business logic.
- UUID parameters validated via middleware — no raw user input reaches the DB.
- SQL injection prevented by parameterized queries (Knex).

## Secrets management

- No secrets in source code — all loaded from environment variables.
- Production secrets stored in Kubernetes Secrets (recommend external-secrets-operator or Vault).
- `.env` files excluded from git via `.gitignore`.

## Dependency security

- `npm audit` runs in CI — HIGH/CRITICAL findings block merge.
- `dependabot` configured for weekly dependency updates.
- Trivy filesystem scan runs on every PR.
- CodeQL static analysis runs on every push to `main`.

## Smart contract security

- All contract functions require explicit `require_auth()` from the caller.
- `UNIQUE (user_id, campaign_id)` enforced at both DB and contract level.
- Campaign budget held in contract escrow — merchant cannot withdraw mid-campaign.
- Overflow checks enabled in release profile (`overflow-checks = true`).

## Reporting vulnerabilities

See [SECURITY.md](../../SECURITY.md).

## Threat model

| Threat | Mitigation |
|--------|-----------|
| Token theft | Short TTL, HTTPS only, refresh rotation |
| SQL injection | Parameterized queries (Knex) |
| XSS | React escapes by default; CSP headers via Nginx |
| CSRF | JWT in Authorization header (not cookies) |
| Double-claim | DB unique constraint + contract idempotency check |
| Key compromise | Stellar keypairs in secrets only; rotate via new distribution keypair |
