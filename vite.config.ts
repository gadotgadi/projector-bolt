import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
    // Custom plugin to integrate Express server
    {
      name: 'express-server',
      configureServer(server) {
        // Import and setup Express server
        const { createServer } = require('./src/server/index.js');
        
        createServer().then(app => {
          // Mount Express app on /api routes
          server.middlewares.use('/api', app);
          console.log('Express server integrated with Vite dev server');
        }).catch(error => {
          console.error('Failed to start Express server:', error);
        });
      }
    }
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));