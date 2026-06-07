#!/bin/bash
# ============================================================
# AWS Lightsail — One-time Server Setup Script
# Run once on a fresh Ubuntu 22.04 Lightsail instance:
#   chmod +x setup-server.sh
#   sudo ./setup-server.sh
# ============================================================

set -e

# ── Colors ───────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; BLUE='\033[0;34m'; NC='\033[0m'
log()  { echo -e "${GREEN}[✓]${NC} $1"; }
warn() { echo -e "${YELLOW}[!]${NC} $1"; }
info() { echo -e "${BLUE}[→]${NC} $1"; }
err()  { echo -e "${RED}[✗]${NC} $1"; exit 1; }

echo ""
echo "╔════════════════════════════════════════╗"
echo "║   Portfolio Server Setup — Lightsail   ║"
echo "╚════════════════════════════════════════╝"
echo ""

# ── Variables ─────────────────────────────────
DOMAIN="${1:-ashishdwivedi.info}"
APP_DIR="/var/www/portfolio"
NODE_VERSION="20"
DEPLOY_USER="${2:-ubuntu}"

info "Domain: $DOMAIN"
info "App dir: $APP_DIR"
info "Node version: $NODE_VERSION"
echo ""

# ── 1. Update system ─────────────────────────
info "Updating system packages..."
apt-get update -q && apt-get upgrade -y -q
log "System updated"

# ── 2. Install essentials ─────────────────────
info "Installing essential packages..."
apt-get install -y -q curl git unzip htop ufw certbot python3-certbot-nginx nginx
log "Essentials installed"

# ── 3. Install Node.js via NVM ───────────────
info "Installing Node.js $NODE_VERSION..."
if ! command -v node &> /dev/null; then
  curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash -
  apt-get install -y nodejs
fi
log "Node.js $(node -v) installed"
log "npm $(npm -v) installed"

# ── 4. Install PM2 ────────────────────────────
info "Installing PM2..."
npm install -g pm2
pm2 startup systemd -u $DEPLOY_USER --hp /home/$DEPLOY_USER
log "PM2 installed globally"

# ── 5. Create app directory ───────────────────
info "Creating app directory..."
mkdir -p $APP_DIR
mkdir -p /var/log/pm2
chown -R $DEPLOY_USER:$DEPLOY_USER $APP_DIR
chown -R $DEPLOY_USER:$DEPLOY_USER /var/log/pm2
log "App directory created at $APP_DIR"

# ── 6. Clone repository ───────────────────────
info "Cloning repository..."
if [ ! -d "$APP_DIR/.git" ]; then
  warn "Please clone your repo manually:"
  warn "  cd /var/www"
  warn "  git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git portfolio"
  warn "Then run: sudo chown -R $DEPLOY_USER:$DEPLOY_USER $APP_DIR"
else
  log "Repository already exists"
fi

# ── 7. Configure Nginx ────────────────────────
info "Configuring Nginx..."
if [ -f "$APP_DIR/nginx/portfolio.conf" ]; then
  cp $APP_DIR/nginx/portfolio.conf /etc/nginx/sites-available/portfolio
  ln -sf /etc/nginx/sites-available/portfolio /etc/nginx/sites-enabled/portfolio
  rm -f /etc/nginx/sites-enabled/default
  nginx -t && log "Nginx config is valid"
else
  warn "Nginx config not found at $APP_DIR/nginx/portfolio.conf"
  warn "Copy it manually and run: sudo nginx -t && sudo systemctl reload nginx"
fi

# ── 8. UFW Firewall ───────────────────────────
info "Configuring firewall..."
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable
log "Firewall configured (SSH + HTTP + HTTPS allowed)"

# ── 9. Create .env files ──────────────────────
info "Setting up environment files..."
if [ -f "$APP_DIR/backend/.env.example" ] && [ ! -f "$APP_DIR/backend/.env" ]; then
  cp $APP_DIR/backend/.env.example $APP_DIR/backend/.env
  warn "Created $APP_DIR/backend/.env — FILL IN YOUR VALUES!"
fi
if [ -f "$APP_DIR/frontend/.env.local.example" ] && [ ! -f "$APP_DIR/frontend/.env.local" ]; then
  cp $APP_DIR/frontend/.env.local.example $APP_DIR/frontend/.env.local
  warn "Created $APP_DIR/frontend/.env.local — FILL IN YOUR VALUES!"
fi

# ── 10. Install project dependencies ─────────
info "Installing backend dependencies..."
if [ -d "$APP_DIR/backend" ]; then
  cd $APP_DIR/backend && npm ci --omit=dev && log "Backend deps installed"
fi

info "Installing frontend dependencies..."
if [ -d "$APP_DIR/frontend" ]; then
  cd $APP_DIR/frontend && npm ci && log "Frontend deps installed"
fi

# ── 11. Build frontend ────────────────────────
info "Building frontend..."
if [ -d "$APP_DIR/frontend" ]; then
  cd $APP_DIR/frontend && npm run build && log "Frontend built"
fi

# ── 12. Start apps with PM2 ───────────────────
info "Starting apps with PM2..."
cd $APP_DIR
if [ -f "ecosystem.config.js" ]; then
  pm2 start ecosystem.config.js --env production
  pm2 save
  log "Apps started with PM2"
fi

# ── 13. SSL with Let's Encrypt ────────────────
info "Setting up SSL certificate..."
warn "Run this command manually to get SSL:"
warn "  sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN"
warn "Then reload nginx: sudo systemctl reload nginx"

# ── 14. Start and enable services ─────────────
systemctl start nginx
systemctl enable nginx
log "Nginx started and enabled"

echo ""
echo "╔════════════════════════════════════════╗"
echo "║        Setup Complete! 🎉              ║"
echo "╠════════════════════════════════════════╣"
echo "║ Next steps:                            ║"
echo "║ 1. Fill in .env files                  ║"
echo "║ 2. Run: node backend/scripts/seedAdmin ║"
echo "║ 3. Run certbot for SSL                 ║"
echo "║ 4. Add GitHub Secrets (see README)     ║"
echo "╚════════════════════════════════════════╝"
echo ""
