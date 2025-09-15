#!/usr/bin/env bash
PROJECT_DIR="/Volumes/BigSSD4/nathanielschmiedehaus/weather-intel-demo"
chmod +x "$PROJECT_DIR/bin/install-launchagent.sh" || true
"$PROJECT_DIR/bin/install-launchagent.sh"
echo "LaunchAgent installed (wrapper-based)."
