const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { initializeDatabase, getDatabase } = require('./config/database');
const authRoutes = require('./routes/auth');

// Environment variables
process.env.JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';
process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
process.env.BCRYPT_ROUNDS = process.env.BCRYPT_ROUNDS || '12';
process.env.DB_PATH = process.env.DB_PATH || './data/procurement.db';

async function createServer() {
  const app = express();

  // Security middleware
  app.use(helmet());
  app.use(compression());

  // Rate limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
  });
  app.use('/api', limiter);

  // CORS configuration
  app.use(cors({
    origin: ['http://localhost:8080', 'http://localhost:3000'],
    credentials: true
  }));

  // Body parsing middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Logging
  if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('combined'));
  }

  // Initialize database
  try {
    await initializeDatabase();
    console.log('Database initialized successfully');
    
    // Seed database
    const { seedDatabase } = require('./scripts/seedDatabase');
    await seedDatabase();
  } catch (error) {
    console.error('Failed to initialize database:', error);
  }

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    });
  });

  // API Routes
  app.use('/api/auth', authRoutes);

  // Error handling middleware
  app.use('/api', (err, req, res, next) => {
    console.error('API Error:', err);
    
    if (err.type === 'entity.parse.failed') {
      return res.status(400).json({ error: 'Invalid JSON format' });
    }
    
    res.status(err.status || 500).json({
      error: process.env.NODE_ENV === 'production' 
        ? 'Internal server error' 
        : err.message
    });
  });

  // 404 handler for API routes
  app.use('/api/*', (req, res) => {
    res.status(404).json({ error: 'API route not found' });
  });

  return app;
}

module.exports = { createServer };