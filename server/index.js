import './config.js'; // Load env vars first
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import compression from 'compression';

import helmet from 'helmet';
import hpp from 'hpp';
import uploadRoutes from './routes/upload.js';
import authRoutes from './routes/auth.js';
import dataRoutes from './routes/data.js';
import adminRoutes from './routes/admin.js';
import userRoutes from './routes/user.js';
import { db } from './db.js';
import { errorHandler, notFound } from './middleware/errorMiddleware.js';
import { generalLimiter, botBlocker, sensitiveFileBlocker } from './middleware/securityMiddleware.js';
import logger from './utils/logger.js';

// Enforce JWT Secret
if (!process.env.JWT_SECRET) {
  logger.error('CRITICAL: JWT_SECRET is not defined in environment variables.');
  process.exit(1);
}

dotenv.config({ path: '.env.local' });

const app = express();
const PORT = process.env.PORT || 3001;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Trust Proxy (required for rate limiting behind proxies)
app.set('trust proxy', 1);

// Security Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }, // Allow loading images from uploads
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true
  }
}));
app.use(hpp()); // Prevent HTTP Parameter Pollution
app.use(compression()); // Enable Gzip compression
app.use(botBlocker); // Block bad bots
app.use(sensitiveFileBlocker); // Block sensitive files
app.use(generalLimiter); // Apply rate limiting to all requests

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || ['http://localhost:3000', 'http://127.0.0.1:3000'], // Restrict to frontend URL
  credentials: true
}));
app.use(express.json({ limit: '10kb' })); // Limit body size
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// เสิร์ฟไฟล์ static จากโฟลเดอร์ uploads พร้อม Cache-Control
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  maxAge: '1d', // Cache for 1 day
  immutable: true // Content doesn't change
}));

// Routes
import settingsRoutes from './routes/settings.js';

// Temporary DB Test Route
app.get('/api/test-db', async (req, res) => {
  try {
    const connection = await db.getConnection();
    await connection.ping();
    connection.release();
    res.json({
      success: true,
      message: 'Database connected successfully',
      config: {
        host: process.env.DB_HOST || process.env.MYSQL_HOST,
        user: process.env.DB_USER || process.env.MYSQL_USER,
        database: process.env.DB_NAME || process.env.MYSQL_DATABASE,
        port: process.env.DB_PORT || process.env.MYSQL_PORT
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      config: {
        host: process.env.DB_HOST || process.env.MYSQL_HOST,
        user: process.env.DB_USER || process.env.MYSQL_USER,
        port: process.env.DB_PORT || process.env.MYSQL_PORT,
        database: process.env.DB_NAME || process.env.MYSQL_DATABASE
      },
      code: error.code,
      stack: error.stack
    });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/user', userRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api', dataRoutes);

app.use('/api', dataRoutes);

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../dist')));

// The "catch-all" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// Error Handling
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`🚀 Server is running on http://localhost:${PORT}`);
});
