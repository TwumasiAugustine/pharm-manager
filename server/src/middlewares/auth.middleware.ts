import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { UnauthorizedError, ForbiddenError } from '../utils/errors';
import { UserRole, ITokenPayload } from '../types/auth.types';

// Extend Express Request interface to include user
declare global {
    namespace Express {
        interface Request {
            user?: ITokenPayload;
        }
    }
}

// Authenticate user
export const authenticate = (
    req: Request,
    res: Response,
    next: NextFunction,
): void => {
    try {
        // Log request path for debugging
        const debugMode = process.env.DEBUG === 'true';
        if (debugMode) {
            console.log(`🔒 Auth check for: ${req.method} ${req.originalUrl}`);
        }

        // Get token from header or cookie
        const authHeader = req.headers.authorization;
        const token = authHeader?.startsWith('Bearer ')
            ? authHeader.split(' ')[1]
            : req.cookies.accessToken;

        if (!token) {
            if (debugMode) {
                console.log(
                    `❌ No token found for: ${req.method} ${req.originalUrl}`,
                );
            }
            throw new UnauthorizedError('Authentication required');
        }

        // Verify token
        const decoded = verifyAccessToken(token);

        // Attach user to request
        req.user = decoded;

        if (debugMode) {
            console.log(
                `✅ Authenticated user: ${decoded.id} (${decoded.role}) for: ${req.method} ${req.originalUrl}`,
            );
        }

        next();
    } catch (error) {
        next(error);
    }
};

// Authorize by role
export const authorize = (...allowedRoles: UserRole[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        try {
            if (!req.user) {
                throw new UnauthorizedError('Authentication required');
            }

            if (!allowedRoles.includes(req.user.role)) {
                throw new ForbiddenError(
                    'Not authorized to access this resource',
                );
            }

            next();
        } catch (error) {
            next(error);
        }
    };
};
