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

        // Log request body if present (but only non-sensitive whitelist fields)
        if (req.body && Object.keys(req.body).length > 0) {
            const whitelist: string[] = [
                'name',
                'email',
                'page',
                'limit',
                'search',
            ];
            const safeBody: any = {};
            for (const k of Object.keys(req.body)) {
                if (whitelist.includes(k)) safeBody[k] = req.body[k];
            }
            if (Object.keys(safeBody).length > 0) {
                logger.debug(
                    `[${requestId}] Request body (safe): ${JSON.stringify(safeBody)}`,
                );
            }
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
                        // Reduce user object to a safe summary in logs
                        const u = sanitizedResponse.data.user;
                        sanitizedResponse.data.user = {
                            id: u.id || u._id || '[REDACTED]',
                            name: u.name || '[REDACTED]',
                            role: u.role || '[REDACTED]',
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
