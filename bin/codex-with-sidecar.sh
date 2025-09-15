#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
PORT="${PORT:-5173}"
URL="http://localhost:${PORT}"
CODEX_BIN="${CODEX_BIN:-codex}"

(
  cd "$ROOT_DIR"
  npm run dev:sidecar >/dev/null 2>&1 || true
) &

exec "$CODEX_BIN" "$@"

