# Freighter Wallet Integration

## What is Freighter?

[Freighter](https://freighter.app) is a browser extension wallet for Stellar. Pulse Rewards uses it so users never expose their private keys to the application.

## Installation

Users must install the Freighter extension from [freighter.app](https://freighter.app) before connecting their wallet.

## Detection

```typescript
const isFreighterInstalled = () => typeof window.freighter !== 'undefined';
```

## Connecting

```typescript
const connectWallet = async () => {
  if (!window.freighter) throw new Error('Freighter not installed');
  const isConnected = await window.freighter.isConnected();
  if (!isConnected) throw new Error('User declined connection');
  const publicKey = await window.freighter.getPublicKey();
  return publicKey;
};
```

## Signing transactions

```typescript
import { signTransaction } from '@stellar/freighter-api';

const signedXdr = await signTransaction(transactionXdr, {
  network: 'TESTNET', // or 'PUBLIC'
});
```

## Network detection

```typescript
const network = await window.freighter.getNetwork();
// Returns 'TESTNET' or 'PUBLIC'
```

Pulse Rewards checks that the user's Freighter network matches `NEXT_PUBLIC_STELLAR_NETWORK` and shows an error if they differ.

## Common errors

| Error | Cause | Resolution |
|-------|-------|-----------|
| `Freighter not installed` | Extension missing | Redirect to freighter.app |
| `User declined` | User rejected popup | Show retry button |
| `Network mismatch` | Freighter on wrong network | Ask user to switch in extension settings |

## Trustline requirement

Users must add a PULSE trustline before receiving tokens. The frontend detects missing trustlines from Horizon `op_no_trust` errors and shows a trustline setup prompt.
