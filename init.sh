#!/usr/bin/env bash
set -euo pipefail

# ============================================================================
# Constituția României - Development Environment Setup
# ============================================================================
# This script installs dependencies, sets up the database, seeds data,
# and starts the development server.
#
# Prerequisites:
#   - Node.js 22+ LTS
#   - pnpm (or npm)
#   - Environment variables in .env (see .env.example)
# ============================================================================

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$PROJECT_DIR"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[OK]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# ---- Step 1: Check Node.js version ----
log_info "Checking Node.js version..."
if ! command -v node &> /dev/null; then
    log_error "Node.js is not installed. Please install Node.js 22+ LTS."
    exit 1
fi

NODE_VERSION=$(node -v | sed 's/v//' | cut -d. -f1)
if [ "$NODE_VERSION" -lt 22 ]; then
    log_warn "Node.js version $(node -v) detected. Node.js 22+ recommended."
fi
log_success "Node.js $(node -v) detected"

# ---- Step 2: Determine package manager ----
if command -v pnpm &> /dev/null; then
    PKG_MANAGER="pnpm"
    INSTALL_CMD="pnpm install"
    RUN_CMD="pnpm"
elif command -v npm &> /dev/null; then
    PKG_MANAGER="npm"
    INSTALL_CMD="npm install"
    RUN_CMD="npm run"
else
    log_error "No package manager found. Install pnpm or npm."
    exit 1
fi
log_success "Using $PKG_MANAGER as package manager"

# ---- Step 3: Install dependencies ----
log_info "Installing dependencies..."
$INSTALL_CMD
log_success "Dependencies installed"

# ---- Step 4: Check environment variables ----
if [ ! -f ".env" ] && [ ! -f ".env.local" ]; then
    log_warn "No .env or .env.local file found."
    if [ -f ".env.example" ]; then
        log_info "Copying .env.example to .env.local..."
        cp .env.example .env.local
        log_warn "Please edit .env.local with your actual credentials:"
        echo "  - DATABASE_URL: Your Neon PostgreSQL connection string"
        echo "  - OPENROUTER_API_KEY: Your OpenRouter API key for AI moderation"
        echo "  - ARCJET_KEY: Your Arcjet API key for rate limiting"
    else
        log_warn "Create a .env.local file with required variables (see .env.example)"
    fi
fi

# ---- Step 5: Run database migrations ----
log_info "Running database migrations..."
if $RUN_CMD db:push 2>/dev/null || $RUN_CMD db:migrate 2>/dev/null; then
    log_success "Database migrations applied"
else
    log_warn "Database migration command not found or failed. Will retry after first build."
fi

# ---- Step 6: Seed database with constitution data ----
log_info "Seeding database with constitution data..."
if $RUN_CMD db:seed 2>/dev/null; then
    log_success "Database seeded with all 4 constitution versions"
else
    log_warn "Seed command not available yet. Run '$RUN_CMD db:seed' after implementation."
fi

# ---- Step 7: Start the development server ----
log_info "Starting development server..."
echo ""
echo "============================================"
echo "  Constituția României - Dev Server"
echo "============================================"
echo ""
echo "  Local:    http://localhost:3000"
echo "  Network:  Check terminal output below"
echo ""
echo "  Pages:"
echo "    /              - Landing page"
echo "    /[year]        - Constitution reader (e.g., /2003)"
echo "    /compare       - Version comparison (diff)"
echo "    /graph         - Graph visualization"
echo "    /statistics    - Statistics dashboard"
echo ""
echo "  API:"
echo "    /api/health    - Health check"
echo "    /api/versions  - All versions"
echo "    /api/stats     - Aggregated statistics"
echo ""
echo "============================================"
echo ""

$RUN_CMD dev
