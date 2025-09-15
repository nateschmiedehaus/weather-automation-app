#!/usr/bin/env bash
set -euo pipefail

PORT="${PORT:-5173}"
URL="http://localhost:${PORT}"

echo "[sidecar] Waiting for dev server on ${URL}..."
ATTEMPTS=0
until curl -fsS "$URL" >/dev/null 2>&1; do
  ATTEMPTS=$((ATTEMPTS+1))
  if [ $ATTEMPTS -gt 120 ]; then
    echo "[sidecar] Timed out waiting for ${URL}"
    exit 1
  fi
  sleep 0.5
done

echo "[sidecar] Opening browser app window for ${URL}..."
if [ -x "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" ]; then
  open -na "Google Chrome" --args --new-window --app="${URL}" || true
  BROWSER_APP="Google Chrome"
elif [ -x "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser" ]; then
  open -na "Brave Browser" --args --new-window --app="${URL}" || true
  BROWSER_APP="Brave Browser"
else
  # Fallback: Safari (no app mode, but we will tile a normal window)
  open -a Safari "${URL}"
  BROWSER_APP="Safari"
fi

if [ "${SKIP_TILING:-0}" = "1" ]; then
  echo "[sidecar] Skipping tiling (SKIP_TILING=1)"
  exit 0
fi

osascript <<'APPLESCRIPT'
-- Tile the dev browser next to the current terminal window
try
  tell application "Finder" to set screenBounds to bounds of window of desktop
  set {sx, sy, sw, sh} to screenBounds
  set mid to sx + (sw - sx) / 2

  tell application "System Events"
    set frontApp to name of first application process whose frontmost is true
  end tell

  -- Left: terminal (iTerm2 or Terminal)
  if frontApp is "iTerm2" then
    tell application "iTerm2" to set bounds of front window to {sx, sy, mid, sh}
  else if frontApp is "Terminal" then
    tell application "Terminal" to set bounds of front window to {sx, sy, mid, sh}
  end if

  -- Right: Browser app window (Chrome/Brave/Safari)
  try
    if "${BROWSER_APP}" is "Google Chrome" then
      tell application "Google Chrome"
        activate
        set bounds of front window to {mid, sy, sw, sh}
      end tell
    else if "${BROWSER_APP}" is "Brave Browser" then
      tell application "Brave Browser"
        activate
        set bounds of front window to {mid, sy, sw, sh}
      end tell
    else if "${BROWSER_APP}" is "Safari" then
      tell application "Safari"
        activate
        set bounds of front window to {mid, sy, sw, sh}
      end tell
    end if
  end try
end try
APPLESCRIPT

echo "[sidecar] Ready."
