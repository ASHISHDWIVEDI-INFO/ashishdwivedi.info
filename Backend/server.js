require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const connectDB = require('./src/config/db');
const { initGridFS } = require('./src/config/gridfs');

const app = express();

// ========================
// Connect Database
// ========================
connectDB();
initGridFS();

// Verify email config (non-blocking)
const { verifyEmailConfig } = require('./src/services/email.service');
verifyEmailConfig();

// ========================
// Security Middleware
// ========================
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// ========================
// CORS Configuration
// ========================
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:3000',
  process.env.PRODUCTION_URL || 'https://ashishdwivedi.info',
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS blocked: ${origin}`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ========================
// Rate Limiting
// ========================
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests. Please try again later.',
  },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: 'Too many login attempts. Please try again in 15 minutes.',
  },
});

app.use('/api/', limiter);

// ========================
// Body Parsing
// ========================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ========================
// Request Logger (dev only)
// ========================
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ========================
// Health Check
// ========================
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Portfolio API is running 🚀',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// ========================
// API Routes  (imported in later modules)
// ========================
app.use('/api/auth',         authLimiter, require('./src/routes/auth.routes'));
app.use('/api/profile',      require('./src/routes/profile.routes'));
app.use('/api/projects',     require('./src/routes/project.routes'));
app.use('/api/skills',       require('./src/routes/skill.routes'));
app.use('/api/experience',   require('./src/routes/experience.routes'));
// app.use('/api/education',    require('./src/routes/education.routes'));
// app.use('/api/startup',      require('./src/routes/startup.routes'));
app.use('/api/blog',         require('./src/routes/blog.routes'));
// app.use('/api/certifications', require('./src/routes/certification.routes'));
// app.use('/api/achievements', require('./src/routes/achievement.routes'));
// app.use('/api/testimonials', require('./src/routes/testimonial.routes'));
// app.use('/api/media-press',  require('./src/routes/mediaPress.routes'));
app.use('/api/contact',      require('./src/routes/contact.routes'));
// app.use('/api/resume',       require('./src/routes/resume.routes'));
// app.use('/api/media',        require('./src/routes/media.routes'));
// app.use('/api/settings',     require('./src/routes/settings.routes'));

// ========================
// 404 Handler
// ========================
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// ========================
// Global Error Handler
// ========================
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.stack || err.message);

  const statusCode = err.statusCode || err.status || 500;
  const message =
    process.env.NODE_ENV === 'development'
      ? err.message
      : statusCode === 500
      ? 'Internal server error'
      : err.message;

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// ========================
// Start Server
// ========================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log('');
  console.log('🚀 ================================');
  console.log(`🚀  Portfolio API Server Started`);
  console.log(`🚀  Port      : ${PORT}`);
  console.log(`🚀  Env       : ${process.env.NODE_ENV}`);
  console.log(`🚀  Health    : http://localhost:${PORT}/health`);
  console.log('🚀 ================================');
  console.log('');
});

module.exports = app;
