# ADR-001: Use Stellar Soroban for on-chain logic

**Status**: Accepted  
**Date**: 2024-01-01

## Context

The platform needs an on-chain token and campaign management layer that is:
- Cost-effective for small reward amounts (sub-cent transactions).
- Developer-friendly with a modern smart contract model.
- Interoperable with the wider Stellar ecosystem (Freighter, SEP standards).

## Decision

Use **Stellar** as the blockchain layer and **Soroban** (Stellar's Rust-based smart contract platform) for the token and campaign contracts.

## Rationale

| Factor | Stellar/Soroban | Ethereum/EVM | Solana |
|--------|----------------|--------------|--------|
| Tx fees | < $0.001 | $0.50–$50 | < $0.001 |
| TPS | ~1000 | ~15 (L1) | ~65000 |
| Language | Rust (safe, familiar) | Solidity | Rust |
| Wallet UX | Freighter (good) | MetaMask (good) | Phantom (good) |
| Horizon API | Native REST | Web3 | RPC-only |

Stellar's low fees make micro-reward use cases economically viable.

## Consequences

- Must maintain a Soroban contract alongside the off-chain API.
- Users need Freighter installed.
- Testnet funded by Friendbot for development — no cost.
