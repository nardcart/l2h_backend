# Vercel Deployment Guide for L2H Blog Backend

This guide will help you deploy your Node.js/Express backend to Vercel with all features working.

## 📋 Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Vercel CLI** (Optional but recommended):
   ```bash
   npm install -g vercel
   ```
3. **MongoDB Atlas Account**: Your database should be hosted on MongoDB Atlas or another cloud MongoDB provider
4. **Vercel Blob Storage**: Already configured in your project via `@vercel/blob`

## 🔧 Step 1: Build Your Project

First, ensure your project builds successfully:

```bash
# Install dependencies
npm install

# Build the TypeScript project
npm run build
```

This will compile your TypeScript code from `src/` to `dist/`.

## 📦 Step 2: Prepare for Deployment

### Files Already Created:
- ✅ `vercel.json` - Vercel configuration
- ✅ `.vercelignore` - Files to exclude from deployment
- ✅ Modified `src/server.ts` - Now compatible with Vercel serverless

### Verify Your Build:
```bash
# Test locally after build
npm start
```

## 🚀 Step 3: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard (Recommended for First Time)

1. **Login to Vercel Dashboard**: Go to [vercel.com/dashboard](https://vercel.com/dashboard)

2. **Import Project**:
   - Click "Add New" → "Project"
   - Import your Git repository (GitHub, GitLab, or Bitbucket)
   - Or upload your project folder directly

3. **Configure Build Settings**:
   - **Framework Preset**: Other
   - **Root Directory**: `./` (leave as is)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

4. **Configure Environment Variables** (See Step 4 below)

5. **Deploy**: Click "Deploy"

### Option B: Deploy via Vercel CLI

1. **Login to Vercel**:
   ```bash
   vercel login
   ```

2. **Deploy**:
   ```bash
   # First deployment (will ask configuration questions)
   vercel

   # For production deployment
   vercel --prod
   ```

3. **Follow the prompts**:
   - Set up and deploy? **Y**
   - Which scope? Select your account
   - Link to existing project? **N** (first time)
   - Project name? **l2h-blog-backend** (or your choice)
   - Directory? **./backend** (if in monorepo) or **./** 
   - Override settings? **N**

## 🔐 Step 4: Configure Environment Variables

You MUST set up these environment variables in Vercel:

### Required Environment Variables:

1. **Database**:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority
   ```

2. **JWT Secrets**:
   ```
   JWT_SECRET=your-super-secret-jwt-key-min-32-characters
   JWT_REFRESH_SECRET=your-super-secret-refresh-key-min-32-characters
   ```

3. **Frontend URL** (for CORS):
   ```
   FRONTEND_URL=https://your-frontend.vercel.app,https://yourdomain.com
   ```

4. **Vercel Blob Storage** (for file uploads):
   ```
   BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxxxxxxxxxxx
   ```
   - Get this from: Vercel Dashboard → Your Project → Storage → Create Store → Blob

5. **Email Service** (for notifications):
   ```
   EMAIL_SERVICE=gmail
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-app-specific-password
   EMAIL_FROM=L2H Blog <your-email@gmail.com>
   ```

6. **Rate Limiting** (Optional):
   ```
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   ```

### How to Add Environment Variables:

#### Via Vercel Dashboard:
1. Go to your project in Vercel Dashboard
2. Click "Settings" → "Environment Variables"
3. Add each variable with:
   - **Name**: Variable name (e.g., `MONGODB_URI`)
   - **Value**: The actual value
   - **Environment**: Select "Production", "Preview", and "Development" (all three)
4. Click "Save"

#### Via Vercel CLI:
```bash
# Add environment variables one by one
vercel env add MONGODB_URI production
vercel env add JWT_SECRET production
vercel env add FRONTEND_URL production
# ... etc
```

## 🔒 Step 5: Setup Vercel Blob Storage

1. Go to Vercel Dashboard → Your Project → "Storage"
2. Click "Create Database" → Select "Blob"
3. Name it (e.g., "l2h-uploads")
4. Click "Create"
5. Copy the `BLOB_READ_WRITE_TOKEN` and add it to your environment variables
6. The token will be automatically available in your Vercel deployment

## 🔗 Step 6: Update CORS Settings

After deployment, your backend will be at: `https://your-project.vercel.app`

**Update your frontend** to point to this URL:
```javascript
// In your frontend config
const API_URL = 'https://your-backend.vercel.app/api';
```

**Update FRONTEND_URL environment variable** in Vercel:
```
FRONTEND_URL=https://your-frontend.vercel.app,https://yourdomain.com
```

## 🏗️ Step 7: Database Configuration

### MongoDB Atlas Whitelist:

1. Go to MongoDB Atlas Dashboard
2. Navigate to "Network Access"
3. Click "Add IP Address"
4. Select "Allow Access from Anywhere" (0.0.0.0/0)
   - ⚠️ This is required for Vercel since it uses dynamic IPs
   - Your database is still protected by authentication

### Connection String:
Ensure your `MONGODB_URI` uses the SRV format and includes:
- Correct username and password
- `retryWrites=true&w=majority` parameters
- No special characters in password (URL encode if needed)

## 📧 Step 8: Email Service Setup (Gmail Example)

1. **Enable 2-Step Verification** on your Google Account
2. **Create App Password**:
   - Go to Google Account → Security → 2-Step Verification → App passwords
   - Select "Mail" and "Other (Custom name)"
   - Name it "L2H Blog Backend"
   - Copy the 16-character password
3. **Add to Vercel**:
   ```
   EMAIL_SERVICE=gmail
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-16-char-app-password
   EMAIL_FROM=L2H Blog <your-email@gmail.com>
   ```

## ✅ Step 9: Verify Deployment

1. **Check Deployment Status**: In Vercel Dashboard, ensure deployment is "Ready"

2. **Test Health Endpoint**:
   ```bash
   curl https://your-project.vercel.app/api/health
   ```

3. **Test API**:
   ```bash
   # Get categories
   curl https://your-project.vercel.app/api/categories

   # Get blogs
   curl https://your-project.vercel.app/api/blogs
   ```

4. **Check Logs**:
   - Vercel Dashboard → Your Project → "Logs"
   - Watch for any errors

## 🐛 Troubleshooting

### Issue: "Module not found" errors
**Solution**: Make sure `npm run build` runs successfully locally first

### Issue: Database connection fails
**Solution**: 
- Check MONGODB_URI is correct
- Verify MongoDB Atlas Network Access allows 0.0.0.0/0
- Ensure password doesn't contain special characters (URL encode if needed)

### Issue: CORS errors
**Solution**:
- Add your frontend URL to FRONTEND_URL environment variable
- Format: `https://domain1.com,https://domain2.com` (comma-separated, no spaces)

### Issue: File uploads fail
**Solution**:
- Ensure BLOB_READ_WRITE_TOKEN is set
- Create a Blob store in Vercel Dashboard → Storage

### Issue: 500 Internal Server Error
**Solution**:
- Check Vercel logs: Dashboard → Your Project → "Logs"
- Verify all required environment variables are set
- Look for missing dependencies

### Issue: Cold starts / Slow first request
**Solution**: 
- This is normal for serverless functions
- First request may take 2-5 seconds
- Subsequent requests will be faster
- Consider keeping the function warm with a health check ping

### Issue: Function timeout
**Solution**:
- Vercel free tier has 10s timeout
- Pro tier has 60s timeout
- Optimize long-running operations
- Consider using Vercel Edge Functions for faster response

## 🔄 Redeploying

### Automatic Deployment (Git Integration):
- Push to your main branch
- Vercel automatically rebuilds and deploys

### Manual Deployment:
```bash
# From your project directory
vercel --prod
```

## 📊 Monitoring

1. **Logs**: Vercel Dashboard → Your Project → "Logs"
2. **Analytics**: Vercel Dashboard → Your Project → "Analytics"
3. **Usage**: Vercel Dashboard → Your Project → "Usage"

## ⚡ Performance Tips

1. **Enable Edge Caching**: Add cache headers to GET endpoints
2. **Optimize MongoDB Queries**: Use indexes, limit results
3. **Compress Responses**: Already enabled via `compression` middleware
4. **Rate Limiting**: Already configured (100 requests per 15 min)
5. **Keep Functions Warm**: Ping health endpoint every 5 minutes

## 🆘 Need Help?

- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Vercel Support**: [vercel.com/support](https://vercel.com/support)
- **MongoDB Atlas Docs**: [docs.atlas.mongodb.com](https://docs.atlas.mongodb.com)

## 📝 Post-Deployment Checklist

- [ ] Environment variables are set
- [ ] MongoDB Atlas Network Access allows Vercel IPs (0.0.0.0/0)
- [ ] Vercel Blob Storage is created and token is set
- [ ] Email service is configured and tested
- [ ] Frontend URL is added to CORS whitelist
- [ ] Frontend is updated with backend URL
- [ ] API health check returns 200 OK
- [ ] Test key endpoints (blogs, categories, auth)
- [ ] Check Vercel logs for errors
- [ ] Test file upload functionality
- [ ] Test email sending functionality

## 🎉 Success!

Your backend is now live on Vercel! Your API is available at:
```
https://your-project.vercel.app/api
```

### Example Endpoints:
- Health: `https://your-project.vercel.app/api/health`
- Blogs: `https://your-project.vercel.app/api/blogs`
- Categories: `https://your-project.vercel.app/api/categories`
- eBooks: `https://your-project.vercel.app/api/ebooks`

---

**Remember**: Update your frontend to use the new backend URL! 🚀

