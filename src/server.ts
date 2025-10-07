import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import { connectDatabase } from './config/database';
import { initializeEmailTransporter } from './config/email';
import routes from './routes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

// Load environment variables from backend/.env
const envPath = path.resolve(__dirname, '../.env');
dotenv.config({ path: envPath });

console.log('📂 Loading .env from:', envPath);

// Debug: Check if critical env variables are loaded
console.log('🔍 Environment Variables Check:');
console.log('   PORT:', process.env.PORT || '5000 (default)');
console.log('   MONGODB_URI:', process.env.MONGODB_URI ? '✅ Set' : '❌ Missing');
console.log('   JWT_SECRET:', process.env.JWT_SECRET ? '✅ Set' : '❌ Missing');
console.log('   BLOB_READ_WRITE_TOKEN:', process.env.BLOB_READ_WRITE_TOKEN ? '✅ Set (Vercel Blob enabled)' : '❌ Not Set (Vercel Blob disabled)');
console.log('');

// Create Express app
const app: Application = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());

// CORS configuration - Allow multiple origins
const allowedOrigins = process.env.FRONTEND_URL 
  ? process.env.FRONTEND_URL.split(',').map(url => url.trim())
  : ['http://localhost:8080'];

// Always include localhost for development
if (!allowedOrigins.includes('http://localhost:8080')) {
  allowedOrigins.push('http://localhost:8080');
}

console.log('🔐 CORS: Allowed origins:', allowedOrigins);

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps, Postman, curl)
    if (!origin) return callback(null, true);
    
    // Check if origin is in allowed list or matches Vercel pattern
    const isAllowed = allowedOrigins.includes(origin) || 
                     /\.vercel\.app$/.test(origin) ||
                     /^http:\/\/localhost(:\d+)?$/.test(origin);
    
    if (isAllowed) {
      callback(null, true);
    } else {
      console.warn('❌ CORS: Blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'authorization'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  preflightContinue: false,
  optionsSuccessStatus: 204,
}));

// Compression middleware
app.use(compression());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware (only in development)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Rate limiting
const limiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: {
    status: false,
    message: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to all API routes
app.use('/api/', limiter);

// Mount API routes
app.use('/api', routes);

// Root route
app.get('/', (req, res) => {
  res.json({
    status: true,
    message: 'Welcome to L2H Blog API',
    version: '1.0.0',
    documentation: `${req.protocol}://${req.get('host')}/api/health`,
  });
});

// 404 handler
app.use(notFoundHandler);

// Error handler (must be last)
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    // Connect to database
    await connectDatabase();
    
    // Initialize email transporter
    initializeEmailTransporter();
    
    // Start listening
    app.listen(PORT, () => {
      console.log('=================================');
      console.log(`🚀 Server is running!`);
      console.log(`📡 Port: ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 URL: http://localhost:${PORT}`);
      console.log(`📚 Health Check: http://localhost:${PORT}/api/health`);
      console.log('=================================');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  console.error('❌ Unhandled Promise Rejection:', err);
  // Close server & exit process
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err: Error) => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});

// Start the server
startServer();

export default app;

