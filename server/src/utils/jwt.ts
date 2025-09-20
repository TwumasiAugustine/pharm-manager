import jwt from 'jsonwebtoken';
import { ITokenPayload, IAuthTokens } from '../types/auth.types';
import { UnauthorizedError } from './errors';

const ACCESS_TOKEN_EXPIRY = '15m'; // 15 minutes
const REFRESH_TOKEN_EXPIRY = '7d'; // 7 days

// Generate JWT tokens
export const generateTokens = (payload: ITokenPayload): IAuthTokens => {
    const accessToken = jwt.sign(
        payload,
        process.env.JWT_ACCESS_SECRET as string,
        { expiresIn: ACCESS_TOKEN_EXPIRY },
    );

    const refreshToken = jwt.sign(
        payload,
        process.env.JWT_REFRESH_SECRET as string,
        { expiresIn: REFRESH_TOKEN_EXPIRY },
    );

    return { accessToken, refreshToken };
};

// Verify access token
export const verifyAccessToken = (token: string): ITokenPayload => {
    try {
        return jwt.verify(
            token,
            process.env.JWT_ACCESS_SECRET as string,
        ) as ITokenPayload;
    } catch (error) {
        throw new UnauthorizedError('Invalid or expired access token');
    }
};

// Verify refresh token
export const verifyRefreshToken = (token: string): ITokenPayload => {
    try {
        return jwt.verify(
            token,
            process.env.JWT_REFRESH_SECRET as string,
        ) as ITokenPayload;
    } catch (error) {
        throw new UnauthorizedError('Invalid or expired refresh token');
    }
};

// Set cookie options
export const getCookieOptions = (isProduction: boolean) => {
    const baseOptions = {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'strict' : ('lax' as 'strict' | 'lax'),
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    };

    // Add domain if specified in environment variables
    const cookieDomain = process.env.COOKIE_DOMAIN;
    if (cookieDomain && isProduction) {
        return {
            ...baseOptions,
            domain: cookieDomain,
        };
    }

    return baseOptions;
};
