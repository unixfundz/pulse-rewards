#!/usr/bin/env bash
# test-contracts.sh — Run all Soroban contract unit tests
set -euo pipefail

CONTRACTS_DIR="$(cd "$(dirname "$0")/../contracts" && pwd)"

echo "▶ Running contract tests"
cd "${CONTRACTS_DIR}"

cargo test --workspace -- --nocapture

echo ""
echo "✓ All contract tests passed"
