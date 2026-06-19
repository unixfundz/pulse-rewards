#!/usr/bin/env bash
# setup-soroban-dev.sh — Install Rust wasm target + Stellar CLI, register local network
set -euo pipefail

STELLAR_CLI_VERSION="21.3.1"
WASM_TARGET="wasm32v1-none"

echo "▶ Adding Rust target: ${WASM_TARGET}"
rustup target add "${WASM_TARGET}"
rustup update stable

echo "▶ Installing Stellar CLI v${STELLAR_CLI_VERSION}"
cargo install --locked stellar-cli@"${STELLAR_CLI_VERSION}" --features opt

echo "▶ Registering 'local' Stellar network"
stellar network add \
  --global local \
  --rpc-url http://localhost:8000/soroban/rpc \
  --network-passphrase "Standalone Network ; February 2017" \
  || echo "  (network already registered)"

echo "✓ Soroban dev environment ready"
echo ""
echo "Next steps:"
echo "  ./scripts/build-contracts.sh"
echo "  ./scripts/test-contracts.sh"
