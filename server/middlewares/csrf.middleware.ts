import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

// Generate a secure random CSRF token
export function generateCsrfToken(): string {
    return crypto.randomBytes(32).toString('hex');
}

// Middleware to validate CSRF token for state-changing requests
export function csrfProtection(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    // Only check for state-changing methods
    if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
        return next();
    }
    const csrfCookie = req.cookies['csrfToken'];
    const csrfHeader = req.get('X-CSRF-Token');
    if (!csrfCookie || !csrfHeader || csrfCookie !== csrfHeader) {
        return res
            .status(403)
            .json({ success: false, message: 'Invalid or missing CSRF token' });
    }
    next();
}
