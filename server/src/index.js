const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const linkRoutes = require('./routes/links');
const adminRoutes = require('./routes/admin');
const redirectRoutes = require('./routes/redirect');
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests, please try again later.' }
});
app.use('/api/', apiLimiter);

// Serve static client build in production
if (process.env.NODE_ENV === 'production') {
  // Support both standard layout and cPanel layout
  const distPath = require('fs').existsSync(path.join(__dirname, '..', 'dist'))
    ? path.join(__dirname, '..', 'dist')
    : path.join(__dirname, '..', '..', 'client', 'dist');
  app.use(express.static(distPath));
}

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/links', linkRoutes);
app.use('/api/admin', adminRoutes);

// Redirect route (must be after API routes)
app.use('/', redirectRoutes);

// Serve client app for unmatched routes in production
if (process.env.NODE_ENV === 'production') {
  const distPath = require('fs').existsSync(path.join(__dirname, '..', 'dist'))
    ? path.join(__dirname, '..', 'dist')
    : path.join(__dirname, '..', '..', 'client', 'dist');
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/urlshortener')
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
    // Don't exit — let the server start so cPanel doesn't show 503
    // Routes will fail gracefully if DB is unavailable
  });

// Start server — works for both standalone and cPanel Passenger
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
