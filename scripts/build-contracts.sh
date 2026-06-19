#!/usr/bin/env bash
# build-contracts.sh — Compile all Soroban contracts to WASM
set -euo pipefail

CONTRACTS_DIR="$(cd "$(dirname "$0")/../contracts" && pwd)"
TARGET="wasm32v1-none"

echo "▶ Building contracts in ${CONTRACTS_DIR}"
cd "${CONTRACTS_DIR}"

cargo build --release --target "${TARGET}"

echo ""
echo "✓ All contracts compiled successfully"
echo ""
echo "Output files:"
find target/"${TARGET}"/release -name "*.wasm" -not -name "*.d" | sort | while read -r f; do
  size=$(du -h "$f" | cut -f1)
  echo "  ${size}  ${f}"
done
