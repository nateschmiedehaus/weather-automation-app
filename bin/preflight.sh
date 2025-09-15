#!/usr/bin/env bash
set -euo pipefail

if [ ! -d node_modules/@vitejs/plugin-react ]; then
  echo "[preflight] Installing dependencies…"
  npm install
fi

if ! command -v vite >/dev/null 2>&1; then
  echo "[preflight] Ensuring vite is available (from local install)"
  npx vite --version >/dev/null 2>&1 || true
fi

echo "[preflight] OK"

