import { Request, Response, NextFunction } from 'express';
import { UserActivityService } from '../services/user-activity.service';
import { UserActivityFilters } from '../types/user-activity.types';
import { successResponse } from '../utils/response';
import { BadRequestError } from '../utils/errors';

export class UserActivityController {
    private userActivityService: UserActivityService;

    constructor() {
        this.userActivityService = new UserActivityService();
    }

    /**
     * Get user activities with filtering and pagination
     * @route GET /api/user-activities
     * @access Private (Admin only)
     */
    getUserActivities = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> => {
        try {
            const {
                page = '1',
                limit = '10',
                userId,
                sessionId,
                activityType,
                resource,
                startDate,
                endDate,
                isActive,
                userRole,
                ipAddress,
            } = req.query;

            // Parse and validate filters
            const filters: UserActivityFilters = {
                page: parseInt(page as string, 10),
                limit: Math.min(parseInt(limit as string, 10), 100), // Max 100 per page
            };

            if (userId) filters.userId = userId as string;
            if (sessionId) filters.sessionId = sessionId as string;
            if (activityType) filters.activityType = activityType as any;
            if (resource) filters.resource = resource as any;
            if (userRole) filters.userRole = userRole as string;
            if (ipAddress) filters.ipAddress = ipAddress as string;
            if (isActive !== undefined) filters.isActive = isActive === 'true';

            // Parse dates
            if (startDate) {
                filters.startDate = new Date(startDate as string);
                if (isNaN(filters.startDate.getTime())) {
                    throw new BadRequestError('Invalid start date format');
                }
            }
            if (endDate) {
                filters.endDate = new Date(endDate as string);
                if (isNaN(filters.endDate.getTime())) {
                    throw new BadRequestError('Invalid end date format');
                }
            }

            const result = await this.userActivityService.getUserActivities(
                filters,
                req.user!,
            );

            res.status(200).json(
                successResponse(
                    result,
                    'User activities retrieved successfully',
                ),
            );
        } catch (error) {
            next(error);
        }
    };

    /**
     * Get user activity statistics
     * @route GET /api/user-activities/stats
     * @access Private (Admin only)
     */
    getUserActivityStats = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> => {
        try {
            const { startDate, endDate, userId } = req.query;

            const filters: Partial<UserActivityFilters> = {};

            if (userId) filters.userId = userId as string;
            if (startDate) {
                filters.startDate = new Date(startDate as string);
                if (isNaN(filters.startDate.getTime())) {
                    throw new BadRequestError('Invalid start date format');
                }
            }
            if (endDate) {
                filters.endDate = new Date(endDate as string);
                if (isNaN(filters.endDate.getTime())) {
                    throw new BadRequestError('Invalid end date format');
                }
            }

            const stats = await this.userActivityService.getUserActivityStats(
                filters,
                req.user!,
            );

            res.status(200).json(
                successResponse(
                    stats,
                    'User activity statistics retrieved successfully',
                ),
            );
        } catch (error) {
            next(error);
        }
    };

    /**
     * Get detailed session information
     * @route GET /api/user-activities/sessions/:sessionId
     * @access Private (Admin only)
     */
    getUserSession = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> => {
        try {
            const { sessionId } = req.params;

            if (!sessionId) {
                throw new BadRequestError('Session ID is required');
            }

            const session = await this.userActivityService.getUserSession(
                sessionId,
                req.user!,
            );

            if (!session) {
                res.status(404).json({
                    success: false,
                    message: 'Session not found',
                });
                return;
            }

            res.status(200).json(
                successResponse(
                    session,
                    'Session information retrieved successfully',
                ),
            );
        } catch (error) {
            next(error);
        }
    };

    /**
     * Get current user's activities (for non-admin users)
     * @route GET /api/user-activities/my-activities
     * @access Private
     */
    getMyActivities = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> => {
        try {
            const userId = req.user!.id;
            const {
                page = '1',
                limit = '20',
                activityType,
                resource,
                startDate,
                endDate,
            } = req.query;

            // Parse filters (limited for regular users)
            const filters: UserActivityFilters = {
                userId,
                page: parseInt(page as string, 10),
                limit: Math.min(parseInt(limit as string, 10), 50), // Lower limit for regular users
            };

            if (activityType) filters.activityType = activityType as any;
            if (resource) filters.resource = resource as any;

            // Parse dates
            if (startDate) {
                filters.startDate = new Date(startDate as string);
                if (isNaN(filters.startDate.getTime())) {
                    throw new BadRequestError('Invalid start date format');
                }
            }
            if (endDate) {
                filters.endDate = new Date(endDate as string);
                if (isNaN(filters.endDate.getTime())) {
                    throw new BadRequestError('Invalid end date format');
                }
            }

            const result = await this.userActivityService.getUserActivities(
                filters,
                req.user!,
            );

            res.status(200).json(
                successResponse(
                    result,
                    'Your activities retrieved successfully',
                ),
            );
        } catch (error) {
            next(error);
        }
    };

    /**
     * Clean up old activity records
     * @route DELETE /api/user-activities/cleanup
     * @access Private (Admin only)
     */
    cleanupOldActivities = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> => {
        try {
            const { daysToKeep = '90' } = req.query;
            const days = parseInt(daysToKeep as string, 10);

            if (isNaN(days) || days < 1) {
                throw new BadRequestError(
                    'Days to keep must be a positive number',
                );
            }

            const deletedCount =
                await this.userActivityService.cleanupOldActivities(
                    days,
                    req.user!,
                );

            res.status(200).json(
                successResponse(
                    { deletedCount },
                    `Successfully cleaned up ${deletedCount} old activity records`,
                ),
            );
        } catch (error) {
            next(error);
        }
    };

    /**
     * Get active user sessions
     * @route GET /api/user-activities/active-sessions
     * @access Private (Admin only)
     */
    getActiveSessions = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> => {
        try {
            const sessions = await this.userActivityService.getActiveSessions(
                req.user!,
            );

            res.status(200).json(
                successResponse(
                    sessions,
                    'Active sessions retrieved successfully',
                ),
            );
        } catch (error) {
            next(error);
        }
    };

    /**
     * Get user activity summary for dashboard
     * @route GET /api/user-activities/summary
     * @access Private
     */
    getUserActivitySummary = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> => {
        try {
            const summary =
                await this.userActivityService.getUserActivitySummary(
                    req.user!,
                );

            res.status(200).json(
                successResponse(
                    summary,
                    'User activity summary retrieved successfully',
                ),
            );
        } catch (error) {
            next(error);
        }
    };
}
