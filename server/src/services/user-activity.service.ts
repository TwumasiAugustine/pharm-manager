import { UserActivity, IUserActivity } from '../models/user-activity.model';
import { User } from '../models/user.model';
import {
    UserActivityFilters,
    CreateUserActivityRequest,
    UserActivityResponse,
    UserActivityStats,
    UserSessionInfo,
    UserActivitySummary,
} from '../types/user-activity.types';
import { BadRequestError } from '../utils/errors';

export class UserActivityService {
    /**
     * Create a new user activity record
     */
    async createUserActivity(
        data: CreateUserActivityRequest,
    ): Promise<UserActivityResponse> {
        try {
            const activity = new UserActivity(data);
            const savedActivity = await activity.save();

            // Populate user details and return formatted response
            const populatedActivity = await UserActivity.findById(
                savedActivity._id,
            )
                .populate('userId', 'name email role')
                .lean();

            return this.formatActivityResponse(populatedActivity as any);
        } catch (error) {
            throw new BadRequestError('Failed to create user activity record');
        }
    }

    /**
     * Get user activities with filtering and pagination
     */
    async getUserActivities(
        filters: UserActivityFilters,
    ): Promise<UserActivitySummary> {
        const {
            page = 1,
            limit = 20,
            userId,
            sessionId,
            activityType,
            resource,
            startDate,
            endDate,
            isActive,
            userRole,
            ipAddress,
        } = filters;

        // Build query
        const query: any = {};

        if (userId) query.userId = userId;
        if (sessionId) query.sessionId = sessionId;
        if (activityType) query['activity.type'] = activityType;
        if (resource) query['activity.resource'] = resource;
        if (isActive !== undefined) query['session.isActive'] = isActive;
        if (ipAddress)
            query['session.ipAddress'] = { $regex: ipAddress, $options: 'i' };

        // Date range filter
        if (startDate || endDate) {
            query.timestamp = {};
            if (startDate) query.timestamp.$gte = startDate;
            if (endDate) query.timestamp.$lte = endDate;
        }

        // Calculate skip value
        const skip = (page - 1) * limit;

        // Execute query with pagination
        const [activities, totalCount] = await Promise.all([
            UserActivity.find(query)
                .populate('userId', 'name email role')
                .sort({ timestamp: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            UserActivity.countDocuments(query),
        ]);

        // Filter by user role if specified
        let filteredActivities = activities;
        if (userRole) {
            filteredActivities = activities.filter(
                (activity: any) => activity.userId?.role === userRole,
            );
        }

        // Calculate pagination info
        const totalPages = Math.ceil(totalCount / limit);
        const hasNextPage = page < totalPages;
        const hasPrevPage = page > 1;

        return {
            totalActivities: totalCount,
            activities: filteredActivities.map((activity) =>
                this.formatActivityResponse(activity as any),
            ),
            totalPages,
            currentPage: page,
            hasNextPage,
            hasPrevPage,
        };
    }

    /**
     * Get user activity statistics
     */
    async getUserActivityStats(
        filters: Partial<UserActivityFilters> = {},
    ): Promise<UserActivityStats> {
        const { startDate, endDate, userId } = filters;

        // Build base query
        const baseQuery: any = {};
        if (userId) baseQuery.userId = userId;
        if (startDate || endDate) {
            baseQuery.timestamp = {};
            if (startDate) baseQuery.timestamp.$gte = startDate;
            if (endDate) baseQuery.timestamp.$lte = endDate;
        }

        // Get overview statistics
        const [
            totalActivities,
            uniqueUsers,
            activeSessions,
            totalSessions,
            activityBreakdown,
            resourceBreakdown,
            userBreakdown,
            hourlyActivity,
            dailyActivity,
            topActions,
        ] = await Promise.all([
            UserActivity.countDocuments(baseQuery),
            UserActivity.distinct('userId', baseQuery).then(
                (users) => users.length,
            ),
            UserActivity.distinct('sessionId', {
                ...baseQuery,
                'session.isActive': true,
            }).then((sessions) => sessions.length),
            UserActivity.distinct('sessionId', baseQuery).then(
                (sessions) => sessions.length,
            ),
            this.getActivityBreakdown(baseQuery),
            this.getResourceBreakdown(baseQuery),
            this.getUserBreakdown(baseQuery),
            this.getHourlyActivity(baseQuery),
            this.getDailyActivity(baseQuery),
            this.getTopActions(baseQuery),
        ]);

        // Calculate average session duration
        const avgDurationResult = await UserActivity.aggregate([
            { $match: baseQuery },
            {
                $group: {
                    _id: null,
                    avgDuration: { $avg: '$session.duration' },
                },
            },
        ]);
        const averageSessionDuration = avgDurationResult[0]?.avgDuration || 0;

        return {
            overview: {
                totalActivities,
                activeUsers: uniqueUsers,
                activeSessions,
                totalSessions,
                averageSessionDuration: Math.round(averageSessionDuration),
                totalUniqueUsers: uniqueUsers,
            },
            activityBreakdown,
            resourceBreakdown,
            userBreakdown,
            hourlyActivity,
            dailyActivity,
            topActions,
        };
    }

    /**
     * Get detailed session information for a user
     */
    async getUserSession(sessionId: string): Promise<UserSessionInfo | null> {
        const activities = await UserActivity.find({ sessionId })
            .populate('userId', 'name email role')
            .sort({ timestamp: 1 })
            .lean();

        if (!activities.length) return null;

        const firstActivity = activities[0] as any;
        const lastActivity = activities[activities.length - 1] as any;

        const loginTime = firstActivity.session.loginTime;
        const lastActivityTime = lastActivity.session.lastActivity;
        const duration = Math.round(
            (lastActivityTime.getTime() - loginTime.getTime()) / (1000 * 60),
        ); // in minutes

        return {
            sessionId,
            userId: firstActivity.userId._id.toString(),
            userName: firstActivity.userId.name,
            userEmail: firstActivity.userId.email,
            userRole: firstActivity.userId.role,
            loginTime,
            lastActivity: lastActivityTime,
            duration,
            activityCount: activities.length,
            ipAddress: firstActivity.session.ipAddress,
            userAgent: firstActivity.session.userAgent,
            location: firstActivity.session.location,
            isActive: firstActivity.session.isActive,
            activities: activities.map((activity: any) => ({
                type: activity.activity.type,
                resource: activity.activity.resource,
                action: activity.activity.action,
                timestamp: activity.timestamp,
                resourceName: activity.activity.resourceName,
            })),
        };
    }

    /**
     * Update session status (mark as inactive on logout)
     */
    async updateSessionStatus(
        sessionId: string,
        isActive: boolean,
    ): Promise<void> {
        await UserActivity.updateMany(
            { sessionId },
            {
                $set: {
                    'session.isActive': isActive,
                    'session.lastActivity': new Date(),
                },
            },
        );
    }

    /**
     * Clean up old activity records
     */
    async cleanupOldActivities(daysToKeep: number = 90): Promise<number> {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

        const result = await UserActivity.deleteMany({
            timestamp: { $lt: cutoffDate },
        });

        return result.deletedCount || 0;
    }

    /**
     * Get user activity breakdown by type
     */
    private async getActivityBreakdown(baseQuery: any) {
        const breakdown = await UserActivity.aggregate([
            { $match: baseQuery },
            { $group: { _id: '$activity.type', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
        ]);

        const total = breakdown.reduce((sum, item) => sum + item.count, 0);

        return breakdown.map((item) => ({
            type: item._id,
            count: item.count,
            percentage: total > 0 ? Math.round((item.count / total) * 100) : 0,
        }));
    }

    /**
     * Get resource breakdown
     */
    private async getResourceBreakdown(baseQuery: any) {
        const breakdown = await UserActivity.aggregate([
            { $match: baseQuery },
            { $group: { _id: '$activity.resource', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
        ]);

        const total = breakdown.reduce((sum, item) => sum + item.count, 0);

        return breakdown.map((item) => ({
            resource: item._id,
            count: item.count,
            percentage: total > 0 ? Math.round((item.count / total) * 100) : 0,
        }));
    }

    /**
     * Get user breakdown with activity counts
     */
    private async getUserBreakdown(baseQuery: any) {
        const breakdown = await UserActivity.aggregate([
            { $match: baseQuery },
            {
                $group: {
                    _id: '$userId',
                    count: { $sum: 1 },
                    lastActivity: { $max: '$timestamp' },
                    avgDuration: { $avg: '$session.duration' },
                },
            },
            { $sort: { count: -1 } },
            { $limit: 10 },
        ]);

        // Populate user details
        const userIds = breakdown.map((item) => item._id);
        const users = await User.find({ _id: { $in: userIds } }).lean();
        const userMap = users.reduce((map, user) => {
            map[user._id.toString()] = user;
            return map;
        }, {} as any);

        return breakdown.map((item) => {
            const user = userMap[item._id.toString()];
            return {
                userId: item._id.toString(),
                userName: user?.name || 'Unknown',
                userEmail: user?.email || 'Unknown',
                userRole: user?.role || 'Unknown',
                activityCount: item.count,
                lastActivity: item.lastActivity,
                averageSessionDuration: Math.round(item.avgDuration || 0),
            };
        });
    }

    /**
     * Get hourly activity distribution
     */
    private async getHourlyActivity(baseQuery: any) {
        const hourlyData = await UserActivity.aggregate([
            { $match: baseQuery },
            {
                $group: {
                    _id: { $hour: '$timestamp' },
                    count: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
        ]);

        // Fill in missing hours with 0 count
        const result = Array.from({ length: 24 }, (_, hour) => {
            const found = hourlyData.find((item) => item._id === hour);
            return {
                hour,
                count: found ? found.count : 0,
            };
        });

        return result;
    }

    /**
     * Get daily activity for the last 30 days
     */
    private async getDailyActivity(baseQuery: any) {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const dailyQuery = {
            ...baseQuery,
            timestamp: { $gte: thirtyDaysAgo },
        };

        const dailyData = await UserActivity.aggregate([
            { $match: dailyQuery },
            {
                $group: {
                    _id: {
                        year: { $year: '$timestamp' },
                        month: { $month: '$timestamp' },
                        day: { $dayOfMonth: '$timestamp' },
                    },
                    count: { $sum: 1 },
                    uniqueUsers: { $addToSet: '$userId' },
                },
            },
            {
                $project: {
                    date: {
                        $dateFromParts: {
                            year: '$_id.year',
                            month: '$_id.month',
                            day: '$_id.day',
                        },
                    },
                    count: 1,
                    uniqueUsers: { $size: '$uniqueUsers' },
                },
            },
            { $sort: { date: 1 } },
        ]);

        return dailyData.map((item) => ({
            date: item.date.toISOString().split('T')[0],
            count: item.count,
            uniqueUsers: item.uniqueUsers,
        }));
    }

    /**
     * Get top actions performed
     */
    private async getTopActions(baseQuery: any) {
        const topActions = await UserActivity.aggregate([
            { $match: baseQuery },
            {
                $group: {
                    _id: {
                        action: '$activity.action',
                        resource: '$activity.resource',
                    },
                    count: { $sum: 1 },
                },
            },
            { $sort: { count: -1 } },
            { $limit: 10 },
        ]);

        return topActions.map((item) => ({
            action: item._id.action,
            resource: item._id.resource,
            count: item.count,
        }));
    }

    /**
     * Format activity response
     */
    private formatActivityResponse(activity: any): UserActivityResponse {
        return {
            id: activity._id.toString(),
            userId: {
                id: activity.userId._id.toString(),
                name: activity.userId.name,
                email: activity.userId.email,
                role: activity.userId.role,
            },
            sessionId: activity.sessionId,
            activity: activity.activity,
            session: activity.session,
            performance: activity.performance,
            timestamp: activity.timestamp,
            createdAt: activity.createdAt,
            updatedAt: activity.updatedAt,
        };
    }
}
