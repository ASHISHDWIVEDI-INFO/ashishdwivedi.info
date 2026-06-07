# Ashish Dwivedi — Portfolio CMS

> Full-stack portfolio website with a headless CMS, REST API, and admin panel.
> Built with **Next.js 14 · Node.js/Express · MongoDB · AWS Lightsail · GitHub Actions**.

---

## 🚀 Live

| Surface          | URL                                  |
|------------------|--------------------------------------|
| Portfolio        | https://ashishdwivedi.info           |
| API (health)     | https://api.ashishdwivedi.info/health|
| Admin panel      | https://ashishdwivedi.info/admin     |

---

## 📦 Tech Stack

### Frontend
| Library | Purpose |
|---------|---------|
| Next.js 14 (App Router) | SSR / SSG / ISR |
| Tailwind CSS | Utility-first styling |
| Framer Motion | Animations & transitions |
| react-type-animation | Typing effect (Hero) |
| react-countup | Number counter animations |
| react-intersection-observer | Scroll-triggered animations |
| react-hook-form | Form validation |
| next-themes | Dark / light mode |
| react-hot-toast | Toast notifications |
| axios | HTTP client with interceptors |

### Backend
| Library | Purpose |
|---------|---------|
| Node.js + Express | REST API server |
| Mongoose | MongoDB ODM |
| MongoDB Atlas | Cloud database |
| GridFS | File storage inside MongoDB |
| bcryptjs | Password hashing |
| jsonwebtoken | JWT authentication |
| multer + multer-gridfs-storage | File uploads |
| nodemailer | Gmail SMTP email |
| express-validator | Input validation |
| helmet + cors | Security headers |
| express-rate-limit | Rate limiting |
| morgan | Request logging |

### Infrastructure
| Tool | Purpose |
|------|---------|
| AWS Lightsail | VPS hosting (frontend + backend) |
| Nginx | Reverse proxy + SSL termination |
| PM2 | Process manager (auto-restart) |
| GitHub Actions | CI/CD pipeline |
| Let's Encrypt (Certbot) | Free SSL certificate |
| MongoDB Atlas | Managed database |

---

## 🗂️ Project Structure

```
portfolio/
├── frontend/                    # Next.js 14 app
│   ├── app/
│   │   ├── page.jsx             # Home page (all public sections)
│   │   ├── layout.jsx           # Root layout + fonts + metadata
│   │   ├── providers.jsx        # ThemeProvider + Toaster
│   │   ├── globals.css          # Design system + CSS tokens
│   │   └── admin/               # Protected admin routes
│   │       ├── layout.jsx       # Admin shell (sidebar + auth guard)
│   │       ├── login/           # Login page
│   │       ├── dashboard/       # Overview + quick actions
│   │       ├── profile/         # Profile editor
│   │       ├── projects/        # Projects CRUD
│   │       ├── skills/          # Skills manager
│   │       ├── experience/      # Experience timeline editor
│   │       └── contact/         # Messages inbox
│   ├── components/
│   │   ├── sections/            # Public page sections
│   │   │   ├── HeroSection.jsx
│   │   │   ├── AboutSection.jsx
│   │   │   ├── SkillsSection.jsx
│   │   │   ├── ExperienceSection.jsx
│   │   │   ├── ProjectsSection.jsx
│   │   │   └── ContactSection.jsx
│   │   ├── admin/               # Admin UI components
│   │   │   └── ProjectForm.jsx
│   │   └── ui/
│   │       └── Navbar.jsx
│   ├── hooks/
│   │   └── useAuth.js           # Auth context + hook
│   ├── lib/
│   │   ├── api.js               # Axios instance + all API services
│   │   └── utils.js             # Helper functions
│   ├── jsconfig.json            # @/ path alias
│   ├── next.config.js
│   ├── tailwind.config.js
│   └── .env.local.example
│
├── backend/                     # Express REST API
│   ├── server.js                # Entry point
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js            # MongoDB connection
│   │   │   └── gridfs.js        # GridFS bucket
│   │   ├── models/              # Mongoose schemas
│   │   │   ├── user.model.js
│   │   │   ├── profile.model.js
│   │   │   ├── project.model.js
│   │   │   ├── skill.model.js
│   │   │   ├── experience.model.js
│   │   │   └── contact.model.js
│   │   ├── controllers/         # Route handlers
│   │   ├── middleware/
│   │   │   ├── auth.middleware.js
│   │   │   └── upload.middleware.js
│   │   ├── routes/              # Express routers
│   │   └── services/
│   │       └── email.service.js # Nodemailer
│   ├── scripts/
│   │   └── seedAdmin.js         # One-time admin creation
│   └── .env.example
│
├── .github/
│   └── workflows/
│       ├── backend.yml          # Deploy backend to Lightsail
│       └── frontend.yml         # Build + deploy frontend
│
├── nginx/
│   └── portfolio.conf           # Nginx reverse proxy config
├── ecosystem.config.js          # PM2 process config
├── scripts/
│   └── server-setup.sh          # One-time Lightsail setup
└── README.md
```

---

## ⚡ Quick Start (Local Development)

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- Gmail account (for contact form emails)
- Git

### 1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/portfolio.git
cd portfolio
```

### 2. Backend setup
```bash
cd backend
cp .env.example .env
# Fill in your values (see Environment Variables section below)
npm install
node scripts/seedAdmin.js   # Creates first admin user
npm run dev                 # Starts on http://localhost:5000
```

### 3. Frontend setup
```bash
cd frontend
cp .env.local.example .env.local
# Set NEXT_PUBLIC_API_URL=http://localhost:5000/api
npm install
npm run dev                 # Starts on http://localhost:3000
```

### 4. Open in browser
- Portfolio: http://localhost:3000
- Admin panel: http://localhost:3000/admin/login
- API health: http://localhost:5000/health

---

## 🔑 Environment Variables

### Backend (`backend/.env`)

```env
# Server
PORT=5000
NODE_ENV=development

# MongoDB Atlas
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/portfolio

# JWT
JWT_SECRET=your_jwt_secret_min_32_chars
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your_refresh_secret_min_32_chars
JWT_REFRESH_EXPIRES_IN=30d

# Admin seed (delete after first login)
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=StrongPassword@123

# Email (Gmail SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@gmail.com
SMTP_PASS=your_app_password      # Gmail App Password (not your account password)
SMTP_FROM_NAME=Your Name
SMTP_FROM_EMAIL=your@gmail.com
CONTACT_RECIPIENT_EMAIL=you@yourdomain.com

# CORS
FRONTEND_URL=http://localhost:3000
PRODUCTION_URL=https://yourdomain.com

# GridFS
GRIDFS_BUCKET_NAME=uploads

# Rate limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

> **Gmail App Password:** Go to Google Account → Security → 2-Step Verification → App Passwords → generate one for "Mail".

### Frontend (`frontend/.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SITE_NAME=Your Name
NEXT_PUBLIC_SITE_DESCRIPTION=Your tagline here
```

---

## 🔌 API Reference

All protected routes require: `Authorization: Bearer <token>`

### Auth
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/login` | ❌ | Admin login → JWT |
| POST | `/api/auth/logout` | ✅ | Logout |
| POST | `/api/auth/refresh` | ❌ | Refresh access token |
| PUT  | `/api/auth/change-password` | ✅ | Change password |
| GET  | `/api/auth/me` | ✅ | Get current admin |

### Profile
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET  | `/api/profile` | ❌ | Get profile |
| PUT  | `/api/profile` | ✅ | Update profile |
| POST | `/api/profile/photo` | ✅ | Upload photo |
| GET  | `/api/profile/photo` | ❌ | Stream photo |
| POST | `/api/profile/resume` | ✅ | Upload resume PDF |
| GET  | `/api/profile/resume/download` | ❌ | Download resume |
| GET  | `/api/profile/resume/info` | ✅ | Resume metadata |

### Projects
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET    | `/api/projects` | ❌ | List all (published) |
| GET    | `/api/projects/:id` | ❌ | Get by ID or slug |
| POST   | `/api/projects` | ✅ | Create project |
| PUT    | `/api/projects/:id` | ✅ | Update project |
| DELETE | `/api/projects/:id` | ✅ | Delete project |
| POST   | `/api/projects/:id/image` | ✅ | Upload image |
| PATCH  | `/api/projects/:id/featured` | ✅ | Toggle featured |
| PATCH  | `/api/projects/:id/publish` | ✅ | Toggle published |
| PUT    | `/api/projects/reorder` | ✅ | Bulk reorder |

### Skills
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET    | `/api/skills` | ❌ | List skills (grouped optional) |
| POST   | `/api/skills` | ✅ | Create skill |
| PUT    | `/api/skills/:id` | ✅ | Update skill |
| DELETE | `/api/skills/:id` | ✅ | Delete skill |
| PUT    | `/api/skills/reorder` | ✅ | Bulk reorder |
| POST   | `/api/skills/bulk` | ✅ | Bulk create (seed) |

### Experience
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET    | `/api/experience` | ❌ | List all experience |
| POST   | `/api/experience` | ✅ | Add experience |
| PUT    | `/api/experience/:id` | ✅ | Update |
| DELETE | `/api/experience/:id` | ✅ | Delete |

### Contact
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST   | `/api/contact` | ❌ | Submit contact form |
| GET    | `/api/contact` | ✅ | Admin inbox |
| GET    | `/api/contact/:id` | ✅ | Get message (auto-marks read) |
| PATCH  | `/api/contact/:id/read` | ✅ | Toggle read |
| PATCH  | `/api/contact/:id/star` | ✅ | Toggle starred |
| PATCH  | `/api/contact/:id/archive` | ✅ | Toggle archived |
| PATCH  | `/api/contact/:id/reply` | ✅ | Mark replied |
| DELETE | `/api/contact/:id` | ✅ | Delete message |
| DELETE | `/api/contact/bulk` | ✅ | Bulk delete |
| GET    | `/api/contact/export` | ✅ | Export CSV |

### Media (GridFS)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST   | `/api/media/upload` | ✅ | Upload file |
| GET    | `/api/media` | ✅ | List all files |
| GET    | `/api/media/:id` | ❌ | Stream file |
| DELETE | `/api/media/:id` | ✅ | Delete file |

---

## 🔐 Admin Panel

Navigate to `/admin/login` and sign in with the credentials you set in `.env`.

| Page | Path |
|------|------|
| Dashboard | `/admin/dashboard` |
| Profile | `/admin/profile` |
| Projects | `/admin/projects` |
| Skills | `/admin/skills` |
| Experience | `/admin/experience` |
| Messages | `/admin/contact` |

---

## 🤝 Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'feat: add my feature'`
4. Push: `git push origin feature/my-feature`
5. Open a Pull Request

---

## 📄 License

MIT © [Ashish Dwivedi](https://ashishdwivedi.info)
