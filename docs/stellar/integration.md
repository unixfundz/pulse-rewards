# Stellar Integration Guide

## Overview

Pulse Rewards uses Stellar for:
1. **PULSE token** — a Stellar asset issued by the platform keypair.
2. **Reward transfers** — distribution keypair sends PULSE to user wallets via Horizon.
3. **Soroban contracts** — optional on-chain campaign logic (see `contracts/`).

## Keypair roles

| Keypair | Role | Where used |
|---------|------|-----------|
| Issuer | Creates the PULSE asset | `ISSUER_PUBLIC` / `ISSUER_SECRET` in `.env` |
| Distribution | Holds and sends PULSE | `DISTRIBUTION_PUBLIC` / `DISTRIBUTION_SECRET` |

Generate testnet keypairs at [laboratory.stellar.org](https://laboratory.stellar.org/#account-creator).

## Funding accounts (testnet)

```bash
# Fund issuer
curl "https://friendbot.stellar.org?addr=<ISSUER_PUBLIC>"

# Fund distribution
curl "https://friendbot.stellar.org?addr=<DISTRIBUTION_PUBLIC>"
```

## Creating a trustline

Before a user can receive PULSE, their wallet must have a trustline:

```javascript
import { Asset, Operation, TransactionBuilder } from '@stellar/stellar-sdk';

const pulseAsset = new Asset('PULSE', process.env.ISSUER_PUBLIC);

// User-signed transaction (via Freighter)
const tx = new TransactionBuilder(userAccount, { fee, networkPassphrase })
  .addOperation(Operation.changeTrust({ asset: pulseAsset }))
  .setTimeout(30)
  .build();
```

## Sending PULSE (backend)

The backend `StellarService.transferPulseToken()` handles this using the distribution keypair.  
See `pulseRewards/backend/src/services/stellar.ts`.

## Networks

| Network | Horizon URL | RPC URL |
|---------|------------|---------|
| Testnet | https://horizon-testnet.stellar.org | https://soroban-testnet.stellar.org |
| Mainnet | https://horizon.stellar.org | https://soroban.stellar.org |
| Local (Docker) | http://localhost:8000 | http://localhost:8000/rpc |

## Error handling

| Horizon error code | Meaning | Fix |
|-------------------|---------|-----|
| `op_no_trust` | Recipient has no PULSE trustline | Ask user to add trustline via Freighter |
| `op_underfunded` | Distribution account low on PULSE | Top up distribution account |
| `tx_bad_seq` | Sequence number conflict | Retry with fresh account load |

## Freighter integration

See [freighter-guide.md](freighter-guide.md) for the full frontend wallet integration guide.
