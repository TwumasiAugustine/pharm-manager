import { Request, Response, NextFunction } from 'express';
import { DashboardService } from '../services/dashboard.service';
import { successResponse } from '../utils/response';

export class DashboardController {
    private dashboardService: DashboardService;

    constructor() {
        this.dashboardService = new DashboardService();
    }

    /**
     * Get dashboard analytics
     * @route GET /api/dashboard/analytics
     * @access Private
     */
    async getDashboardAnalytics(
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
        try {
            const {
                startDate,
                endDate,
                period = 'month',
                branchId,
            } = req.query as {
                startDate?: string;
                endDate?: string;
                period?: 'day' | 'week' | 'month' | 'year';
                branchId?: string;
            };

            const analytics = await this.dashboardService.getDashboardAnalytics(
                {
                    startDate,
                    endDate,
                    period,
                    branchId,
                },
                req.user!, // Pass user context for data scoping
            );

            res.status(200).json(
                successResponse(
                    analytics,
                    'Dashboard analytics retrieved successfully',
                ),
            );
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get sales trends for charts
     * @route GET /api/dashboard/trends
     * @access Private
     */
    async getSalesTrends(
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
        try {
            const {
                startDate,
                endDate,
                period = 'day',
            } = req.query as {
                startDate?: string;
                endDate?: string;
                period?: 'day' | 'week' | 'month';
            };

            const trends = await this.dashboardService.getSalesTrends(
                {
                    startDate,
                    endDate,
                    period,
                },
                req.user!,
            );

            res.status(200).json(
                successResponse(trends, 'Sales trends retrieved successfully'),
            );
        } catch (error) {
            next(error);
        }
    }
}
