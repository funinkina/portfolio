#!/usr/bin/env bash
# Regenerate static/default-header.png (the social preview) from layouts/_default/og.html.
# Renders at 2x and downsamples for crisp thin type. Needs hugo, Helium (or set BROWSER) and sips.
set -euo pipefail
cd "$(dirname "$0")/.."
browser="${BROWSER:-/Applications/Helium.app/Contents/MacOS/Helium}"
port=1415
hugo server -D --port $port --renderToMemory --disableLiveReload \
  --baseURL "$(awk -F"'" '/^baseURL/{print $2}' hugo.toml)" --appendPort=false >/tmp/og-hugo.log 2>&1 &
pid=$!
trap 'kill $pid 2>/dev/null' EXIT
until curl -sf -o /dev/null "http://localhost:$port/og/"; do
  kill -0 $pid 2>/dev/null || { cat /tmp/og-hugo.log; exit 1; }
  sleep 0.3
done
"$browser" --headless=new --hide-scrollbars --force-device-scale-factor=2 --window-size=1200,627 \
  --virtual-time-budget=3000 --screenshot=/tmp/og@2x.png "http://localhost:$port/og/" 2>/dev/null
sips -z 627 1200 /tmp/og@2x.png --out static/default-header.png >/dev/null
echo "wrote static/default-header.png ($(sips -g pixelWidth -g pixelHeight static/default-header.png | awk '/pixel/{printf "%s ", $2}'))"
