#!/usr/bin/env bash
set -e

echo "=========================================================="
echo "  Starting PhishGuard Detection Platform...              "
echo "=========================================================="

if [ -d "frontend" ]; then
  cd frontend
fi

npm install
npm run build
npm run start
