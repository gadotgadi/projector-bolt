import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createExpressApp } from './express-app.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    console.log('🚀 Starting production server...');
    
    // Create the Express app with all API routes
    const app = await createExpressApp();
    
    // Serve static files from the dist directory
    const distPath = path.join(__dirname, '../../dist');
    console.log('📁 Serving static files from:', distPath);
    app.use(express.static(distPath));
    
    // Handle client-side routing - serve index.html for all non-API routes
    app.get('*', (req, res) => {
      // Skip API routes
      if (req.path.startsWith('/api/')) {
        return res.status(404).json({ error: 'API route not found' });
      }
      
      res.sendFile(path.join(distPath, 'index.html'));
    });
    
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`🌐 Access your app at: http://localhost:${PORT}`);
    });
    
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();