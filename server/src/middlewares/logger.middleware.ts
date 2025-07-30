import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

/**
 * Middleware to log all incoming requests
 */
export const requestLogger = (
    req: Request,
    res: Response,
    next: NextFunction,
): void => {
    const debugMode = process.env.DEBUG === 'true';
    if (debugMode) {
        const start = Date.now();
        const requestId = Math.random().toString(36).substring(2, 10);

        // Log request details
        logger.info(`[${requestId}] ${req.method} ${req.originalUrl}`);

        // Log request body if present (but sanitize sensitive data)
        if (req.body && Object.keys(req.body).length > 0) {
            const sanitizedBody = { ...req.body };
            // Remove sensitive fields
            if (sanitizedBody.password) sanitizedBody.password = '[REDACTED]';
            if (sanitizedBody.token) sanitizedBody.token = '[REDACTED]';

            logger.debug(
                `[${requestId}] Request body: ${JSON.stringify(sanitizedBody)}`,
            );
        }

        // Capture response
        const originalSend = res.send;
        res.send = function (body) {
            const duration = Date.now() - start;
            logger.info(
                `[${requestId}] ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`,
            );

            // Don't log large responses or binary data
            if (typeof body === 'string' && body.length < 1000) {
                try {
                    // Try to parse as JSON
                    const jsonBody = JSON.parse(body);
                    // Sanitize response data
                    const sanitizedResponse = { ...jsonBody };
                    if (sanitizedResponse.data && sanitizedResponse.data.user) {
                        // Exclude sensitive user data
                        sanitizedResponse.data.user = {
                            ...sanitizedResponse.data.user,
                            password: '[REDACTED]',
                            tokens: '[REDACTED]',
                        };
                    }
                    logger.debug(
                        `[${requestId}] Response: ${JSON.stringify(sanitizedResponse)}`,
                    );
                } catch (e) {
                    // Not JSON, don't log
                }
            }

            return originalSend.call(this, body);
        };

        next();
    } else {
        next();
    }
};
