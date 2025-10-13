/**
 * Expired Sale Cleanup Controller
 * Provides endpoints for managing expired sale cleanup
 */

import { Request, Response, NextFunction } from 'express';
import { ExpiredSaleCleanupService } from '../services/expired-sale-cleanup.service';
import { successResponse } from '../utils/response';

export class ExpiredSaleCleanupController {
    /**
     * Manually trigger cleanup of expired sales
     */
    async cleanupExpiredSales(req: Request, res: Response, next: NextFunction) {
        try {
            // Get user context from request (auth middleware provides this)
            const user = (req as any).user;
            const userId = user?.id;

            const cleanedUpCount =
                await ExpiredSaleCleanupService.cleanupExpiredSales(
                    'manual',
                    userId,
                    user, // Pass user context for data scoping
                );

            res.status(200).json(
                successResponse(
                    { cleanedUpCount },
                    `Successfully cleaned up ${cleanedUpCount} expired sales`,
                ),
            );
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get statistics about expired sales without cleaning up
     */
    async getExpiredSaleStats(req: Request, res: Response, next: NextFunction) {
        try {
            // Get user context from request for data scoping
            const user = (req as any).user;

            const stats =
                await ExpiredSaleCleanupService.getExpiredSaleStats(user);

            res.status(200).json(
                successResponse(
                    stats,
                    'Expired sale statistics retrieved successfully',
                ),
            );
        } catch (error) {
            next(error);
        }
    }
}

export const expiredSaleCleanupController = new ExpiredSaleCleanupController();
