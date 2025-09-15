#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR="$1"
PORT="${PORT:-5173}"
export SKIP_TILING="${SKIP_TILING:-1}"

cd "$PROJECT_DIR"
echo "[wrapper] Starting dev:sidecar in $PROJECT_DIR on port $PORT (SKIP_TILING=$SKIP_TILING)"
npm run dev:sidecar

