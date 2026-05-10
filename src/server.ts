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

console.log('Loading .env from:', envPath);

// Debug: Check if critical env variables are loaded
console.log('Environment Variables Check:');
console.log('   PORT:', process.env.PORT || '5000 (default)');
console.log('   MONGODB_URI:', process.env.MONGODB_URI ? 'Set' : 'Missing');
console.log('   JWT_SECRET:', process.env.JWT_SECRET ? 'Set' : 'Missing');
console.log(
  '   BLOB_READ_WRITE_TOKEN:',
  process.env.BLOB_READ_WRITE_TOKEN ? 'Set (Vercel Blob enabled)' : 'Not Set (Vercel Blob disabled)'
);
console.log('');

// Create Express app
const app: Application = express();
const PORT = process.env.PORT || 5000;

// Trust proxy - Required for Vercel/proxy environments
// This allows Express to correctly identify client IPs from X-Forwarded-For header
app.set('trust proxy', 1);

// Security middleware
app.use(helmet());

// CORS configuration - reflect any requesting origin
console.log('CORS: Allowing requests from any origin');

app.use(
  cors({
    origin: (_origin, callback) => {
      callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'authorization'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    preflightContinue: false,
    optionsSuccessStatus: 204,
  })
);

// Compression middleware
app.use(compression());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Rate limiting
const limiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
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

// Error handler
app.use(errorHandler);

// Initialize services (database, email)
const initializeServices = async () => {
  try {
    await connectDatabase();
    initializeEmailTransporter();
    console.log('Services initialized successfully');
  } catch (error) {
    console.error('Failed to initialize services:', error);
    throw error;
  }
};

// For Vercel serverless deployment, initialize services immediately
initializeServices().catch((error) => {
  console.error('Service initialization failed:', error);
});

// Start server (only in non-Vercel environments)
const startServer = async () => {
  try {
    await initializeServices();

    app.listen(PORT, () => {
      console.log('=================================');
      console.log('Server is running!');
      console.log(`Port: ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`URL: http://localhost:${PORT}`);
      console.log(`Health Check: http://localhost:${PORT}/api/health`);
      console.log('=================================');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

process.on('unhandledRejection', (err: Error) => {
  console.error('Unhandled Promise Rejection:', err);
  if (!process.env.VERCEL) {
    process.exit(1);
  }
});

process.on('uncaughtException', (err: Error) => {
  console.error('Uncaught Exception:', err);
  if (!process.env.VERCEL) {
    process.exit(1);
  }
});

if (!process.env.VERCEL) {
  startServer();
}

export default app;
