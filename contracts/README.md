# Smart Contracts

This directory contains the Soroban smart contracts for Pulse Rewards.

## Contracts

| Contract | Description |
|----------|-------------|
| `pulse_token` | SAC-compatible PULSE token (mint, burn, admin) |
| `pulse_rewards` | Campaign registry & reward claim logic |

## Build

```bash
# From repo root
./scripts/build-contracts.sh
```

Output: `contracts/target/wasm32v1-none/release/*.wasm`

## Test

```bash
./scripts/test-contracts.sh
# or directly:
cd contracts && cargo test --workspace
```

## Deploy (testnet)

```bash
stellar contract deploy \
  --wasm target/wasm32v1-none/release/pulse_token.wasm \
  --source <your-secret-key> \
  --network testnet

stellar contract deploy \
  --wasm target/wasm32v1-none/release/pulse_rewards.wasm \
  --source <your-secret-key> \
  --network testnet
```

Set the returned contract IDs in `pulseRewards/.env`:
```
TOKEN_CONTRACT_ID=<token-contract-id>
REWARDS_CONTRACT_ID=<rewards-contract-id>
```

## Contract addresses

| Network | Token Contract | Rewards Contract |
|---------|---------------|-----------------|
| Testnet | TBD | TBD |
| Mainnet | TBD | TBD |

See [docs/contracts.md](../docs/contracts.md) for upgrade instructions.
