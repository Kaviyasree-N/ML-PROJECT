#!/usr/bin/env bash
set -e

# ==========================================================
#  PhishGuard: Single-Command Startup Script
# ==========================================================

echo "=========================================================="
echo "  Starting PhishGuard Detection Platform...              "
echo "=========================================================="

# 1. Install Node.js dependencies if not already present
if [ ! -d "node_modules" ] || [ ! -d "frontend/node_modules" ]; then
  echo "--> Installing Node.js dependencies..."
  npm install
fi

# 2. Optionally install Python backend dependencies if pip is available
if command -v pip3 &> /dev/null; then
  pip3 install -q -r backend/requirements.txt 2>/dev/null || true
elif command -v pip &> /dev/null; then
  pip install -q -r backend/requirements.txt 2>/dev/null || true
fi

# 3. Start the application
echo "--> Launching PhishGuard at http://localhost:3000..."
npm run dev
