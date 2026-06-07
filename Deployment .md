# 🚀 Deployment Guide — AWS Lightsail

Step-by-step guide to deploy the portfolio to **AWS Lightsail** with
Nginx, PM2, SSL (Let's Encrypt), and GitHub Actions CI/CD.

---

## Prerequisites

- AWS account
- GitHub account with the repo pushed
- Domain name pointing to your Lightsail IP (add DNS A record)
- MongoDB Atlas cluster running

---

## Part 1 — Create Lightsail Instance

1. Sign in to [AWS Lightsail](https://lightsail.aws.amazon.com)
2. Click **Create instance**
3. Choose:
   - **Platform:** Linux/Unix
   - **Blueprint:** OS Only → **Ubuntu 22.04 LTS**
   - **Plan:** $10/month (2 GB RAM, 1 vCPU) — minimum recommended
4. Add a launch script (optional, can skip and run setup manually)
5. Name it: `portfolio-server`
6. Click **Create instance**

### Attach a static IP

1. Go to **Networking** tab in your instance
2. Click **Create static IP** → attach it to your instance
3. Note the IP address (e.g. `13.xx.xx.xx`)

### Open firewall ports

In the instance **Networking** tab, add these rules:

| Protocol | Port | Description |
|----------|------|-------------|
| TCP | 22   | SSH |
| TCP | 80   | HTTP |
| TCP | 443  | HTTPS |

---

## Part 2 — Connect via SSH

Download your SSH key from Lightsail → **Account → SSH keys → Download**.

```bash
chmod 600 ~/Downloads/LightsailDefaultKey.pem
ssh -i ~/Downloads/LightsailDefaultKey.pem ubuntu@YOUR_INSTANCE_IP
```

---

## Part 3 — One-time Server Setup

Upload and run the setup script:

```bash
# On your local machine — upload the script
scp -i ~/Downloads/LightsailDefaultKey.pem \
  scripts/server-setup.sh \
  ubuntu@YOUR_IP:/home/ubuntu/

# On the server
chmod +x /home/ubuntu/server-setup.sh
sudo /home/ubuntu/server-setup.sh yourdomain.com ubuntu
```

This installs: Node.js 20, Nginx, PM2, UFW firewall, creates `/var/www/portfolio`.

---

## Part 4 — Clone Your Repository

```bash
cd /var/www
sudo git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git portfolio
sudo chown -R ubuntu:ubuntu /var/www/portfolio
```

---

## Part 5 — Configure Environment Variables

### Backend `.env`
```bash
cd /var/www/portfolio/backend
cp .env.example .env
nano .env
```

Fill in **all** values. Critical ones:

```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/portfolio
JWT_SECRET=<random 64-char string>
JWT_REFRESH_SECRET=<different random 64-char string>
SMTP_USER=your@gmail.com
SMTP_PASS=your_gmail_app_password
FRONTEND_URL=https://yourdomain.com
PRODUCTION_URL=https://yourdomain.com
```

> Generate secrets: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`

### Frontend `.env.local`
```bash
cd /var/www/portfolio/frontend
cp .env.local.example .env.local
nano .env.local
```

```env
NEXT_PUBLIC_API_URL=https://yourdomain.com/api
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

---

## Part 6 — Install Dependencies & Build

```bash
# Backend
cd /var/www/portfolio/backend
npm ci --omit=dev

# Seed the admin user
node scripts/seedAdmin.js

# Frontend
cd /var/www/portfolio/frontend
npm ci
npm run build
```

---

## Part 7 — Start Apps with PM2

```bash
cd /var/www/portfolio
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup   # copy and run the printed command to auto-start on reboot
```

Check status:
```bash
pm2 status
pm2 logs portfolio-backend   # view backend logs
pm2 logs portfolio-frontend  # view frontend logs
```

---

## Part 8 — Configure Nginx

```bash
# Copy config
sudo cp /var/www/portfolio/nginx/portfolio.conf \
  /etc/nginx/sites-available/portfolio

# Edit domain name
sudo nano /etc/nginx/sites-available/portfolio
# Replace ashishdwivedi.info with your domain

# Enable the site
sudo ln -sf /etc/nginx/sites-available/portfolio \
  /etc/nginx/sites-enabled/portfolio

# Remove default site
sudo rm -f /etc/nginx/sites-enabled/default

# Test config
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

At this point your site should be accessible at `http://yourdomain.com` (HTTP only).

---

## Part 9 — SSL with Let's Encrypt (HTTPS)

```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

Follow the prompts:
- Enter your email
- Agree to terms
- Choose **option 2** (redirect HTTP to HTTPS)

Certbot auto-renews. Test renewal:
```bash
sudo certbot renew --dry-run
```

Reload Nginx after SSL:
```bash
sudo systemctl reload nginx
```

Your site is now live at `https://yourdomain.com` ✅

---

## Part 10 — GitHub Actions CI/CD

Every `git push` to `main` automatically deploys.

### Step 1 — Add GitHub Secrets

Go to your repo → **Settings → Secrets and variables → Actions → New repository secret**

Add these secrets:

| Secret Name | Value | Description |
|-------------|-------|-------------|
| `LIGHTSAIL_HOST` | `13.xx.xx.xx` | Your Lightsail static IP |
| `LIGHTSAIL_USER` | `ubuntu` | SSH username |
| `LIGHTSAIL_SSH_KEY` | *(contents of your .pem file)* | Full private key text |
| `LIGHTSAIL_PORT` | `22` | SSH port |
| `NEXT_PUBLIC_API_URL` | `https://yourdomain.com/api` | API base URL |
| `NEXT_PUBLIC_SITE_URL` | `https://yourdomain.com` | Site URL |

### Step 2 — Copy SSH key content

```bash
cat ~/Downloads/LightsailDefaultKey.pem
```

Copy the entire output (including `-----BEGIN RSA PRIVATE KEY-----` lines) as the value for `LIGHTSAIL_SSH_KEY`.

### Step 3 — Authorize the key on the server

The key used for deployment must be in `~/.ssh/authorized_keys` on the server:

```bash
# On the server
cat ~/.ssh/authorized_keys
# Your Lightsail key should already be here — if not:
cat ~/Downloads/LightsailDefaultKey.pem | ssh -i ... ubuntu@IP 'cat >> ~/.ssh/authorized_keys'
```

### Step 4 — Test deployment

```bash
# Push any change to main
git add .
git commit -m "chore: test deployment"
git push origin main
```

Go to **GitHub → Actions** to watch the pipeline run. Both `backend.yml` and `frontend.yml` should pass with green checkmarks.

---

## Part 11 — DNS Setup

In your domain registrar (Namecheap, GoDaddy, Route 53, etc.):

| Type | Host | Value | TTL |
|------|------|-------|-----|
| A | `@` | `YOUR_LIGHTSAIL_IP` | 300 |
| A | `www` | `YOUR_LIGHTSAIL_IP` | 300 |

DNS propagation takes 5–30 minutes.

---

## Useful Commands

```bash
# PM2
pm2 status                        # check all processes
pm2 restart portfolio-backend     # restart backend
pm2 restart portfolio-frontend    # restart frontend
pm2 logs portfolio-backend --lines 50   # last 50 log lines
pm2 monit                         # live dashboard

# Nginx
sudo nginx -t                     # test config
sudo systemctl reload nginx       # apply config changes
sudo systemctl status nginx       # check nginx status

# Certbot
sudo certbot renew                # renew SSL
sudo certbot certificates         # list certs

# App
cd /var/www/portfolio
git pull origin main              # pull latest manually
pm2 restart all                   # restart everything
```

---

## Troubleshooting

### Site shows 502 Bad Gateway
```bash
pm2 status                        # check if apps are running
pm2 logs portfolio-backend        # check for errors
curl http://localhost:5000/health # test backend directly
curl http://localhost:3000        # test frontend directly
```

### PM2 app not starting
```bash
pm2 logs portfolio-backend --err  # show error logs
cd /var/www/portfolio/backend && node server.js  # run directly to see errors
```

### SSL certificate issues
```bash
sudo certbot renew --force-renewal
sudo systemctl reload nginx
```

### GitHub Actions SSH fails
- Make sure `LIGHTSAIL_SSH_KEY` contains the full `.pem` content including header/footer lines
- Confirm port 22 is open in Lightsail firewall
- Test SSH manually: `ssh -i key.pem ubuntu@IP`

---

## Security Checklist

- [ ] `ADMIN_EMAIL` and `ADMIN_PASSWORD` removed from `.env` after first login
- [ ] JWT secrets are at least 64 random characters
- [ ] MongoDB Atlas IP whitelist set to Lightsail IP only
- [ ] Gmail App Password used (not real Gmail password)
- [ ] Lightsail firewall only has ports 22, 80, 443 open
- [ ] `.env` file is in `.gitignore` (never committed)
- [ ] Admin password changed after first login

---

*Last updated: June 2026*
