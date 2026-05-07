# Advanced Portfolio Website

**Stack:** Next.js 14 · Django 4.2 · MongoDB · AWS Lightsail · S3 · Google Analytics

## Pages
- `/` — Hero, featured projects, skills, testimonials
- `/projects` — All projects with filters (Web, AI/ML, Research)
- `/research` — Research papers with PDF downloads
- `/blog` — Business & tech articles (MDX)
- `/contact` — Contact form + social links
- `/about` — Full bio, timeline, skills

## Quick Start

### Frontend
```bash
cd frontend
cp .env.local.example .env.local   # fill in your values
npm install
npm run dev                         # http://localhost:3000
```

### Backend
```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env               # fill in your values
python manage.py migrate
python manage.py runserver         # http://localhost:8000
```

## Deployment (AWS Lightsail)

### 1. SSH into server
```bash
ssh -i ~/lightsail-key.pem ubuntu@YOUR_STATIC_IP
```

### 2. Clone repo
```bash
git clone https://github.com/YOUR_USERNAME/portfolio.git
cd portfolio
```

### 3. Backend
```bash
cd backend
python3.11 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env && nano .env   # set all vars
python manage.py collectstatic --noinput
gunicorn config.wsgi:application --bind 0.0.0.0:8000 --daemon
```

### 4. Frontend
```bash
cd ../frontend
npm install
npm run build
pm2 start npm --name "portfolio" -- start
pm2 save && pm2 startup
```

### 5. Nginx
```bash
sudo cp nginx/portfolio.conf /etc/nginx/sites-available/portfolio
sudo ln -s /etc/nginx/sites-available/portfolio /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

### 6. SSL
```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

## Environment Variables

See `frontend/.env.local.example` and `backend/.env.example`

## GitHub Actions CI/CD
Push to `main` → auto deploys to Lightsail via SSH.
See `.github/workflows/deploy.yml`
