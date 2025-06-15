# Render Deployment Guide

## Prerequisites
1. Create a Render account at https://render.com
2. Have your code in a GitHub repository

## Deployment Steps

### Option 1: Deploy via Render Dashboard (Recommended)

1. **Push your code to GitHub** (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit for Render deployment"
   git branch -M main
   git remote add origin YOUR_GITHUB_REPO_URL
   git push -u origin main
   ```

2. **Create new Web Service on Render**:
   - Go to https://dashboard.render.com
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select your procurement management repository

3. **Configure the service**:
   - **Name**: `procurement-management` (or your preferred name)
   - **Environment**: `Node`
   - **Region**: Choose closest to your users
   - **Branch**: `main`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Free (or paid for better performance)

4. **Environment Variables** (optional):
   - `NODE_ENV`: `production`
   - `PORT`: (Render sets this automatically)

5. **Deploy**:
   - Click "Create Web Service"
   - Render will automatically build and deploy your app

### Option 2: Deploy via render.yaml (Infrastructure as Code)

1. **Use the included render.yaml**:
   - The `render.yaml` file is already configured in your project
   - Push to GitHub with this file included

2. **Create Blueprint on Render**:
   - Go to Render Dashboard
   - Click "New +" → "Blueprint"
   - Connect your GitHub repository
   - Render will read the `render.yaml` configuration

## What's Configured for Render

✅ **render.yaml** - Render service configuration
✅ **Production server** - Serves both API and frontend
✅ **Health check endpoint** - `/health` for monitoring
✅ **Database** - SQLite with persistent storage
✅ **Build process** - Vite builds frontend to dist/
✅ **Start command** - Production server configured

## Database Persistence

Render's free tier has ephemeral storage, meaning the SQLite database will reset on each deployment. For production use, consider:

1. **Upgrade to paid plan** for persistent disk storage
2. **Use external database** like PostgreSQL (Render provides free PostgreSQL)
3. **Current setup works** for testing and development

## Default Login Credentials

Once deployed, you can login with:
- **Admin**: 9999 / 123456
- **Manager**: 1001 / 123456

## Deployment URL

Your app will be available at:
`https://your-service-name.onrender.com`

## Features Included

✅ **Complete procurement management system**
✅ **User authentication and authorization**
✅ **Task and project management**
✅ **System administration panels**
✅ **Hebrew RTL interface**
✅ **Responsive design**
✅ **Role-based access control**

## Troubleshooting

### Build Fails
- Check build logs in Render dashboard
- Ensure all dependencies are in package.json
- Verify Node.js version compatibility

### App Won't Start
- Check start command: `npm start`
- Verify production-server.js exists
- Check environment variables

### Database Issues
- Database resets on free tier deployments
- Consider upgrading to paid plan for persistence
- Check logs for SQLite errors

### Performance Issues
- Free tier has limited resources
- Consider upgrading to paid plan
- Monitor resource usage in dashboard

## Monitoring

Render provides:
- **Automatic health checks** via `/health` endpoint
- **Real-time logs** in the dashboard
- **Metrics and monitoring** for paid plans
- **Automatic SSL certificates**

## Custom Domain (Optional)

For paid plans:
1. Go to service settings
2. Add custom domain
3. Configure DNS records as instructed
4. SSL certificate is automatic

## Support

- Render Documentation: https://render.com/docs
- Community Forum: https://community.render.com
- Status Page: https://status.render.com