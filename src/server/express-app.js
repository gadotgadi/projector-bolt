import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { initializeDatabase } from './config/database.js';
import authRoutes from './routes/auth.js';
import workersRoutes from './routes/workers.js';
import systemRoutes from './routes/system.js';
import planningRoutes from './routes/planning.js';
import programsRoutes from './routes/programs.js';

// Environment variables
process.env.JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';
process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
process.env.BCRYPT_ROUNDS = process.env.BCRYPT_ROUNDS || '12';

let expressApp = null;
let isAppInitialized = false;

async function createExpressApp() {
  if (expressApp) {
    return expressApp;
  }

  const app = express();

  // Security middleware
  app.use(helmet({
    contentSecurityPolicy: false, // Disable CSP for development
  }));
  app.use(compression());

  // Rate limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // Increased limit for development
    message: { error: 'Too many requests from this IP, please try again later.' }
  });
  app.use(limiter);

  // CORS configuration
  app.use(cors({
    origin: true, // Allow all origins in development
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));

  // Body parsing middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Logging
  if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('dev'));
  }

  // Initialize database only once
  if (!isAppInitialized) {
    try {
      await initializeDatabase();
      console.log('✅ Database initialized successfully');
      
      // Always seed database to ensure default users exist
      const { seedDatabase } = await import('./scripts/seedDatabase.js');
      await seedDatabase();
      console.log('✅ Database seeded successfully');
      
      isAppInitialized = true;
    } catch (error) {
      console.error('❌ Database initialization failed:', error);
      throw error;
    }
  }

  // Routes
  app.use('/auth', authRoutes);
  app.use('/workers', workersRoutes);
  app.use('/system', systemRoutes);
  app.use('/planning', planningRoutes);
  app.use('/programs', programsRoutes);

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
  });

  // Error handling middleware
  app.use((err, req, res, next) => {
    console.error('Express error:', err);
    res.status(500).json({ 
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
  });

  // 404 handler
  app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
  });

  expressApp = app;
  console.log('✅ Express app created and configured');
  return app;
}

export { createExpressApp };