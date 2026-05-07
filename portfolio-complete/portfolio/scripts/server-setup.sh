#!/bin/bash
# ============================================================
# First-time Lightsail server bootstrap
# Run: bash scripts/server-setup.sh
# ============================================================
set -euo pipefail

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo " Portfolio Server Setup"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 1. System update
echo "[1/8] Updating system..."
sudo apt update && sudo apt upgrade -y

# 2. Python 3.11
echo "[2/8] Installing Python 3.11..."
sudo apt install -y python3.11 python3.11-venv python3-pip

# 3. Node 20 + PM2
echo "[3/8] Installing Node.js 20 + PM2..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pm2

# 4. Nginx
echo "[4/8] Installing Nginx..."
sudo apt install -y nginx git curl build-essential

# 5. Certbot
echo "[5/8] Installing Certbot..."
sudo apt install -y certbot python3-certbot-nginx

# 6. Firewall
echo "[6/8] Configuring UFW firewall..."
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw --force enable

# 7. PM2 startup
echo "[7/8] Setting up PM2 auto-start..."
pm2 startup systemd -u ubuntu --hp /home/ubuntu
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u ubuntu --hp /home/ubuntu

# 8. Log dirs
echo "[8/8] Creating log directories..."
sudo mkdir -p /var/log/pm2
sudo chown ubuntu:ubuntu /var/log/pm2

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo " Server setup complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Next steps:"
echo "  1. git clone your repo into ~/portfolio"
echo "  2. cd ~/portfolio/backend && python3.11 -m venv venv"
echo "  3. source venv/bin/activate && pip install -r requirements.txt"
echo "  4. cp .env.example .env && nano .env"
echo "  5. python manage.py migrate && python manage.py seed_data"
echo "  6. gunicorn config.wsgi -c gunicorn.conf.py --daemon"
echo "  7. cd ../frontend && npm install && npm run build"
echo "  8. pm2 start ecosystem.config.js && pm2 save"
echo "  9. sudo cp nginx/portfolio.conf /etc/nginx/sites-available/portfolio"
echo " 10. sudo ln -s /etc/nginx/sites-available/portfolio /etc/nginx/sites-enabled/"
echo " 11. sudo nginx -t && sudo systemctl reload nginx"
echo " 12. sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com"
