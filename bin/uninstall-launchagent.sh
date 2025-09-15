#!/usr/bin/env bash
set -euo pipefail

PLIST_DST="$HOME/Library/LaunchAgents/ai.weather-intel.sidecar.plist"

launchctl unload -w "$PLIST_DST" >/dev/null 2>&1 || true
rm -f "$PLIST_DST"
echo "Uninstalled LaunchAgent: $PLIST_DST"

