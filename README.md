# L2H Blog Backend API

Complete Node.js + Express + TypeScript + MongoDB backend for the L2H blog system.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Environment
```bash
# The .env file is already created with development defaults
# Update the following values:
# - MONGODB_URI (if using MongoDB Atlas)
# - R2 credentials (when ready to upload files)
# - Email credentials (when ready to send emails)
```

### 3. Start Development Server
```bash
npm run dev
```

The server will start at: http://localhost:5000

## 📚 API Endpoints

### Health Check
```
GET /api/health
```

### Authentication
```
POST /api/auth/register       - Register new user
POST /api/auth/login          - Login user
POST /api/auth/refresh-token  - Refresh access token
GET  /api/auth/profile        - Get user profile (protected)
PUT  /api/auth/profile        - Update profile (protected)
```

### Blogs
```
GET    /api/blogs              - Get all blogs
GET    /api/blogs/:slug        - Get single blog by slug
GET    /api/blogs/:id/related  - Get related blogs
POST   /api/blogs              - Create blog (author/admin)
PUT    /api/blogs/:id          - Update blog (author/admin)
DELETE /api/blogs/:id          - Delete blog (author/admin)
```

### Categories
```
GET    /api/categories         - Get all categories
GET    /api/categories/:slug   - Get category by slug
POST   /api/categories         - Create category (admin)
PUT    /api/categories/:id     - Update category (admin)
DELETE /api/categories/:id     - Delete category (admin)
```

### Comments
```
POST /api/comments/submit      - Submit comment (sends OTP)
POST /api/comments/verify      - Verify OTP and save comment
GET  /api/comments/blog/:id    - Get comments for a blog
PUT  /api/comments/:id/moderate - Approve/reject comment (admin)
DELETE /api/comments/:id       - Delete comment (admin)
```

### File Upload
```
POST /api/upload/image         - Upload single image (author/admin)
POST /api/upload/video         - Upload video (author/admin)
POST /api/upload/images        - Upload multiple images (author/admin)
```

### Newsletter
```
POST /api/newsletter/subscribe    - Subscribe (sends OTP)
POST /api/newsletter/verify       - Verify OTP and subscribe
POST /api/newsletter/unsubscribe  - Unsubscribe
GET  /api/newsletter              - Get all subscribers (admin)
```

## 🗄️ Database Models

- **User** - Users, authors, and admins
- **Blog** - Blog posts with rich content
- **BlogCategory** - Blog categories
- **BlogComment** - User comments with moderation
- **OTP** - OTP verification codes
- **Newsletter** - Newsletter subscriptions

## 🔐 Authentication

Uses JWT (JSON Web Tokens) for authentication:
- Access tokens expire in 7 days
- Refresh tokens expire in 30 days
- Role-based access control (user, author, admin)

## 📦 Project Structure

```
backend/
├── src/
│   ├── config/           - Configuration files
│   ├── controllers/      - Request handlers
│   ├── middleware/       - Custom middleware
│   ├── models/           - MongoDB models
│   ├── routes/           - API routes
│   ├── utils/            - Helper functions
│   └── server.ts         - Main entry point
├── .env                  - Environment variables
├── package.json          - Dependencies
└── tsconfig.json         - TypeScript config
```

## 🧪 Testing Endpoints

### Register a user
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User","role":"author"}'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Create a category (requires admin login)
```bash
curl -X POST http://localhost:5000/api/categories \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"name":"Technology","description":"Tech articles"}'
```

## 🛠️ Development Commands

```bash
npm run dev      # Start development server with hot reload
npm run build    # Build for production
npm start        # Start production server
npm run lint     # Run ESLint
```

## 📝 Notes

- MongoDB must be running locally or use MongoDB Atlas
- Default port is 5000 (change in .env)
- CORS is configured for http://localhost:8080 (frontend)
- Rate limiting: 100 requests per 15 minutes per IP
- File uploads go to Cloudflare R2 (S3-compatible)

## 🚀 Deployment

Ready to deploy to production? See the complete deployment guide:

👉 **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Step-by-step guide for Render.com

Quick deployment:
```bash
# 1. Push to GitHub
git push origin main

# 2. Go to render.com and create new Blueprint
# 3. Connect your repo (will use render.yaml)
# 4. Set environment variables
# 5. Deploy!
```

Your API will be live at: `https://your-app-name.onrender.com`

## 🔧 Next Steps

1. ✅ Backend is complete and running
2. 📝 Connect frontend to API endpoints
3. 🎨 Build admin panel UI
4. 🚀 Deploy to production (see DEPLOYMENT.md)

---

**Status:** ✅ Backend Complete | Ready for Deployment



