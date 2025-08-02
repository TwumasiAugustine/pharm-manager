import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import connectDB from './src/config/db';
import apiRoutes from './src/routes';
import {
    errorHandler,
    notFoundHandler,
} from './src/middlewares/error.middleware';
import { requestLogger } from './src/middlewares/logger.middleware';
import { logger } from './src/utils/logger';
import { cronJobService } from './src/services/cronJob.service';

// Load environment variables
dotenv.config();

// Enable debug mode from environment variable
const debugMode = process.env.DEBUG === 'true';
if (debugMode) {
    logger.info('Debug mode enabled');
}

// Connect to database
connectDB();

// Initialize cron jobs
logger.info('Initializing cron jobs...');
// cronJobService is automatically initialized when imported

// Initialize express app
const app = express();
const port = process.env.PORT || 5000;

// Performance middleware
app.use(helmet()); // Security headers

// Increase body size limit for larger requests
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(requestLogger); // Add request logger middleware

// CORS configuration - handles both regular requests and OPTIONS preflight
const allowedOrigins = [
    process.env.CORS_ORIGIN || 'http://localhost:5173',
    'https://f4l9pv5n-5173.uks1.devtunnels.ms/',
];

const corsOptions = {
    origin: (
        origin: string | undefined,
        callback: (err: Error | null, allow?: boolean) => void,
    ) => {
        // In development, allow requests with no origin (like mobile apps or curl)
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Content-Length', 'X-Requested-With'],
    maxAge: 86400,
};

// Apply CORS middleware (this will handle OPTIONS preflight automatically)
app.use(cors(corsOptions));

// API routes with response time monitoring
app.use('/api', apiRoutes);

// Error handling middleware
app.use(notFoundHandler);
app.use(errorHandler);

// Start server with graceful shutdown
const server = app.listen(port, () => {
    logger.info(
        `Server running in ${process.env.NODE_ENV} mode on port ${port}`,
    );
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
    logger.info('SIGTERM received, shutting down gracefully');
    server.close(() => {
        logger.info('Process terminated');
    });
});

process.on('SIGINT', () => {
    logger.info('SIGINT received, shutting down gracefully');
    server.close(() => {
        logger.info('Process terminated');
    });
});
