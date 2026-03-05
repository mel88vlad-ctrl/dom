import express, { Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { testConnection } from './config/database';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { apiLimiter } from './middleware/rateLimit';

// Routes
import authRoutes from './routes/auth';
import propertyRoutes from './routes/properties';
import listingRoutes from './routes/listings';
import offerRoutes from './routes/offers';

// Load environment variables
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3001;

// ============================================
// MIDDLEWARE
// ============================================

// CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
app.use('/api', apiLimiter);

// Request logging
app.use((req, _res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// ============================================
// ROUTES
// ============================================

// Health check
app.get('/health', (_req, res) => {
  res.json({
    success: true,
    message: 'TrueDom API is running',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/offers', offerRoutes);

// API Info
app.get('/api', (_req, res) => {
  res.json({
    success: true,
    message: 'TrueDom API v1.0.0',
    endpoints: {
      auth: '/api/auth',
      properties: '/api/properties',
      listings: '/api/listings',
      offers: '/api/offers',
    },
    documentation: '/api/docs',
  });
});

// ============================================
// ERROR HANDLING
// ============================================

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

// ============================================
// START SERVER
// ============================================

async function startServer() {
  try {
    // Test database connection
    const dbConnected = await testConnection();
    
    if (!dbConnected) {
      console.error('❌ Failed to connect to database');
      console.error('Please make sure PostgreSQL is running and credentials are correct');
      process.exit(1);
    }

    // Start server
    app.listen(PORT, () => {
      console.log('');
      console.log('🚀 ============================================');
      console.log('🚀 TrueDom Backend Server Started');
      console.log('🚀 ============================================');
      console.log(`🚀 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🚀 Server running on: http://localhost:${PORT}`);
      console.log(`🚀 API endpoint: http://localhost:${PORT}/api`);
      console.log(`🚀 Health check: http://localhost:${PORT}/health`);
      console.log('🚀 ============================================');
      console.log('');
      console.log('📚 Available endpoints:');
      console.log(`   POST   /api/auth/register`);
      console.log(`   POST   /api/auth/login`);
      console.log(`   GET    /api/auth/me`);
      console.log(`   GET    /api/properties/search`);
      console.log(`   GET    /api/properties/:id`);
      console.log(`   POST   /api/properties`);
      console.log(`   POST   /api/listings`);
      console.log(`   GET    /api/listings/:id`);
      console.log(`   POST   /api/offers`);
      console.log(`   GET    /api/offers/property/:propertyId`);
      console.log('');
      console.log('✅ Ready to accept requests!');
      console.log('');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  console.error('Unhandled Promise Rejection:', err);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err: Error) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

// Start the server
startServer();

export default app;
