import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    middlewareMode: false,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
    // Custom plugin to integrate Express server
    {
      name: 'express-integration',
      configureServer(server) {
        // Import and setup Express routes
        server.middlewares.use('/api', async (req, res, next) => {
          try {
            // Dynamically import the Express app
            const { createExpressApp } = await import('./src/server/express-app.js');
            const expressApp = await createExpressApp();
            
            // Handle the request with Express
            expressApp(req, res, next);
          } catch (error) {
            console.error('Express middleware error:', error);
            next(error);
          }
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