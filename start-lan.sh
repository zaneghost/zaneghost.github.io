#!/usr/bin/env bash
set -euo pipefail

PORT="${1:-8080}"

if ! command -v python3 >/dev/null 2>&1; then
  echo "Error: python3 is not installed."
  exit 1
fi

if ! [[ "$PORT" =~ ^[0-9]+$ ]] || [ "$PORT" -lt 1 ] || [ "$PORT" -gt 65535 ]; then
  echo "Error: invalid port '$PORT'. Use 1-65535."
  exit 1
fi

IP="$(hostname -I 2>/dev/null | awk '{print $1}')"
if [ -z "${IP:-}" ]; then
  IP="127.0.0.1"
fi

echo "Starting LAN server in: $(pwd)"
echo "Listening on: 0.0.0.0:${PORT}"
echo "Open in LAN: http://${IP}:${PORT}"
echo "Press Ctrl+C to stop."
echo

if [ -f "package.json" ] && [ -f "src/main.tsx" ]; then
  echo "[Mode] Vite dev server"

  if ! command -v node >/dev/null 2>&1; then
    echo "Error: node is not installed."
    echo "Install Node.js >= 20, then rerun: ./start-lan.sh ${PORT}"
    exit 1
  fi

  NODE_MAJOR="$(node -p "process.versions.node.split('.')[0]" 2>/dev/null || echo 0)"
  if [ "${NODE_MAJOR}" -lt 20 ]; then
    echo "Error: Node.js $(node -v) is too old for this project."
    echo "Required: Node.js >= 20 (Vite/Tailwind v4 requirement)."
    echo
    echo "If using nvm:"
    echo "  nvm install 20"
    echo "  nvm use 20"
    echo
    echo "Then rerun: ./start-lan.sh ${PORT}"
    exit 1
  fi

  if [ ! -d "node_modules" ]; then
    echo "Installing dependencies (first run only)..."
    if ! npm install; then
      echo
      echo "Error: npm install failed."
      echo "Your Node.js/npm environment may be incomplete."
      echo "Try:"
      echo "  sudo apt update && sudo apt install -y npm"
      echo "then rerun: ./start-lan.sh ${PORT}"
      exit 1
    fi
  fi

  exec npm run dev -- --host 0.0.0.0 --port "${PORT}"
fi

echo "[Mode] Static http.server fallback"
exec python3 -m http.server "${PORT}" --bind 0.0.0.0
