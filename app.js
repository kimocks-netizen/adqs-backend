require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Prevent unhandled promise rejections from crashing the server
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled rejection:', reason);
});

const app = express();

// ── Security headers ────────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false }));

// ── Rate limiting ───────────────────────────────────────────
// Login — relaxed (no money involved, just content management)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,                   // 20 attempts per 15 min per IP
  message: { status: 'error', message: 'Too many login attempts. Please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// General API — generous limit
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500,                  // 500 requests per 15 min per IP
  message: { status: 'error', message: 'Too many requests. Please slow down.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Public contact form — prevent spam
const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,                   // 10 submissions per hour per IP
  message: { status: 'error', message: 'Too many enquiries submitted. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api', apiLimiter);
app.use('/api/admin/login', loginLimiter);
app.use('/api/contact', contactLimiter);

const app = express();

const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'https://adqs.co.za',
  'https://www.adqs.co.za',
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (
      ALLOWED_ORIGINS.includes(origin) ||
      /\.pages\.dev$/.test(origin) ||
      /\.vercel\.app$/.test(origin)
    ) return callback(null, true);
    callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
const authRoutes       = require('./routes/authRoutes');
const articleRoutes    = require('./routes/articleRoutes');
const categoryRoutes   = require('./routes/categoryRoutes');
const serviceRoutes    = require('./routes/serviceRoutes');
const contactRoutes    = require('./routes/contactRoutes');
const uploadRoutes     = require('./routes/uploadRoutes');
const analyticsRoutes  = require('./routes/analyticsRoutes');
const documentRoutes   = require('./routes/documentRoutes');

app.use('/api', authRoutes);
app.use('/api', articleRoutes);
app.use('/api', categoryRoutes);
app.use('/api', serviceRoutes);
app.use('/api', contactRoutes);
app.use('/api', uploadRoutes);
app.use('/api', analyticsRoutes);
app.use('/api', documentRoutes);

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'adqs-backend' }));

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ status: 'error', message: 'Something went wrong.' });
});

module.exports = app;

if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3002;
  app.listen(PORT, () => console.log(`ADQS Backend running on port ${PORT}`));
}
