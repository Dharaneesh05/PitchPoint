# PitchPoint Deployment Guide

## Project Overview
PitchPoint is a full-stack cricket analytics application with:
- **Frontend**: React + TypeScript (Vite)
- **Backend**: Node.js + Express + TypeScript
- **Database**: MongoDB Atlas
- **Authentication**: JWT-based auth system

## Deployment Architecture

### Frontend (Vercel)
- Hosts the React application
- Proxies API calls to the backend on Render

### Backend (Render)
- Hosts the Express server
- Connects to MongoDB Atlas
- Provides REST API endpoints

## Deployment Steps

### 1. Render Backend Deployment

1. **Connect Repository**:
   - Go to [render.com](https://render.com)
   - Connect your GitHub repository
   - Choose "Web Service"

2. **Configuration**:
   - **Name**: `pitchpoint-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Node Version**: `18.x` (recommended)

3. **Environment Variables** (Add these in Render dashboard):
   ```
   NODE_ENV=production
   MONGODB_URL=mongodb+srv://dharaneeshc23aid_db_user:qd6q6bBRGOr4asMK@pitchpoint.7zktddx.mongodb.net/?retryWrites=true&w=majority&appName=PitchPoint
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   SESSION_SECRET=your-super-secret-session-key-change-this-in-production
   PORT=10000
   EMAIL_SERVICE=mock
   SKIP_EMAIL_VERIFICATION=true
   ```

4. **Health Check**: `/api/health` (already configured in render.yaml)

### 2. Vercel Frontend Deployment

1. **Connect Repository**:
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository

2. **Configuration**:
   - **Framework Preset**: Vite
   - **Root Directory**: `/` (project root)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist/public`

3. **Environment Variables** (Add in Vercel dashboard):
   ```
   VITE_API_URL=https://your-render-app-name.onrender.com
   ```

4. **After Backend Deployment**: Update the Render backend URL in both:
   - Vercel environment variables
   - `vercel.json` rewrites configuration

### 3. Post-Deployment Configuration

1. **Update URLs**:
   - Replace `https://your-render-backend-url.onrender.com` in `vercel.json` with your actual Render URL
   - Update `VITE_API_URL` in Vercel environment variables

2. **CORS Configuration**:
   - The backend is already configured to handle CORS
   - Make sure your Vercel domain is added if you implement stricter CORS

3. **MongoDB Atlas**:
   - Your cluster is already configured
   - Database will be created automatically on first connection
   - Consider setting up indexes for better performance

## Environment Variables Reference

### Backend (Render)
```bash
# Required
NODE_ENV=production
MONGODB_URL=mongodb+srv://dharaneeshc23aid_db_user:qd6q6bBRGOr4asMK@pitchpoint.7zktddx.mongodb.net/?retryWrites=true&w=majority&appName=PitchPoint
JWT_SECRET=your-unique-secret-here
SESSION_SECRET=your-unique-session-secret-here
PORT=10000

# Optional
EMAIL_SERVICE=mock
SKIP_EMAIL_VERIFICATION=true
CRIC_API_KEY=your-cricket-api-key
```

### Frontend (Vercel)
```bash
VITE_API_URL=https://your-render-app-name.onrender.com
```

## Testing Deployment

1. **Backend Health Check**:
   ```bash
   curl https://your-render-app.onrender.com/api/health
   ```

2. **Frontend Access**:
   - Visit your Vercel URL
   - Test API connectivity through the UI

3. **Database Connection**:
   - Check render logs for "MongoDB connected successfully"
   - Try creating a test user account

## Troubleshooting

### Common Issues

1. **Build Failures**:
   - Check Node.js version compatibility
   - Ensure all dependencies are in `dependencies` not `devDependencies`

2. **Database Connection**:
   - Verify MongoDB connection string
   - Check Atlas network access (should allow all IPs: 0.0.0.0/0)

3. **API Connection**:
   - Verify Render backend URL is correct in Vercel env vars
   - Check CORS settings if requests are blocked

4. **Environment Variables**:
   - Ensure all required env vars are set
   - Restart deployments after env var changes

### Log Monitoring

1. **Render Logs**:
   - View in Render dashboard
   - Look for MongoDB connection messages
   - Monitor for API errors

2. **Vercel Logs**:
   - Check build logs
   - Monitor runtime logs for API call failures

## Security Notes

1. **JWT Secrets**: Use strong, unique secrets in production
2. **Database**: MongoDB Atlas has built-in security
3. **API Keys**: Store cricket API keys securely
4. **HTTPS**: Both platforms provide HTTPS by default

## Performance Optimization

1. **Database Indexes**: Consider adding indexes for frequently queried fields
2. **Caching**: Implement Redis caching for frequently accessed data
3. **CDN**: Vercel automatically provides CDN for frontend assets
4. **Connection Pooling**: Already configured for MongoDB connections

## Backup & Monitoring

1. **Database**: MongoDB Atlas provides automated backups
2. **Uptime Monitoring**: Consider adding services like UptimeRobot
3. **Error Tracking**: Consider integrating Sentry for error monitoring

## Next Steps After Deployment

1. Test all functionality thoroughly
2. Set up monitoring and alerting
3. Configure custom domain names (optional)
4. Set up CI/CD pipelines for automatic deployments
5. Implement analytics and performance monitoring