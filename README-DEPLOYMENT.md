# Railway Deployment Guide

## Prerequisites
1. Create a Railway account at https://railway.app
2. Install Railway CLI: `npm install -g @railway/cli`

## Deployment Steps

### Option 1: Deploy via Railway CLI (Recommended)

1. **Login to Railway**:
   ```bash
   railway login
   ```

2. **Initialize Railway project**:
   ```bash
   railway init
   ```
   - Choose "Create new project"
   - Give your project a name (e.g., "procurement-management")

3. **Deploy your application**:
   ```bash
   railway up
   ```

4. **Get your deployment URL**:
   ```bash
   railway domain
   ```

### Option 2: Deploy via GitHub Integration

1. **Push your code to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin YOUR_GITHUB_REPO_URL
   git push -u origin main
   ```

2. **Connect to Railway**:
   - Go to https://railway.app/dashboard
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository

3. **Railway will automatically**:
   - Detect it's a Node.js project
   - Run `npm install`
   - Run `npm run build`
   - Start with `npm start`

## Environment Variables (Optional)

Set these in Railway dashboard if needed:
- `NODE_ENV=production`
- `PORT` (Railway sets this automatically)

## What's Configured

✅ **railway.json** - Railway deployment configuration
✅ **Production server** - Serves both API and frontend
✅ **Database** - SQLite with persistent storage
✅ **Build process** - Vite builds frontend to dist/
✅ **Start command** - Production server starts automatically

## Default Login Credentials

Once deployed, you can login with:
- **Admin**: 9999 / 123456
- **Manager**: 1001 / 123456

## Troubleshooting

If deployment fails:
1. Check Railway logs in the dashboard
2. Ensure all dependencies are in package.json
3. Verify the build completed successfully

## Post-Deployment

Your app will be available at a Railway-provided URL like:
`https://your-app-name.up.railway.app`

The application includes:
- Full procurement management system
- User authentication
- Task management
- System administration
- All Hebrew UI components