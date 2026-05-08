#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"

if ! command -v node >/dev/null 2>&1; then
  echo "Error: node is not installed."
  exit 1
fi
NODE_MAJOR="$(node -p "process.versions.node.split('.')[0]")"
if [ "${NODE_MAJOR}" -lt 20 ]; then
  echo "Error: Node.js $(node -v) is too old. Use Node.js >= 20, then rerun this script."
  exit 1
fi

echo "Removing node_modules and lockfile..."
rm -rf node_modules package-lock.json

echo "Installing dependencies..."
npm install

echo "Done. Start with: ./start-lan.sh 9000"
