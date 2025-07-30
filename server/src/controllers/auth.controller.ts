import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { successResponse } from '../utils/response';
import { getCookieOptions } from '../utils/jwt';
import { ILoginRequest, ISignupRequest } from '../types/auth.types';

const authService = new AuthService();

export class AuthController {
    async signup(
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
        try {
            const userData: ISignupRequest = req.body;
            const result = await authService.signup(userData);

            // Set cookies for tokens
            const isProduction = process.env.NODE_ENV === 'production';
            res.cookie(
                'accessToken',
                result.tokens?.accessToken,
                getCookieOptions(isProduction),
            );
            res.cookie('refreshToken', result.tokens?.refreshToken, {
                ...getCookieOptions(isProduction),
                path: '/api/auth/refresh', // Restrict refresh token to refresh endpoint
            });

            // Send response
            res.status(201).json(
                successResponse(
                    { user: result.user },
                    'User registered successfully',
                    201,
                ),
            );
        } catch (error) {
            next(error);
        }
    }

    async login(
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
        try {
            const loginData: ILoginRequest = req.body;
            const result = await authService.login(loginData);

            // Set cookies for tokens
            const isProduction = process.env.NODE_ENV === 'production';
            res.cookie(
                'accessToken',
                result.tokens?.accessToken,
                getCookieOptions(isProduction),
            );
            res.cookie('refreshToken', result.tokens?.refreshToken, {
                ...getCookieOptions(isProduction),
                path: '/api/auth/refresh', // Restrict refresh token to refresh endpoint
            });

            // Send response
            res.status(200).json(
                successResponse({ user: result.user }, 'Login successful'),
            );
        } catch (error) {
            next(error);
        }
    }

    async logout(
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
        try {
            if (!req.user?.id) {
                res.status(200).json(
                    successResponse(null, 'Logged out successfully'),
                );
                return;
            }

            await authService.logout(req.user.id);

            // Clear cookies
            res.clearCookie('accessToken');
            res.clearCookie('refreshToken', { path: '/api/auth/refresh' });

            // Send response
            res.status(200).json(
                successResponse(null, 'Logged out successfully'),
            );
        } catch (error) {
            next(error);
        }
    }

    async refresh(
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
        try {
            const refreshToken = req.cookies.refreshToken;

            if (!refreshToken) {
                // Clear cookies just in case
                res.clearCookie('accessToken');
                res.clearCookie('refreshToken', { path: '/api/auth/refresh' });

                res.status(401).json({
                    success: false,
                    message: 'Refresh token missing',
                });
                return;
            }

            const result = await authService.refreshTokens(refreshToken);

            // Set cookies for tokens
            const isProduction = process.env.NODE_ENV === 'production';
            res.cookie(
                'accessToken',
                result.tokens?.accessToken,
                getCookieOptions(isProduction),
            );
            res.cookie('refreshToken', result.tokens?.refreshToken, {
                ...getCookieOptions(isProduction),
                path: '/api/auth/refresh',
            });

            // Send response
            res.status(200).json(
                successResponse(
                    { user: result.user },
                    'Tokens refreshed successfully',
                ),
            );
        } catch (error) {
            // Clear cookies on error
            res.clearCookie('accessToken');
            res.clearCookie('refreshToken', { path: '/api/auth/refresh' });

            next(error);
        }
    }

    async getProfile(
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    message: 'Not authenticated',
                });
                return;
            }

            res.status(200).json(
                successResponse({
                    user: {
                        id: req.user.id,
                        email: req.user.email,
                        role: req.user.role,
                        isFirstSetup: req.user.isFirstSetup,
                    },
                }),
            );
        } catch (error) {
            next(error);
        }
    }
}
