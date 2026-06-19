# REST API

Base URL: `https://api.pulse-rewards.io` (production) · `http://localhost:3001` (local)

All endpoints accept and return JSON. Authenticated endpoints require:
```
Authorization: Bearer <access_token>
```

## Endpoints

### Auth

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/register` | — | Register a new user |
| POST | `/api/auth/login` | — | Log in, returns tokens |
| POST | `/api/auth/refresh` | — | Rotate refresh token |
| POST | `/api/auth/logout` | ✓ | Revoke refresh token |

### Campaigns

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/campaigns` | — | List active campaigns |
| GET | `/api/campaigns/:id` | — | Get a single campaign |
| POST | `/api/campaigns` | merchant | Create campaign |
| PATCH | `/api/campaigns/:id/deactivate` | merchant | Deactivate campaign |

### Rewards

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/rewards` | ✓ | User's reward history |
| POST | `/api/rewards/claim` | ✓ | Claim a reward |

### Wallet

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/wallet/:address/balance` | ✓ | PULSE balance for address |
| GET | `/api/wallet/:address/transactions` | ✓ | Recent transactions |

### Health

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/health` | — | Liveness check |

## Full OpenAPI spec

See [openapi.json](openapi.json) for the complete OpenAPI 3.0 specification.

## Error format

All errors return:
```json
{ "error": "Human-readable message" }
```

Standard HTTP status codes apply: 400 (validation), 401 (unauthenticated), 403 (forbidden), 404 (not found), 409 (conflict), 500 (server error).
