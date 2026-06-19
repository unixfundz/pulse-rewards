# Architecture

## Overview

Pulse Rewards is a three-tier web application with an on-chain layer provided by the Stellar blockchain (Soroban smart contracts).

```
┌─────────────────────────────────────────────────────────────┐
│                        Pulse Rewards                        │
│                                                             │
│  ┌──────────────┐   ┌──────────────┐   ┌───────────────┐  │
│  │  Next.js 14  │──▶│  Express API │──▶│  PostgreSQL   │  │
│  │   Frontend   │   │   Backend    │   │   + Redis     │  │
│  └──────────────┘   └──────┬───────┘   └───────────────┘  │
│                            │                               │
│                     ┌──────▼───────┐                       │
│                     │   Stellar    │                       │
│                     │  (Soroban)   │                       │
│                     └──────────────┘                       │
└─────────────────────────────────────────────────────────────┘
```

## Components

### Frontend (`pulseRewards/frontend/`)
- **Next.js 14** (App Router) deployed as a standalone Node.js server.
- **Zustand** for client-side state (auth, wallet).
- **Tailwind CSS** for styling — WCAG 2.1 AA compliant.
- Connects to Stellar via **Freighter** browser extension (no private keys in browser).

### Backend (`pulseRewards/backend/`)
- **Express** REST API — stateless, JWT-authenticated.
- **PostgreSQL 16** — canonical store for users, campaigns, reward records.
- **Redis 7** — refresh token store, rate-limit counters, short-lived caches.
- Talks to Stellar Horizon for balance queries and token transfers.

### Smart Contracts (`contracts/`)
- **`pulse_token`** — SAC-compatible fungible token (PULSE).
- **`pulse_rewards`** — Campaign registry; manages on-chain claim logic and budget escrow.
- Compiled to `wasm32v1-none` and deployed to Soroban.

### Infrastructure
- Local dev: **Docker Compose**.
- Production: **Kubernetes** (manifests + Helm) on any CNCF-compliant cluster.
- AWS infra: **Terraform** modules for VPC, RDS, ElastiCache.
- Observability: **Prometheus + Grafana + Alertmanager**.

## Data Flow — Reward Claim

```
User ──[POST /api/rewards/claim]──▶ Backend
                                       │
                             Validate + check DB
                                       │
                            Insert rewards (pending)
                                       │
                       StellarService.transferPulseToken()
                                       │
                          Horizon submits transaction
                                       │
                       Update rewards.status = confirmed
                                       │◀── tx_hash stored
User ◀──────────────── 202 Accepted ───┘
```

## Security boundaries

| Layer | Trust level |
|-------|-------------|
| Frontend | Untrusted — all inputs validated on backend |
| Backend | Semi-trusted — validates JWTs, sanitizes inputs |
| Database | Trusted — accessed only by backend |
| Stellar network | Public, append-only — used as source of truth for balances |
| Soroban contracts | Trustless — logic enforced on-chain |

See [docs/security/README.md](security/README.md) for the full security model.
