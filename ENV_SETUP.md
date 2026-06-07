# Environment Variables — Quick Reference

## Backend (`backend/.env`)

Copy `backend/.env.example` → `backend/.env` and fill in:

### Server
| Variable | Example | Required |
|----------|---------|----------|
| `PORT` | `5000` | ✅ |
| `NODE_ENV` | `production` | ✅ |

### MongoDB
| Variable | Example | Required |
|----------|---------|----------|
| `MONGODB_URI` | `mongodb+srv://user:pass@cluster.mongodb.net/portfolio` | ✅ |

> Get your URI from [MongoDB Atlas](https://cloud.mongodb.com) → Connect → Drivers

### JWT (generate with `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`)
| Variable | Example | Required |
|----------|---------|----------|
| `JWT_SECRET` | `a8f3c...` (64 chars) | ✅ |
| `JWT_EXPIRES_IN` | `7d` | ✅ |
| `JWT_REFRESH_SECRET` | `b9d2e...` (64 chars, different) | ✅ |
| `JWT_REFRESH_EXPIRES_IN` | `30d` | ✅ |

### Admin Seed (delete after first login!)
| Variable | Example | Required |
|----------|---------|----------|
| `ADMIN_EMAIL` | `admin@yourdomain.com` | ✅ once |
| `ADMIN_PASSWORD` | `MyP@ss123` (min 8 chars) | ✅ once |

### Gmail SMTP
| Variable | Example | Required |
|----------|---------|----------|
| `SMTP_HOST` | `smtp.gmail.com` | ✅ |
| `SMTP_PORT` | `587` | ✅ |
| `SMTP_USER` | `you@gmail.com` | ✅ |
| `SMTP_PASS` | `abcd efgh ijkl mnop` | ✅ |
| `SMTP_FROM_NAME` | `Ashish Dwivedi` | ✅ |
| `SMTP_FROM_EMAIL` | `you@gmail.com` | ✅ |
| `CONTACT_RECIPIENT_EMAIL` | `ashish@yourdomain.com` | ✅ |

> `SMTP_PASS` = Gmail **App Password**, not your account password.
> Generate at: Google Account → Security → 2-Step Verification → App Passwords

### CORS
| Variable | Example | Required |
|----------|---------|----------|
| `FRONTEND_URL` | `http://localhost:3000` | ✅ |
| `PRODUCTION_URL` | `https://yourdomain.com` | ✅ |

### File Storage
| Variable | Example | Required |
|----------|---------|----------|
| `GRIDFS_BUCKET_NAME` | `uploads` | ✅ |

### Rate Limiting
| Variable | Example | Notes |
|----------|---------|-------|
| `RATE_LIMIT_WINDOW_MS` | `900000` | 15 minutes in ms |
| `RATE_LIMIT_MAX_REQUESTS` | `100` | requests per window |

---

## Frontend (`frontend/.env.local`)

Copy `frontend/.env.local.example` → `frontend/.env.local` and fill in:

| Variable | Local Dev | Production |
|----------|-----------|------------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:5000/api` | `https://yourdomain.com/api` |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` | `https://yourdomain.com` |
| `NEXT_PUBLIC_SITE_NAME` | `Ashish Dwivedi` | `Ashish Dwivedi` |
| `NEXT_PUBLIC_SITE_DESCRIPTION` | `Founder & Software Engineer` | `Founder & Software Engineer` |

---

## GitHub Actions Secrets

Go to: **Repo → Settings → Secrets and variables → Actions**

| Secret | Value |
|--------|-------|
| `LIGHTSAIL_HOST` | Your Lightsail static IP |
| `LIGHTSAIL_USER` | `ubuntu` |
| `LIGHTSAIL_SSH_KEY` | Full contents of your `.pem` key file |
| `LIGHTSAIL_PORT` | `22` |
| `NEXT_PUBLIC_API_URL` | `https://yourdomain.com/api` |
| `NEXT_PUBLIC_SITE_URL` | `https://yourdomain.com` |

---

## Security Reminders

```
✅ Never commit .env files to git
✅ Delete ADMIN_EMAIL and ADMIN_PASSWORD from .env after first login
✅ Use Gmail App Password, not your real password
✅ JWT secrets must be 32+ characters (64 recommended)
✅ Set MongoDB Atlas IP whitelist to your Lightsail IP only
```

