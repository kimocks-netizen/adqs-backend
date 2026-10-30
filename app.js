require('dotenv').config();
const express = require('express');
const cors = require('cors');

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
