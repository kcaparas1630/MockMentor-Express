/**
 * @fileoverview Express application setup and middleware configuration for AI Interview Express API.
 * @author kcaparas1630@gmail.com
 * @version 2024-01-01
 * @description
 * Configures the Express app, middleware, logging, rate limiting, and API route registration. Integrates error handling and security best practices for the backend service.
 *
 * @see {@link ./Routes/index}
 * @see {@link ./Config/LoggerConfig}
 * @see {@link ./ErrorHandlers/ErrorHandler}
 *
 * Dependencies:
 * - Express.js
 * - Middleware
 * - Logger
 */
import './firebaseAdmin';
import './db';
import express from 'express';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import morgan from 'morgan';
import cors from 'cors';
import logger from './Config/LoggerConfig';
import rateLimit from 'express-rate-limit';
import { userRoutes, questionRoutes, interviewRoutes } from './Routes/index';
import errorHandler from './ErrorHandlers/ErrorHandler';
const app = express();
const morganFormat = ':method :url :status :response-time ms';

app.set('trust proxy', 1);

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // limit each ip to 10 requests per window/minute
});

const allowedOrigins = [
  'http://localhost:5173', 
  'https://mockmentor-frontend-dev-808688308660.us-east1.run.app'
];

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log(`CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // Allow cookies and credentials
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'Cache-Control',
    'Pragma'
  ],
  preflightContinue: false,
  optionsSuccessStatus: 200
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(compression()); // compressor of body data, improving transfer speed.
app.use(limiter); // limit the number of requests
// Logs using morgan
app.use(
  morgan(morganFormat, {
    stream: {
      write: (message: string) => {
        const logObject = {
          method: message.split(' ')[0],
          url: message.split(' ')[1],
          status: message.split(' ')[2],
          responseTime: message.split(' ')[3],
        };
        logger.info(JSON.stringify(logObject));
      },
    },
  })
);

// Routes
app.use('/api', userRoutes);
app.use('/api', questionRoutes);
app.use('/api', interviewRoutes);

// Error handling middleware
app.use(errorHandler);

export default app;
