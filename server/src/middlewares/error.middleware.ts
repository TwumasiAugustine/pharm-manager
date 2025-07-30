import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/errors';
import { logger } from '../utils/logger';

export const errorHandler = (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction,
): void => {
    // Set CORS headers for error responses
    const origin = req.headers.origin;
    if (origin) {
        res.header('Access-Control-Allow-Origin', origin);
    }
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header(
        'Access-Control-Allow-Methods',
        'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    );
    res.header(
        'Access-Control-Allow-Headers',
        'Content-Type, Authorization, X-Requested-With',
    );

    // Log error
    logger.error(`${err.name}: ${err.message}`);
    if (err.stack) {
        logger.debug(err.stack);
    }

    // Handle API errors
    if (err instanceof ApiError) {
        res.status(err.statusCode).json({
            success: false,
            message: err.message,
            errors: err.errors,
            stack:
                process.env.NODE_ENV === 'development' ? err.stack : undefined,
        });
        return;
    }

    // Handle mongoose validation errors
    if (err.name === 'ValidationError') {
        res.status(400).json({
            success: false,
            message: 'Validation Error',
            errors: Object.values((err as any).errors).map(
                (e: any) => e.message,
            ),
            stack:
                process.env.NODE_ENV === 'development' ? err.stack : undefined,
        });
        return;
    }

    // Handle mongoose duplicate key errors
    if (err.name === 'MongoError' && (err as any).code === 11000) {
        res.status(409).json({
            success: false,
            message: 'Duplicate Key Error',
            errors: [
                `Duplicate key: ${Object.keys((err as any).keyValue).join(', ')}`,
            ],
            stack:
                process.env.NODE_ENV === 'development' ? err.stack : undefined,
        });
        return;
    }

    // Handle JWT errors
    if (err.name === 'JsonWebTokenError') {
        res.status(401).json({
            success: false,
            message: 'Invalid token',
            errors: [err.message],
            stack:
                process.env.NODE_ENV === 'development' ? err.stack : undefined,
        });
        return;
    }

    // Handle token expiration errors
    if (err.name === 'TokenExpiredError') {
        res.status(401).json({
            success: false,
            message: 'Token expired',
            errors: [err.message],
            stack:
                process.env.NODE_ENV === 'development' ? err.stack : undefined,
        });
        return;
    }

    // Handle generic errors
    res.status(500).json({
        success: false,
        message: 'Internal Server Error',
        errors: [err.message],
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });
};

// 404 handler
export const notFoundHandler = (req: Request, res: Response): void => {
    res.status(404).json({
        success: false,
        message: `Not Found - ${req.originalUrl}`,
    });
};
