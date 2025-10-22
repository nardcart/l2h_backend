# 🚀 Vercel Quick Start (TL;DR)

Fast track to deploy your backend to Vercel in 10 minutes!

## 1️⃣ Build Locally First
```bash
npm install
npm run build
npm start  # Test that it works
```

## 2️⃣ Install Vercel CLI
```bash
npm install -g vercel
```

## 3️⃣ Login to Vercel
```bash
vercel login
```

## 4️⃣ Deploy
```bash
# First time (will ask questions)
vercel

# Production deployment
vercel --prod
```

## 5️⃣ Set Environment Variables

Go to [Vercel Dashboard](https://vercel.com/dashboard) → Your Project → Settings → Environment Variables

**Add these (minimum required):**
```
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname
JWT_SECRET=your-secret-min-32-chars
JWT_REFRESH_SECRET=your-refresh-secret-min-32-chars
FRONTEND_URL=https://your-frontend.vercel.app
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxx
EMAIL_SERVICE=gmail
EMAIL_USER=your@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=Blog <your@gmail.com>
```

## 6️⃣ Setup Vercel Blob Storage

1. Vercel Dashboard → Your Project → "Storage" tab
2. Click "Create Database" → Select "Blob"
3. Name it (e.g., "uploads")
4. Copy the `BLOB_READ_WRITE_TOKEN`
5. Add it to Environment Variables

## 7️⃣ Setup MongoDB Atlas

1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Network Access → Add IP Address → "Allow from Anywhere" (0.0.0.0/0)
3. Database → Connect → Copy connection string
4. Replace `<password>` with your actual password
5. Add to Vercel Environment Variables

## 8️⃣ Redeploy After Adding Env Vars
```bash
vercel --prod
```

## 9️⃣ Test Your API
```bash
curl https://your-project.vercel.app/api/health
```

## 🔟 Update Frontend

Update your frontend to use the new backend URL:
```javascript
const API_URL = 'https://your-project.vercel.app/api';
```

## ✅ Done! 

Your API is live at: `https://your-project.vercel.app/api`

---

**Having issues?** Check the full guide: `VERCEL_DEPLOYMENT_GUIDE.md`

## 🔄 Future Deployments

**With Git integration (automatic):**
- Just push to your main branch
- Vercel auto-deploys

**Manual:**
```bash
vercel --prod
```

## 📊 Useful Commands

```bash
# Check deployment status
vercel ls

# View logs
vercel logs

# View environment variables
vercel env ls

# Add environment variable
vercel env add VARIABLE_NAME

# Remove project
vercel remove your-project-name

# Pull environment variables to local
vercel env pull
```

## 🆘 Common Issues

| Issue | Quick Fix |
|-------|-----------|
| CORS errors | Add frontend URL to `FRONTEND_URL` env var |
| Database connection fails | Check MongoDB Atlas allows 0.0.0.0/0 |
| File upload fails | Create Blob store & add token |
| 500 errors | Check Vercel logs in dashboard |
| Module not found | Run `npm run build` locally first |

---

**Need more details?** See `VERCEL_DEPLOYMENT_GUIDE.md` for the complete guide!

