import { Request, Response, NextFunction } from 'express';
import { generateCsrfToken } from '../middlewares/csrf.middleware';
import { AuthService } from '../services/auth.service';
import { successResponse } from '../utils/response';
import { getCookieOptions } from '../utils/jwt';
import { ILoginRequest, ISignupRequest } from '../types/auth.types';
import { logAuditEvent } from '../middlewares/audit.middleware';
import {
    initializeUserSession,
    endUserSession,
} from '../middlewares/user-activity.middleware';

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
                path: '/api/auth', // Restrict refresh token to auth endpoints
            });
            // Set CSRF token cookie (not httpOnly)
            res.cookie('csrfToken', generateCsrfToken(), {
                secure: isProduction,
                sameSite: isProduction ? 'strict' : 'lax',
                maxAge: 7 * 24 * 60 * 60 * 1000,
                path: '/',
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
                path: '/api/auth', // Restrict refresh token to auth endpoints
            });
            // Set CSRF token cookie (not httpOnly)
            res.cookie('csrfToken', generateCsrfToken(), {
                secure: isProduction,
                sameSite: isProduction ? 'strict' : 'lax',
                maxAge: 7 * 24 * 60 * 60 * 1000,
                path: '/',
            });

            // Log audit event for successful login and initialize user session
            setImmediate(async () => {
                // Initialize user activity session
                const sessionId = initializeUserSession(result.user.id, req);

                await logAuditEvent(
                    result.user.id,
                    'LOGIN',
                    'USER',
                    `User ${result.user.name} logged in successfully (Session: ${sessionId})`,
                    {
                        userRole: result.user.role,
                        ipAddress: req.ip || req.connection.remoteAddress,
                        userAgent: req.get('User-Agent'),
                        newValues: {
                            sessionId,
                            loginTime: new Date(),
                        },
                    },
                );
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

            // End user session and log audit event for logout
            setImmediate(async () => {
                // End user activity session
                await endUserSession(req.user!.id, req);

                await logAuditEvent(
                    req.user!.id,
                    'LOGOUT',
                    'USER',
                    `User logged out`,
                    {
                        userRole: req.user!.role,
                        ipAddress: req.ip || req.connection.remoteAddress,
                        userAgent: req.get('User-Agent'),
                    },
                );
            });

            // Clear cookies
            res.clearCookie('accessToken');
            res.clearCookie('refreshToken', { path: '/api/auth' });

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
                res.clearCookie('refreshToken', { path: '/api/auth' });

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
                path: '/api/auth',
            });
            // Set CSRF token cookie (not httpOnly)
            res.cookie('csrfToken', generateCsrfToken(), {
                secure: isProduction,
                sameSite: isProduction ? 'strict' : 'lax',
                maxAge: 7 * 24 * 60 * 60 * 1000,
                path: '/',
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
            res.clearCookie('refreshToken', { path: '/api/auth' });

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

            // Populate branch if present
            const User = require('../models/user.model').default;
            let userDoc = await User.findById(req.user.id).populate('branch');

            let branch = null;
            if (userDoc && userDoc.branch) {
                branch = {
                    id: userDoc.branch._id,
                    name: userDoc.branch.name,
                };
            }

            res.status(200).json(
                successResponse({
                    user: {
                        id: req.user.id,
                        name: req.user.name,
                        email: req.user.email,
                        role: req.user.role,
                        isFirstSetup: req.user.isFirstSetup,
                        permissions: req.user.permissions || [],
                        branch,
                    },
                }),
            );
        } catch (error) {
            next(error);
        }
    }

    // Admin User Management Methods
    async getUsers(req: Request, res: Response, next: NextFunction) {
        try {
            const { page = 1, limit = 10, search = '' } = req.query;
            const result = await authService.getUsers(
                {
                    page: Number(page),
                    limit: Number(limit),
                    search: String(search),
                },
                req.user?.role,
                req.user?.branchId,
                req.user?.pharmacyId,
            );
            res.json(successResponse(result, 'Users retrieved successfully'));
        } catch (error) {
            next(error);
        }
    }

    async createUser(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user?.pharmacyId) {
                res.status(400).json({
                    success: false,
                    message: 'Pharmacy ID is required',
                });
                return;
            }

            const user = await authService.createUser(
                req.body,
                req.user.pharmacyId,
            );
            res.status(201).json(
                successResponse(user, 'User created successfully'),
            );
        } catch (error) {
            next(error);
        }
    }

    async updateUser(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user?.pharmacyId) {
                res.status(400).json({
                    success: false,
                    message: 'Pharmacy ID is required',
                });
                return;
            }

            const user = await authService.updateUser(
                req.params.id,
                req.body,
                req.user.pharmacyId,
            );
            res.json(successResponse(user, 'User updated successfully'));
        } catch (error) {
            next(error);
        }
    }

    async deleteUser(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user?.pharmacyId) {
                res.status(400).json({
                    success: false,
                    message: 'Pharmacy ID is required',
                });
                return;
            }

            await authService.deleteUser(req.params.id, req.user.pharmacyId);
            res.json(successResponse(null, 'User deleted successfully'));
        } catch (error) {
            next(error);
        }
    }

    async assignPermissions(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user?.pharmacyId) {
                res.status(400).json({
                    success: false,
                    message: 'Pharmacy ID is required',
                });
                return;
            }

            const { userId, permissions } = req.body;
            const user = await authService.assignPermissions(
                userId,
                permissions,
                req.user.pharmacyId,
            );
            res.json(
                successResponse(user, 'Permissions assigned successfully'),
            );
        } catch (error) {
            next(error);
        }
    }

    async checkAdminFirstSetup(
        req: Request,
        res: Response,
        next: NextFunction,
    ) {
        try {
            if (
                !req.user ||
                (req.user.role !== 'admin' && req.user.role !== 'super_admin')
            ) {
                res.status(403).json({
                    success: false,
                    message:
                        'Forbidden: Only admin level users can check first setup status',
                });
                return;
            }

            const User = require('../models/user.model').default;
            const user = await User.findById(req.user.id);
            res.json(
                successResponse(
                    {
                        isFirstSetup: !!user?.isFirstSetup,
                    },
                    'First setup status retrieved',
                ),
            );
        } catch (error) {
            next(error);
        }
    }
}
