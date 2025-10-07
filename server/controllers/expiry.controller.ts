import { Request, Response, NextFunction } from 'express';
import { ExpiryService } from '../services/expiry.service';
import { successResponse } from '../utils/response';
import type { IExpiryFilters } from '../types/expiry.types';

export class ExpiryController {
    private expiryService: ExpiryService;

    constructor() {
        this.expiryService = new ExpiryService();
    }

    /**
     * Get drugs expiring within specified days
     */
    async getExpiringDrugs(
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
        try {
            const {
                daysRange = 90,
                alertLevel,
                category,
                page = 1,
                limit = 20,
            } = req.query;

            const filters: IExpiryFilters & { page?: number; limit?: number } =
                {
                    daysRange: parseInt(daysRange as string),
                    alertLevel: alertLevel as any,
                    category: category as string,
                    page: parseInt(page as string),
                    limit: parseInt(limit as string),
                };

            const result = await this.expiryService.getExpiringDrugs(
                filters,
                req.user!,
            );

            res.status(200).json(
                successResponse(
                    result,
                    'Expiring drugs retrieved successfully',
                ),
            );
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get expiry statistics
     */
    async getExpiryStats(
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
        try {
            const { branchId } = req.query;
            const stats = await this.expiryService.getExpiryStats(
                req.user!,
                branchId as string,
            );

            res.status(200).json(
                successResponse(
                    stats,
                    'Expiry statistics retrieved successfully',
                ),
            );
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get expiry notifications
     */
    async getNotifications(
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
        try {
            const { isRead, alertLevel, page = 1, limit = 20 } = req.query;

            const filters = {
                isRead: isRead !== undefined ? isRead === 'true' : undefined,
                alertLevel: alertLevel as string,
                page: parseInt(page as string),
                limit: parseInt(limit as string),
            };

            const result = await this.expiryService.getNotifications(filters);

            res.status(200).json(
                successResponse(result, 'Notifications retrieved successfully'),
            );
        } catch (error) {
            next(error);
        }
    }

    /**
     * Mark notification as read
     */
    async markNotificationAsRead(
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
        try {
            const { id } = req.params;
            const notification =
                await this.expiryService.markNotificationAsRead(id);

            if (!notification) {
                res.status(404).json({
                    success: false,
                    message: 'Notification not found',
                });
                return;
            }

            res.status(200).json(
                successResponse(notification, 'Notification marked as read'),
            );
        } catch (error) {
            next(error);
        }
    }

    /**
     * Mark all notifications as read
     */
    async markAllNotificationsAsRead(
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
        try {
            await this.expiryService.markAllNotificationsAsRead();

            res.status(200).json(
                successResponse(null, 'All notifications marked as read'),
            );
        } catch (error) {
            next(error);
        }
    }

    /**
     * Create/refresh expiry notifications
     */
    async createExpiryNotifications(
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
        try {
            await this.expiryService.createExpiryNotifications();

            res.status(200).json(
                successResponse(
                    null,
                    'Expiry notifications created successfully',
                ),
            );
        } catch (error) {
            next(error);
        }
    }

    /**
     * Check if drug can be sold (not expired)
     */
    async checkDrugExpiry(
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
        try {
            const { drugId } = req.params;
            const result =
                await this.expiryService.isDrugExpiredOrExpiring(drugId);

            res.status(200).json(
                successResponse(result, 'Drug expiry status retrieved'),
            );
        } catch (error) {
            next(error);
        }
    }
}
