import './config.js'; // Load env vars first
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import compression from 'compression';

import helmet from 'helmet';
import hpp from 'hpp';
import uploadRoutes from './routes/upload.js';
import authRoutes from './routes/auth.js';
import dataRoutes from './routes/data.js';
import adminRoutes from './routes/admin.js';
import userRoutes from './routes/user.js';
import jobProfileRoutes from './routes/jobProfiles.js';
import * as jobProfileService from './services/jobProfileService.js';
import { db } from './db.js';
import { errorHandler, notFound } from './middleware/errorMiddleware.js';
import { generalLimiter, botBlocker, sensitiveFileBlocker, uploadLimiter } from './middleware/securityMiddleware.js';
import { sanitizeHtml, sanitizeSql } from './middleware/sanitizeMiddleware.js';
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
import cookieParser from 'cookie-parser';

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"], // React needs unsafe-inline
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      connectSrc: ["'self'", "https:"],
      mediaSrc: ["'self'"],
      objectSrc: ["'none'"],
      frameSrc: ["'self'", "https://www.google.com", "https://maps.google.com", "https://www.youtube.com"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null,
    },
  },
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginEmbedderPolicy: false, // Allow embedding for uploads
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true
  },
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  noSniff: true, // X-Content-Type-Options: nosniff
  xssFilter: true, // X-XSS-Protection (legacy but doesn't hurt)
  permittedCrossDomainPolicies: { permittedPolicies: "none" },
  dnsPrefetchControl: { allow: false },
  frameguard: { action: 'deny' },
  hidePoweredBy: true
}));
app.use(hpp()); // Prevent HTTP Parameter Pollution
app.use(compression()); // Enable Gzip compression
app.use(cookieParser()); // Parse Cookie header and populate req.cookies
app.use(botBlocker); // Block bad bots
app.use(sensitiveFileBlocker); // Block sensitive files
app.use(generalLimiter); // Apply rate limiting to all requests

// เพิ่ม custom security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }
  next();
});

// Middleware
const allowedOrigins = [
  'https://phayaohub.com',
  'https://www.phayaohub.com',
  'http://localhost:3000',
  'http://127.0.0.1:3000'
];

app.use(cors({
  origin: function (origin, callback) {
    // In development, allow all origins
    if (process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }

    // In production: Allow requests with no origin (mobile apps, curl)
    if (!origin) return callback(null, true);

    // Check whitelist
    if (allowedOrigins.indexOf(origin) === -1) {
      logger.warn(`CORS blocked origin: ${origin}`);
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}));
app.use(express.json({ limit: '10kb' })); // Limit body size
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Input sanitization middleware
app.use(sanitizeHtml);
app.use(sanitizeSql);

// เสิร์ฟไฟล์ static จากโฟลเดอร์ uploads พร้อม Cache-Control
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads'), {
  maxAge: '1d', // Cache for 1 day
  immutable: true // Content doesn't change
}));

// Routes
import settingsRoutes from './routes/settings.js';

app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadLimiter, uploadRoutes); // เพิ่ม uploadLimiter
app.use('/api/admin', adminRoutes);
app.use('/api/user', userRoutes);
app.use('/api/job-profiles', jobProfileRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api', dataRoutes);

// Serve static files from the React app
const distPath = path.join(__dirname, '../dist');
const indexHtml = path.join(distPath, 'index.html');

if (fs.existsSync(indexHtml)) {
  app.use(express.static(distPath));

  // The "catch-all" handler: for any request that doesn't
  // match one above, send back React's index.html file.
  app.get(/(.*)/, (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(indexHtml);
  });
} else {
  app.get('/', (req, res) => {
    res.send('API Server is running. Frontend build not found. Use port 3000 for development.');
  });
}

// Error Handling
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, async () => {
  logger.info(`🚀 Server is running on http://localhost:${PORT}`);
  await jobProfileService.createTableIfNotExists();
});
