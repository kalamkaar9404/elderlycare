#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════
#  MedNutri — One-Click Launcher (macOS / Linux)
#  Starts both frontend (Next.js :3000) and backend (Streamlit :8501)
#  side-by-side using concurrently.
#
#  Usage:
#    chmod +x start.sh
#    ./start.sh
# ═══════════════════════════════════════════════════════════════════════════

set -e

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONTEND="$ROOT/frontend"
BACKEND="$ROOT/backend"

# ANSI colours
CYAN="\033[0;36m"
MAGENTA="\033[0;35m"
GREEN="\033[0;32m"
YELLOW="\033[1;33m"
RED="\033[0;31m"
RESET="\033[0m"

echo ""
echo -e "${GREEN}  =========================================="
echo -e "   MedNutri Full-Stack Launcher"
echo -e "  =========================================="
echo -e "   Frontend  →  http://localhost:3000"
echo -e "   Backend   →  http://localhost:8501"
echo -e "  ==========================================${RESET}"
echo ""

# ── Preflight: check .env.local ────────────────────────────────────────────
if [ ! -f "$FRONTEND/.env.local" ]; then
  echo -e "${YELLOW}  [WARNING] frontend/.env.local not found."
  echo -e "  Run:  cp frontend/.env.local.example frontend/.env.local"
  echo -e "  Then add your OPENAI_API_KEY to the file.${RESET}"
  echo ""
fi

# ── Preflight: check backend/.env ──────────────────────────────────────────
if [ ! -f "$BACKEND/.env" ]; then
  echo -e "${YELLOW}  [WARNING] backend/.env not found."
  echo -e "  Run:  cp backend/.env.example backend/.env"
  echo -e "  Then add your OPENAI_API_KEY to the file.${RESET}"
  echo ""
fi

# ── Ensure node_modules exist ───────────────────────────────────────────────
if [ ! -d "$ROOT/node_modules" ]; then
  echo -e "${CYAN}  Installing root dependencies...${RESET}"
  npm install --prefix "$ROOT"
fi

# ── Launch both servers via concurrently ────────────────────────────────────
echo -e "${CYAN}  Starting both servers...${RESET}"
echo ""

npx concurrently \
  --names "NEXT,STREAMLIT" \
  --prefix-colors "cyan,magenta" \
  --kill-others-on-fail \
  "cd '$FRONTEND' && npm run dev" \
  "cd '$BACKEND' && streamlit run app.py --server.port 8501"
