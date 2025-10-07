# 🚀 Deploying to Render.com

Complete guide to deploy the L2H Blog Backend to Render.com.

## Prerequisites

1. **GitHub Account** - Your code should be pushed to a GitHub repository
2. **Render Account** - Sign up at [render.com](https://render.com)
3. **MongoDB Atlas** - Free MongoDB hosting at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)

## Step-by-Step Deployment

### 1. Setup MongoDB Atlas (if not done already)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Create a database user with password
4. Whitelist all IPs: `0.0.0.0/0` (for Render to connect)
5. Get your connection string (it looks like):
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/l2h-blog?retryWrites=true&w=majority
   ```

### 2. Push Your Code to GitHub

```bash
# If not already done
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/l2h-backend.git
git push -u origin main
```

### 3. Deploy on Render

#### Option A: Using render.yaml (Recommended)

1. **Go to Render Dashboard**
   - Visit [dashboard.render.com](https://dashboard.render.com)
   - Click **"New +"** → **"Blueprint"**

2. **Connect Repository**
   - Connect your GitHub account
   - Select the repository containing this backend
   - Render will automatically detect the `render.yaml` file

3. **Configure Environment Variables**
   - Render will ask you to fill in the environment variables
   - Fill in the following:

   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/l2h-blog
   FRONTEND_URL=https://your-frontend-url.com
   BLOB_READ_WRITE_TOKEN=your_vercel_blob_token
   EMAIL_SERVICE=gmail
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-app-password
   EMAIL_FROM=L2H Blog <noreply@yourdomain.com>
   ```

4. **Deploy**
   - Click **"Apply"**
   - Render will build and deploy your application

#### Option B: Manual Deployment

1. **Go to Render Dashboard**
   - Visit [dashboard.render.com](https://dashboard.render.com)
   - Click **"New +"** → **"Web Service"**

2. **Connect Repository**
   - Connect your GitHub account
   - Select your backend repository

3. **Configure Service**
   ```
   Name: l2h-blog-backend
   Region: Oregon (US West) or your preferred region
   Branch: main
   Root Directory: (leave empty if backend is in root)
   Runtime: Node
   Build Command: npm install && npm run build
   Start Command: npm start
   Instance Type: Free
   ```

4. **Add Environment Variables**
   
   Go to "Environment" tab and add:

   | Key | Value | Notes |
   |-----|-------|-------|
   | `NODE_ENV` | `production` | Required |
   | `MONGODB_URI` | Your MongoDB Atlas URI | Required |
   | `JWT_SECRET` | Random 64-char string | Auto-generate or use strong random |
   | `JWT_REFRESH_SECRET` | Random 64-char string | Auto-generate or use strong random |
   | `FRONTEND_URL` | Your frontend URL | Required for CORS |
   | `BLOB_READ_WRITE_TOKEN` | Vercel Blob token | For file uploads |
   | `EMAIL_SERVICE` | `gmail` or `mailgun` | For sending emails |
   | `EMAIL_USER` | Your email | Email service username |
   | `EMAIL_PASSWORD` | Your app password | Email service password |
   | `EMAIL_FROM` | `L2H Blog <noreply@yourdomain.com>` | From address |
   | `PORT` | `10000` | Optional, Render sets this |
   | `RATE_LIMIT_WINDOW_MS` | `900000` | Optional (15 min) |
   | `RATE_LIMIT_MAX_REQUESTS` | `100` | Optional |

5. **Create Web Service**
   - Click "Create Web Service"
   - Wait for deployment (5-10 minutes)

### 4. Verify Deployment

Once deployed, your API will be available at:
```
https://l2h-blog-backend.onrender.com
```

Test the health endpoint:
```bash
curl https://your-app-name.onrender.com/api/health
```

You should see:
```json
{
  "status": true,
  "message": "API is healthy",
  "database": "connected",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Environment Variables Reference

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `production` |
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/db` |
| `JWT_SECRET` | JWT signing secret | Generate with: `openssl rand -base64 64` |
| `JWT_REFRESH_SECRET` | Refresh token secret | Generate with: `openssl rand -base64 64` |
| `FRONTEND_URL` | Frontend URL for CORS | `https://yourdomain.com` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `10000` (Render auto-sets) |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob token | File uploads disabled without |
| `EMAIL_SERVICE` | Email provider | `gmail` |
| `EMAIL_USER` | Email username | - |
| `EMAIL_PASSWORD` | Email password | - |
| `EMAIL_FROM` | From email address | - |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | `900000` (15 min) |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | `100` |

## Generating Secure Secrets

For `JWT_SECRET` and `JWT_REFRESH_SECRET`, use:

```bash
# Using openssl (Mac/Linux)
openssl rand -base64 64

# Using Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"

# Or let Render auto-generate them
```

## Setting up Email (Optional)

### Using Gmail

1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account Settings
   - Security → 2-Step Verification → App Passwords
   - Generate a new app password for "Mail"
3. Use in environment variables:
   ```
   EMAIL_SERVICE=gmail
   EMAIL_USER=youremail@gmail.com
   EMAIL_PASSWORD=your-16-char-app-password
   EMAIL_FROM=L2H Blog <noreply@yourdomain.com>
   ```

### Using Mailgun

1. Sign up at [mailgun.com](https://www.mailgun.com)
2. Get your API key and domain
3. Use in environment variables:
   ```
   EMAIL_SERVICE=mailgun
   EMAIL_USER=your-mailgun-api-key
   EMAIL_PASSWORD=your-mailgun-domain
   EMAIL_FROM=L2H Blog <noreply@yourdomain.com>
   ```

## Setting up Vercel Blob Storage (Optional)

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Create a new project or use existing
3. Go to Storage → Create Database → Blob
4. Copy the `BLOB_READ_WRITE_TOKEN`
5. Add to Render environment variables

## Post-Deployment

### Update Frontend

Update your frontend to use the new API URL:
```javascript
const API_URL = 'https://your-app-name.onrender.com/api';
```

### Configure CORS

Make sure `FRONTEND_URL` in Render environment variables matches your frontend domain:
```
FRONTEND_URL=https://your-frontend-domain.com
```

For multiple domains, you'll need to update `src/server.ts` to handle an array.

### Monitor Your App

1. **Logs**: View logs in Render dashboard
2. **Metrics**: Check CPU, memory usage
3. **Health**: Monitor `/api/health` endpoint
4. **Alerts**: Set up Render alerts for downtime

## Troubleshooting

### Build Failed

**Error**: `npm install failed`
- **Solution**: Check `package.json` for invalid dependencies
- **Solution**: Ensure Node version matches (18+)

**Error**: `TypeScript compilation failed`
- **Solution**: Run `npm run build` locally to check for TypeScript errors
- **Solution**: Fix all TypeScript errors before deploying

### Deployment Success but App Crashes

**Error**: `Application failed to start`
- **Check Logs**: Go to Render dashboard → Logs
- **Common Issues**:
  - Missing environment variables (especially `MONGODB_URI`)
  - Invalid MongoDB connection string
  - MongoDB network access not configured (whitelist 0.0.0.0/0)

**Error**: `Database connection failed`
- **Solution**: Verify MongoDB URI is correct
- **Solution**: Check MongoDB Atlas network access allows all IPs
- **Solution**: Verify database user credentials

### 502 Bad Gateway

- **Solution**: Check if app is listening on correct PORT
- **Solution**: Verify `startCommand` is `npm start` and not `npm run dev`

### CORS Errors

- **Solution**: Set `FRONTEND_URL` environment variable
- **Solution**: Ensure frontend URL matches exactly (http vs https, trailing slash)

## Free Tier Limitations

Render Free Tier:
- ⏱️ **Spin down after 15 min of inactivity**
- 🐢 **First request after spin-down takes 30-60 seconds**
- 💾 **512 MB RAM**
- ⏰ **750 hours/month**

To keep your service active 24/7, consider:
1. Upgrading to paid plan ($7/month)
2. Using UptimeRobot to ping your API every 14 minutes
3. Accepting the cold start delay

## Upgrading to Paid Plan

For production use, consider Render's paid plans:
- **Starter**: $7/month - No sleep, more resources
- **Standard**: $25/month - Better performance
- **Pro**: $85/month - High availability

[View Render Pricing](https://render.com/pricing)

## Continuous Deployment

Render automatically redeploys when you push to main branch:

```bash
git add .
git commit -m "Update API"
git push origin main
# Render automatically rebuilds and deploys
```

## Need Help?

- 📚 [Render Documentation](https://render.com/docs)
- 💬 [Render Community](https://community.render.com)
- 🐛 [Open an Issue](https://github.com/yourusername/l2h-backend/issues)

---

**Happy Deploying! 🚀**

