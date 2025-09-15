#!/usr/bin/env bash
set -euo pipefail

PROMPT="${*:-}"
if [ -z "$PROMPT" ]; then
  echo "Usage: codex-bridge.sh \"your prompt\"" >&2
  exit 1
fi

# Try simple codex ask first
if command -v codex &> /dev/null; then
  # Try different codex command patterns
  if codex ask "$PROMPT" 2>/dev/null; then
    exit 0
  elif codex -q "$PROMPT" 2>/dev/null; then
    exit 0
  elif codex --prompt "$PROMPT" 2>/dev/null; then
    exit 0
  fi
fi

# Try with sidecar script
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
if [ -f "$SCRIPT_DIR/codex-with-sidecar.sh" ]; then
  CODEX_BIN=codex "$SCRIPT_DIR/codex-with-sidecar.sh" ask "$PROMPT" 2>/dev/null && exit 0
fi

echo "Unable to communicate with Codex CLI - no working command found" >&2
exit 1