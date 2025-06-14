import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { initializeDatabase } from './config/database.js';
import authRoutes from './routes/auth.js';
import workersRoutes from './routes/workers.js';

// Environment variables
process.env.JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';
process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
process.env.BCRYPT_ROUNDS = process.env.BCRYPT_ROUNDS || '12';
process.env.DB_PATH = process.env.DB_PATH || './src/server/data/procurement.db';

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3001;

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
  app.use('/api', limiter);

  // CORS configuration
  app.use(cors({
    origin: ['http://localhost:8080', 'http://localhost:3000', 'http://localhost:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
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
    const { seedDatabase } = await import('./scripts/seedDatabase.js');
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
  app.use('/api/workers', workersRoutes);

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

  // Start server
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
  });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  startServer().catch(console.error);
}

export { startServer };