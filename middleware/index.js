const express = require('express');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const xssClean = require('xss-clean');
const expressRateLimit = require('express-rate-limit');
const hpp = require('hpp');
const cors = require('cors');
const logger = require('./logger');
const config = require('../config');

/**
 * Configure all Express middleware
 * @param {Express} app - Express application instance
 */
const configureMiddleware = (app) => {
  // Security: Helmet sets various HTTP headers for security
  app.use(helmet({
    contentSecurityPolicy: false, // Disable for Socket.IO compatibility
  }));

  // CORS configuration
  app.use(cors({
    origin: config.NODE_ENV === 'production'
      ? process.env.CLIENT_URL
      : 'http://localhost:3000',
    credentials: true,
  }));

  // Body parser middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Cookie parser
  app.use(cookieParser());

  // Data sanitization
  app.use(mongoSanitize()); // Prevent NoSQL injection
  app.use(xssClean()); // Prevent XSS attacks
  app.use(hpp()); // Prevent HTTP parameter pollution

  // Rate limiting
  const limiter = expressRateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use('/api/', limiter);

  // Custom logging middleware
  app.use(logger);
};

module.exports = configureMiddleware;
