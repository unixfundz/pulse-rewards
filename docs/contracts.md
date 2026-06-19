# Smart Contracts

## Deployed addresses

| Contract | Testnet | Mainnet |
|----------|---------|---------|
| `pulse_token` | TBD — update after deploy | TBD |
| `pulse_rewards` | TBD — update after deploy | TBD |

## Building

```bash
./scripts/build-contracts.sh
```

Output: `contracts/target/wasm32v1-none/release/pulse_token.wasm` etc.

## Deploying (testnet)

```bash
stellar contract deploy \
  --wasm contracts/target/wasm32v1-none/release/pulse_token.wasm \
  --source <ISSUER_SECRET> \
  --network testnet

# Initialize after deploy
stellar contract invoke \
  --id <TOKEN_CONTRACT_ID> \
  --source <ISSUER_SECRET> \
  --network testnet \
  -- initialize \
  --admin <ISSUER_PUBLIC> \
  --decimal 7 \
  --name "Pulse Rewards Token" \
  --symbol PULSE
```

Repeat for `pulse_rewards.wasm`. Then set `TOKEN_CONTRACT_ID` and `REWARDS_CONTRACT_ID` in `.env`.

## Upgrading

Soroban contracts support WASM hash upgrades via `stellar contract install` + `upgrade`. The admin role controls upgrades.

1. Build the new WASM.
2. Install to ledger: `stellar contract install --wasm new.wasm --network testnet`
3. Invoke the contract's `upgrade` function with the new WASM hash.

## Contract ABI

### `pulse_token`

| Function | Args | Auth | Returns |
|----------|------|------|---------|
| `initialize` | `admin, decimal, name, symbol` | admin | — |
| `mint` | `to: Address, amount: i128` | admin | — |
| `admin` | — | — | `Address` |
| `set_admin` | `new_admin: Address` | admin + new_admin | — |

### `pulse_rewards`

| Function | Args | Auth | Returns |
|----------|------|------|---------|
| `initialize` | `admin: Address` | admin | — |
| `create_campaign` | `merchant, token, reward_per_claim, budget, starts_at, ends_at` | merchant | `u64` (campaign ID) |
| `claim` | `claimant: Address, campaign_id: u64` | claimant | — |
| `deactivate` | `caller: Address, campaign_id: u64` | merchant \| admin | — |
| `get_campaign` | `campaign_id: u64` | — | `CampaignData` |
