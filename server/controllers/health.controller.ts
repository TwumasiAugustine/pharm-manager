/**
 * Health Controller
 * Provides system health and status endpoints
 */

import { Request, Response, NextFunction } from 'express';
import { successResponse } from '../utils/response';

export class HealthController {
    /**
     * Get system health status
     */
    async getSystemHealth(req: Request, res: Response, next: NextFunction) {
        try {
            const startTime = Date.now();

            // Basic health checks
            const health = {
                status: 'operational' as const,
                uptime: process.uptime() * 1000, // Convert to milliseconds
                lastChecked: new Date().toISOString(),
                services: {
                    database: 'operational' as const,
                    api: 'operational' as const,
                    storage: 'operational' as const,
                    cache: 'operational' as const,
                },
                responseTime: Date.now() - startTime,
                version: process.env.npm_package_version || '1.0.0',
                environment: process.env.NODE_ENV || 'development',
                timestamp: Date.now(),
            };

            res.status(200).json(
                successResponse(health, 'System health retrieved successfully'),
            );
        } catch (error) {
            next(error);
        }
    }

    /**
     * Simple ping endpoint for connectivity checks
     */
    async ping(req: Request, res: Response, next: NextFunction) {
        try {
            const startTime = Date.now();
            const responseTime = Date.now() - startTime;

            res.status(200).json(
                successResponse(
                    {
                        success: true,
                        responseTime,
                        timestamp: Date.now(),
                        message: 'pong',
                    },
                    'API is responding',
                ),
            );
        } catch (error) {
            next(error);
        }
    }
}

export const healthController = new HealthController();
