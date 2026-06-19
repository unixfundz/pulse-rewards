# Pulse Rewards

[![CI](https://github.com/unixfundz/pulse-rewards/actions/workflows/ci.yml/badge.svg)](https://github.com/unixfundz/pulse-rewards/actions/workflows/ci.yml)
[![License: Apache 2.0](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](LICENSE)
[![WCAG 2.1 AA](https://img.shields.io/badge/WCAG-2.1_AA-green.svg)](docs/security/accessibility.md)
[![Stellar](https://img.shields.io/badge/Stellar-Soroban-7C3AED.svg)](https://stellar.org)

**A blockchain-powered loyalty platform that lets businesses issue tokenized rewards on the Stellar network.**

Pulse Rewards replaces fragmented, opaque loyalty programs with on-chain token issuance. Merchants create reward campaigns; users earn, hold, and redeem PULSE tokens directly from a crypto wallet. Every transaction is verifiable on Stellar — no black-box points systems.

---

## Who this repo is for

| Audience | What you'll find here |
|---|---|
| Developers | Full-stack source, contract ABIs, integration guides |
| Merchants | Self-hosting instructions, campaign API docs |
| Contributors | Issue tracker, contribution guide, architecture docs |

---

## Architecture

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

| Path | What lives there |
|---|---|
| `pulseRewards/frontend/` | Next.js PWA — pages, components, stores |
| `pulseRewards/backend/` | Express API — routes, services, DB repos |
| `contracts/` | Soroban smart contracts (Rust) |
| `pulseRewards/database/` | SQL migrations (run in order) |
| `monitoring/` | Prometheus, Grafana, Alertmanager configs |
| `infra/` | Terraform modules (VPC, RDS, EC2, ElastiCache) |
| `k8s/` | Kubernetes manifests + Helm chart |
| `docs/` | All extended documentation |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Blockchain | Stellar |
| Smart Contracts | Soroban (Rust, `wasm32v1-none`) |
| Frontend | Next.js 14, React, Tailwind CSS, Zustand |
| Backend | Node.js 20, Express, PostgreSQL 16, Redis 7 |
| Auth | JWT (access + refresh tokens) |
| Wallet | Freighter browser extension |
| Infra | Docker Compose, Kubernetes, Helm, Terraform |
| Monitoring | Prometheus, Grafana, Alertmanager |
| CI/CD | GitHub Actions |

---

## Quick Start

> Gets you running locally in under 15 minutes.

### Prerequisites

| Tool | Minimum version | Verify | Install |
|---|---|---|---|
| Docker Desktop | 20.10 / Desktop 4.x | `docker --version` | [docker.com](https://docker.com) |
| Node.js | 20.x LTS | `node --version` | [nodejs.org](https://nodejs.org) |
| npm | 10.x | `npm --version` | bundled with Node 20 |
| Rust (stable) | 1.75+ | `rustc --version` | `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs \| sh` |
| Stellar CLI | 21+ | `stellar --version` | installed by `setup-soroban-dev.sh` |
| Freighter | latest | — | [freighter.app](https://freighter.app) |

### 1 — Clone

```bash
git clone https://github.com/unixfundz/pulse-rewards.git
cd pulse-rewards
```

### 2 — Configure environment

```bash
cp pulseRewards/.env.example pulseRewards/.env
```

Edit `pulseRewards/.env` and fill in the required values:

| Variable | What to set |
|---|---|
| `JWT_PRIVATE_KEY` / `JWT_PUBLIC_KEY` | `node pulseRewards/backend/scripts/generate-jwt-keys.js` |
| `FIELD_ENCRYPTION_KEY` | `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `ISSUER_PUBLIC` / `ISSUER_SECRET` | Generate a testnet keypair at [laboratory.stellar.org](https://laboratory.stellar.org) |
| `DISTRIBUTION_PUBLIC` / `DISTRIBUTION_SECRET` | Second keypair from the same tool |

Everything else defaults to Docker Compose service addresses and can be left as-is for local development.

### 3 — Start the full stack

```bash
docker compose up --build
```

Services:

| Service | URL | Notes |
|---|---|---|
| Frontend | http://localhost:3000 | Next.js — hot reload active |
| Backend API | http://localhost:3001 | Express — hot reload via nodemon |
| Health check | http://localhost:3001/health | Returns `{"status":"ok"}` |
| Nginx gateway | http://localhost:8080 | Reverse proxy |
| PostgreSQL | localhost:5432 | Migrations run on first start |
| Redis | localhost:6379 | — |
| Stellar standalone | http://localhost:8000 | Soroban RPC at `/rpc` |

Verify:

```bash
curl http://localhost:3001/health   # {"status":"ok"}
```

### 4 — Set up Soroban contracts

```bash
./scripts/setup-soroban-dev.sh   # installs wasm target, Stellar CLI, registers local network
./scripts/build-contracts.sh     # compiles contracts → target/wasm32v1-none/release/*.wasm
./scripts/test-contracts.sh      # runs Rust unit tests
```

### 5 — Run application tests

```bash
cd pulseRewards
npm run test:backend
npm run test:frontend
```

---

## Common Setup Issues

<details>
<summary>Port already in use</summary>

```bash
sudo lsof -i :5432   # find the process
# change the port mapping in docker-compose.yml: "5433:5432"
```
</details>

<details>
<summary>Missing or invalid .env file</summary>

```bash
cp pulseRewards/.env.example pulseRewards/.env
node pulseRewards/backend/scripts/generate-jwt-keys.js
```
</details>

<details>
<summary>Rust build fails: can't find crate</summary>

```bash
rustup target add wasm32v1-none
rustup update stable
```
</details>

---

## Contributing

1. Find or create an issue — all work tracked in GitHub Issues
2. Branch off `main`: `feat/<description>`, `fix/<description>`, `docs/<description>`
3. Run checks before pushing:
   ```bash
   npm run lint && npm run test
   cargo fmt --all && cargo clippy -- -D warnings && cargo test
   ```
4. Open a PR against `main` — fill in the PR template and link the issue
5. Two approvals required before merge. PRs are squash-merged.

See [CONTRIBUTING.md](CONTRIBUTING.md) · [docs/code-style.md](docs/code-style.md)

---

## Documentation Index

| Document | Description |
|---|---|
| [docs/architecture.md](docs/architecture.md) | Detailed system architecture |
| [docs/adr/README.md](docs/adr/README.md) | Architecture decision records |
| [docs/contracts.md](docs/contracts.md) | Contract addresses, deploy & upgrade instructions |
| [docs/api/README.md](docs/api/README.md) | REST API overview |
| [docs/api/openapi.json](docs/api/openapi.json) | OpenAPI 3.0 spec |
| [docs/security/README.md](docs/security/README.md) | Security overview |
| [docs/stellar/integration.md](docs/stellar/integration.md) | Stellar / Horizon integration guide |
| [docs/stellar/freighter-guide.md](docs/stellar/freighter-guide.md) | Freighter wallet integration |
| [docs/ops/runbook.md](docs/ops/runbook.md) | Operations runbook |
| [monitoring/README.md](monitoring/README.md) | Monitoring stack setup |
| [ROADMAP.md](ROADMAP.md) | Roadmap and priorities |
| [SECURITY.md](SECURITY.md) | Security policy and disclosure |

---

## License

Apache License 2.0 — see [LICENSE](LICENSE) for full terms.
