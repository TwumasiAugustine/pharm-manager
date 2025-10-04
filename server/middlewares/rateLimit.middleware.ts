import rateLimit from 'express-rate-limit';

// Generic rate limiter factory for auth-sensitive endpoints
export const createAuthRateLimiter = () =>
    rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 10, // limit each IP to 10 requests per windowMs
        standardHeaders: true,
        legacyHeaders: false,
        message: {
            success: false,
            message: 'Too many requests from this IP, please try again later',
        },
    });

export default createAuthRateLimiter;
