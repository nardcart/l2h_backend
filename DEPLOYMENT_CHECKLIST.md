# 🚀 Render.com Deployment Checklist

Quick reference checklist for deploying your backend to Render.com.

## ☑️ Pre-Deployment Checklist

- [ ] Code is pushed to GitHub
- [ ] MongoDB Atlas cluster is set up
- [ ] MongoDB allows all IPs (0.0.0.0/0)
- [ ] MongoDB connection string is ready
- [ ] Render.com account is created
- [ ] Email service is configured (optional)
- [ ] Vercel Blob token is ready (optional)

## 📋 Deployment Steps

### 1. MongoDB Atlas Setup
```
✓ Create cluster at mongodb.com/cloud/atlas
✓ Create database user with password
✓ Network Access → Add IP: 0.0.0.0/0
✓ Copy connection string
```

### 2. Push to GitHub
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### 3. Deploy on Render
```
✓ Go to dashboard.render.com
✓ Click "New +" → "Blueprint"
✓ Connect GitHub repository
✓ Render detects render.yaml
✓ Fill in environment variables (see below)
✓ Click "Apply"
✓ Wait 5-10 minutes for deployment
```

## 🔐 Environment Variables to Set

### Required (MUST SET)
```
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/l2h-blog
JWT_SECRET=(generate with: openssl rand -base64 64)
JWT_REFRESH_SECRET=(generate with: openssl rand -base64 64)
FRONTEND_URL=https://your-frontend-url.com
```

### Optional (For Full Features)
```
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxxxx
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=L2H Blog <noreply@yourdomain.com>
PORT=10000
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## 🧪 Post-Deployment Testing

Test your deployed API:

```bash
# Health check
curl https://your-app-name.onrender.com/api/health

# Expected response:
{
  "status": true,
  "message": "API is healthy",
  "database": "connected"
}
```

## 🔧 Common Issues & Quick Fixes

| Issue | Quick Fix |
|-------|-----------|
| Build fails | Check Node version is 18+ |
| Database error | Verify MongoDB URI and IP whitelist |
| CORS error | Check FRONTEND_URL matches exactly |
| 502 error | Ensure start command is `npm start` |
| App sleeping | Free tier sleeps after 15 min (upgrade or accept delay) |

## 📱 Update Frontend

After deployment, update your frontend API URL:

```javascript
// In your frontend config
const API_URL = 'https://your-app-name.onrender.com/api';
```

## ✅ Final Verification

- [ ] Health endpoint returns 200 OK
- [ ] Database is connected
- [ ] Can register a new user
- [ ] Can login and get JWT token
- [ ] CORS works from frontend
- [ ] File uploads work (if configured)
- [ ] Emails send (if configured)

## 🎉 You're Live!

Your API is now live at:
```
https://your-app-name.onrender.com
```

---

**Need detailed help?** See [DEPLOYMENT.md](./DEPLOYMENT.md)

