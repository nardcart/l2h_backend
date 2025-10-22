# 🚀 Deploy L2H Blog Backend to Vercel

This guide will help you deploy your Node.js/Express backend to Vercel with all features working.

## 📦 What's Included

Your backend has been prepared for Vercel deployment with:

- ✅ **Vercel serverless configuration** (`vercel.json`)
- ✅ **TypeScript build fixes** (all errors resolved)
- ✅ **Environment-aware server** (works locally and on Vercel)
- ✅ **Deployment scripts** (automated deployment)
- ✅ **Comprehensive documentation**

## 🚀 Quick Deploy (3 Commands)

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Login to Vercel
vercel login

# 3. Deploy
vercel --prod
```

That's it! Your API will be live at `https://your-project.vercel.app/api`

## 📋 Automated Deployment

### Windows:
```bash
.\DEPLOY_TO_VERCEL.bat
```

### Linux/Mac:
```bash
chmod +x deploy-vercel.sh
./deploy-vercel.sh
```

The scripts will:
1. Build your project
2. Check for Vercel CLI
3. Deploy to Vercel
4. Show next steps

## ⚙️ Post-Deployment Setup

After deploying, you need to configure:

### 1. Environment Variables
Go to [Vercel Dashboard](https://vercel.com/dashboard) → Your Project → Settings → Environment Variables

Required variables (copy from `env.vercel.example`):
```env
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
FRONTEND_URL=https://your-frontend.vercel.app
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_...
EMAIL_SERVICE=gmail
EMAIL_USER=your@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=Blog <your@gmail.com>
```

### 2. Vercel Blob Storage
1. Dashboard → Your Project → Storage tab
2. Create Database → Select "Blob"
3. Copy the token
4. Add as `BLOB_READ_WRITE_TOKEN` environment variable

### 3. MongoDB Atlas
1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Network Access → Add IP: `0.0.0.0/0` (Allow from anywhere)
3. This is required for Vercel's dynamic IPs

### 4. Redeploy
```bash
vercel --prod
```

## ✅ Verify Deployment

Test your API:

```bash
# Health check
curl https://your-project.vercel.app/api/health

# Get blogs
curl https://your-project.vercel.app/api/blogs
```

## 📚 Documentation

| File | Description |
|------|-------------|
| **VERCEL_SETUP_SUMMARY.md** | Overview of changes and setup |
| **VERCEL_DEPLOYMENT_GUIDE.md** | Complete step-by-step guide |
| **VERCEL_QUICK_START.md** | Quick reference guide |
| **env.vercel.example** | Environment variables template |

## 🔄 Features That Work on Vercel

✅ All REST API endpoints  
✅ MongoDB database connections  
✅ JWT authentication  
✅ File uploads (via Vercel Blob)  
✅ Email sending  
✅ Rate limiting  
✅ CORS configuration  
✅ Health checks  

## 🐛 Common Issues & Solutions

**Build fails?**
```bash
npm run build
# Fix any TypeScript errors shown
```

**Database connection fails?**
- Ensure MongoDB Atlas allows `0.0.0.0/0` in Network Access
- Use connection string with `mongodb+srv://` format

**CORS errors?**
- Add your frontend URL to `FRONTEND_URL` environment variable
- Format: `https://domain1.com,https://domain2.com` (comma-separated)

**File uploads fail?**
- Create Vercel Blob store in dashboard
- Add `BLOB_READ_WRITE_TOKEN` to environment variables

**Check logs:**
- Vercel Dashboard → Your Project → Logs

## 🎯 Production Checklist

Before going live:

- [ ] All environment variables set in Vercel
- [ ] MongoDB Atlas Network Access configured (0.0.0.0/0)
- [ ] Vercel Blob Storage created and token added
- [ ] Email service configured (Gmail app password or Mailgun)
- [ ] CORS configured with frontend URL
- [ ] Health endpoint returns 200 OK
- [ ] Test all major API endpoints
- [ ] Frontend updated with Vercel backend URL

## 🔐 Security Notes

- Never commit `.env` files with real credentials
- Use strong JWT secrets (minimum 32 characters)
- Enable 2FA and use App Passwords for Gmail
- MongoDB is protected by authentication even with 0.0.0.0/0
- Rate limiting is enabled (100 requests per 15 min)
- Helmet.js security headers are active

## 📞 Support

- **Vercel Docs**: https://vercel.com/docs
- **Vercel Support**: https://vercel.com/support
- **MongoDB Atlas**: https://docs.atlas.mongodb.com

## 🎉 Success!

Once deployed, your API will be available at:

```
https://your-project-name.vercel.app/api
```

Example endpoints:
- `https://your-project-name.vercel.app/api/health`
- `https://your-project-name.vercel.app/api/blogs`
- `https://your-project-name.vercel.app/api/categories`
- `https://your-project-name.vercel.app/api/ebooks`

**Don't forget to update your frontend to use the new backend URL!**

---

**Ready to deploy?** Run the deployment script or follow the Quick Deploy steps above! 🚀

