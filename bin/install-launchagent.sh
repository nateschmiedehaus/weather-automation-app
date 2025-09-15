#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
APP_SUPP="$HOME/Library/Application Support/WeatherIntel"
WRAPPER_DST="$APP_SUPP/run-sidecar.sh"
PLIST_DST="$HOME/Library/LaunchAgents/ai.weather-intel.sidecar.plist"
PORT="${PORT:-5173}"

mkdir -p "$APP_SUPP" "$HOME/Library/LaunchAgents"

# Install wrapper under Application Support to avoid external volume exec issues
cat > "$WRAPPER_DST" <<WRAP
#!/usr/bin/env bash
export PATH="/usr/local/bin:/usr/bin:/bin:/opt/homebrew/bin:$PATH"
export SKIP_TILING="
${SKIP_TILING:-1}"
"$PROJECT_DIR/bin/sidecar-wrapper.sh" "$PROJECT_DIR"
WRAP
chmod +x "$WRAPPER_DST"

# Write a plist that calls the wrapper (no cd needed here)
cat > "$PLIST_DST" <<PLIST
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>ai.weather-intel.sidecar</string>
  <key>ProgramArguments</key>
  <array>
    <string>/bin/bash</string>
    <string>-lc</string>
    <string>"$WRAPPER_DST"</string>
  </array>
  <key>RunAtLoad</key>
  <true/>
  <key>KeepAlive</key>
  <dict>
    <key>SuccessfulExit</key>
    <false/>
  </dict>
  <key>StandardOutPath</key>
  <string>$PROJECT_DIR/sidecar.log</string>
  <key>StandardErrorPath</key>
  <string>$PROJECT_DIR/sidecar.err.log</string>
  <key>EnvironmentVariables</key>
  <dict>
    <key>PATH</key>
    <string>/usr/local/bin:/usr/bin:/bin:/opt/homebrew/bin</string>
    <key>PORT</key>
    <string>$PORT</string>
    <key>SKIP_TILING</key>
    <string>1</string>
  </dict>
</dict>
</plist>
PLIST

launchctl unload -w "$PLIST_DST" >/dev/null 2>&1 || true
launchctl load -w "$PLIST_DST" || true
echo "Installed and loaded LaunchAgent: $PLIST_DST"
echo "Wrapper installed: $WRAPPER_DST"
echo "It will auto-start the dev server + sidecar at login."
