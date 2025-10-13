import { UserActivity, IUserActivity } from '../models/user-activity.model';
import User from '../models/user.model';
import {
    UserActivityFilters,
    CreateUserActivityRequest,
    UserActivityResponse,
    UserActivityStats,
    UserSessionInfo,
    UserActivitySummary,
} from '../types/user-activity.types';
import { BadRequestError, NotFoundError } from '../utils/errors';
import { ITokenPayload } from '../types/auth.types';
import {
    getPharmacyScopingFilter,
    getBranchScopingFilter,
} from '../utils/data-scoping';
import { UserRole } from '../types/user.types';

export class UserActivityService {
    /**
     * Create a new user activity record
     */
    async createUserActivity(
        data: CreateUserActivityRequest,
        user?: ITokenPayload,
    ): Promise<UserActivityResponse> {
        try {
            // Prepare activity data with optional scoping fields
            const activityData: any = {
                ...data,
            };

            // Add scoping fields if user context is available
            if (user) {
                if (user.pharmacyId) {
                    activityData.pharmacyId = user.pharmacyId;
                }
                if (user.branchId) {
                    activityData.branch = user.branchId;
                }
            }

            const activity = await UserActivity.create(activityData);
            const savedActivity = await activity.save();

            // Populate user details and return formatted response
            const populatedActivity = await UserActivity.findById(
                savedActivity._id,
            )
                .populate('userId', 'name email role pharmacyId')
                .lean();

            return this.formatActivityResponse(populatedActivity as any);
        } catch (error) {
            throw new Error(
                `Failed to create user activity record: ${error instanceof Error ? error.message : 'Unknown error'}`,
            );
        }
    }

    /**
     * Get user activities with filtering and pagination
     */
    async getUserActivities(
        filters: UserActivityFilters,
        user: ITokenPayload,
    ): Promise<UserActivitySummary> {
        const {
            page = 1,
            limit = 10,
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

        // Build query with proper data scoping
        const query: any = {};

        // Apply pharmacy-level data scoping
        // Super admin sees all activities, admins see only their pharmacy activities
        if (user.role !== UserRole.SUPER_ADMIN) {
            if (user.role === UserRole.ADMIN) {
                // Admin sees all users in their pharmacy
                const pharmacyUsers = await User.find({
                    pharmacyId: user.pharmacyId,
                }).distinct('_id');
                query['userId'] = { $in: pharmacyUsers };
            } else {
                // Pharmacist/Cashier see only users in their branch
                const scopingFilter = getBranchScopingFilter(user);
                const branchUsers =
                    await User.find(scopingFilter).distinct('_id');
                query['userId'] = { $in: branchUsers };
            }
        }

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
                .populate('userId', 'name email role pharmacyId')
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

        // Format response data
        const formattedActivities = filteredActivities.map((activity: any) =>
            this.formatActivityResponse(activity),
        );

        // Calculate total pages
        const totalPages = Math.ceil(totalCount / limit);

        return {
            totalActivities: totalCount,
            activities: formattedActivities,
            totalPages,
            currentPage: page,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
        };
    }

    /**
     * Build activity query with filters and data scoping
     */
    private async buildActivityQuery(
        filters: UserActivityFilters,
        user: ITokenPayload,
    ): Promise<any> {
        const query: any = {};

        // Apply data scoping
        if (user.role !== UserRole.SUPER_ADMIN) {
            if (user.role === UserRole.ADMIN) {
                // Admin sees all users in their pharmacy
                const pharmacyUsers = await User.find({
                    pharmacyId: user.pharmacyId,
                }).distinct('_id');
                query['userId'] = { $in: pharmacyUsers };
            } else {
                // Pharmacist/Cashier see only users in their branch
                const scopingFilter = getBranchScopingFilter(user);
                const branchUsers =
                    await User.find(scopingFilter).distinct('_id');
                query['userId'] = { $in: branchUsers };
            }
        }

        // Apply filters
        if (filters.userId) {
            query.userId = filters.userId;
        }

        if (filters.sessionId) {
            query.sessionId = filters.sessionId;
        }

        if (filters.activityType) {
            query['activity.type'] = filters.activityType;
        }

        if (filters.resource) {
            query['activity.resource'] = filters.resource;
        }

        if (filters.startDate || filters.endDate) {
            query.timestamp = {};
            if (filters.startDate) {
                query.timestamp.$gte = new Date(filters.startDate);
            }
            if (filters.endDate) {
                query.timestamp.$lte = new Date(filters.endDate);
            }
        }

        return query;
    }

    /**
     * Get comprehensive user activity statistics
     */
    async getUserActivityStats(
        filters: UserActivityFilters,
        user: ITokenPayload,
    ): Promise<UserActivityStats> {
        // Build base query with data scoping
        const query = await this.buildActivityQuery(filters, user);

        // Calculate comprehensive statistics
        const now = new Date();
        const today = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate(),
        );
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        const [
            totalActivities,
            activeUsers,
            activeSessions,
            totalSessions,
            activityTypeStats,
            resourceStats,
            userStats,
            hourlyStats,
            dailyStats,
            topActions,
        ] = await Promise.all([
            UserActivity.countDocuments(query),
            UserActivity.distinct('userId', query).then(
                (users) => users.length,
            ),
            UserActivity.countDocuments({ ...query, 'session.isActive': true }),
            UserActivity.distinct('sessionId', query).then(
                (sessions) => sessions.length,
            ),
            this.getActivityTypeBreakdown(query),
            this.getResourceBreakdown(query),
            this.getUserBreakdown(query),
            this.getHourlyActivity(query),
            this.getDailyActivity(query),
            this.getTopActions(query),
        ]);

        // Calculate average session duration
        const sessionDurations = await UserActivity.aggregate([
            { $match: query },
            {
                $group: {
                    _id: '$sessionId',
                    start: { $min: '$timestamp' },
                    end: { $max: '$timestamp' },
                },
            },
            {
                $project: {
                    duration: { $subtract: ['$end', '$start'] },
                },
            },
            {
                $group: {
                    _id: null,
                    avgDuration: { $avg: '$duration' },
                },
            },
        ]);

        const averageSessionDuration =
            sessionDurations.length > 0
                ? Math.round(sessionDurations[0].avgDuration / 1000 / 60) // Convert to minutes
                : 0;

        return {
            overview: {
                totalActivities,
                activeUsers,
                activeSessions,
                totalSessions,
                averageSessionDuration,
                totalUniqueUsers: activeUsers,
            },
            activityBreakdown: activityTypeStats,
            resourceBreakdown: resourceStats,
            userBreakdown: userStats,
            hourlyActivity: hourlyStats,
            dailyActivity: dailyStats,
            topActions,
        };
    }

    /**
     * Calculate activity statistics with proper data scoping
     */
    private async calculateActivityStats(
        baseQuery: any,
        user: ITokenPayload,
    ): Promise<UserActivityStats> {
        // Get activities for the last 24 hours
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const last24hQuery = {
            ...baseQuery,
            timestamp: { $gte: twentyFourHoursAgo },
        };

        // Get activities for the last 7 days
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const last7dQuery = { ...baseQuery, timestamp: { $gte: sevenDaysAgo } };

        const [
            totalActivities,
            last24hActivities,
            last7dActivities,
            uniqueUsers,
            activeSessions,
        ] = await Promise.all([
            UserActivity.countDocuments(baseQuery),
            UserActivity.countDocuments(last24hQuery),
            UserActivity.countDocuments(last7dQuery),
            UserActivity.distinct('userId', baseQuery).then(
                (users) => users.length,
            ),
            UserActivity.countDocuments({
                ...baseQuery,
                'session.isActive': true,
            }),
        ]);

        // Calculate activity distribution by type
        const activityDistribution = await UserActivity.aggregate([
            { $match: baseQuery },
            { $group: { _id: '$activity.type', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
        ]);

        return {
            overview: {
                totalActivities,
                activeUsers: uniqueUsers,
                activeSessions,
                totalSessions: 0, // Would need session tracking
                averageSessionDuration: 0, // Would need session tracking
                totalUniqueUsers: uniqueUsers,
            },
            activityBreakdown: activityDistribution.map((item) => ({
                type: item.type,
                count: item.count,
                percentage:
                    totalActivities > 0
                        ? Math.round((item.count / totalActivities) * 100)
                        : 0,
            })),
            resourceBreakdown: [],
            userBreakdown: [],
            hourlyActivity: [],
            dailyActivity: [],
            topActions: [],
        };
    }

    /**
     * Get active user sessions with enhanced information for super admin
     */
    async getActiveSessions(user: ITokenPayload): Promise<UserSessionInfo[]> {
        const query: any = { 'session.isActive': true };

        // Apply data scoping
        if (user.role !== UserRole.SUPER_ADMIN) {
            if (user.role === UserRole.ADMIN) {
                // Admin sees all users in their pharmacy
                const pharmacyUsers = await User.find({
                    pharmacyId: user.pharmacyId,
                }).distinct('_id');
                query['userId'] = { $in: pharmacyUsers };
            } else {
                // Pharmacist/Cashier see only users in their branch
                const scopingFilter = getBranchScopingFilter(user);
                const branchUsers =
                    await User.find(scopingFilter).distinct('_id');
                query['userId'] = { $in: branchUsers };
            }
        }

        const sessions = await UserActivity.aggregate([
            { $match: query },
            {
                $group: {
                    _id: '$sessionId',
                    userId: { $first: '$userId' },
                    startTime: { $min: '$timestamp' },
                    lastActivity: { $max: '$timestamp' },
                    activityCount: { $sum: 1 },
                    ipAddress: { $first: '$session.ipAddress' },
                    userAgent: { $first: '$session.userAgent' },
                },
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'user',
                },
            },
            { $unwind: '$user' },
            { $sort: { lastActivity: -1 } },
        ]);

        return sessions.map((session) => ({
            sessionId: session._id,
            userId: session.userId.toString(),
            userName: session.user.name,
            userEmail: session.user.email,
            userRole: session.user.role,
            loginTime: session.startTime,
            lastActivity: session.lastActivity,
            duration: Date.now() - session.startTime.getTime(),
            activityCount: session.activityCount,
            ipAddress: session.ipAddress,
            userAgent: session.userAgent,
            isActive: true,
            activities: [], // Would need to fetch detailed activities if needed
        }));
    }

    /**
     * Get detailed information about a specific user session
     */
    async getUserSession(
        sessionId: string,
        user: ITokenPayload,
    ): Promise<UserSessionInfo> {
        const query: any = { sessionId };

        // Apply data scoping
        if (user.role !== UserRole.SUPER_ADMIN) {
            if (user.role === UserRole.ADMIN) {
                // Admin sees all users in their pharmacy
                const pharmacyUsers = await User.find({
                    pharmacyId: user.pharmacyId,
                }).distinct('_id');
                query['userId'] = { $in: pharmacyUsers };
            } else {
                // Pharmacist/Cashier see only users in their branch
                const scopingFilter = getBranchScopingFilter(user);
                const branchUsers =
                    await User.find(scopingFilter).distinct('_id');
                query['userId'] = { $in: branchUsers };
            }
        }

        const activities = await UserActivity.find(query)
            .populate('userId', 'name email role')
            .sort({ timestamp: -1 })
            .lean();

        if (activities.length === 0) {
            throw new NotFoundError('Session not found');
        }

        const firstActivity = activities[activities.length - 1];
        const lastActivity = activities[0];
        const user_info = firstActivity.userId as any;

        const sessionActivities = activities.map((activity) => ({
            type: activity.activity.type,
            resource: activity.activity.resource,
            action: activity.activity.action,
            timestamp: activity.timestamp,
            resourceName: activity.activity.resourceName,
        }));

        return {
            sessionId,
            userId: user_info._id.toString(),
            userName: user_info.name,
            userEmail: user_info.email,
            userRole: user_info.role,
            loginTime: firstActivity.timestamp,
            lastActivity: lastActivity.timestamp,
            duration:
                lastActivity.timestamp.getTime() -
                firstActivity.timestamp.getTime(),
            activityCount: activities.length,
            ipAddress: firstActivity.session.ipAddress,
            userAgent: firstActivity.session.userAgent,
            location: firstActivity.session.location,
            isActive: firstActivity.session.isActive,
            activities: sessionActivities,
        };
    }

    /**
     * Cleanup old user activities
     */
    async cleanupOldActivities(
        daysToKeep: number,
        user: ITokenPayload,
    ): Promise<number> {
        // Only super admin can perform cleanup
        if (user.role !== UserRole.SUPER_ADMIN) {
            throw new BadRequestError(
                'Insufficient permissions for cleanup operation',
            );
        }

        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

        const result = await UserActivity.deleteMany({
            timestamp: { $lt: cutoffDate },
        });

        return result.deletedCount || 0;
    }

    /**
     * Helper: Get activity type breakdown
     */
    private async getActivityTypeBreakdown(query: any) {
        const result = await UserActivity.aggregate([
            { $match: query },
            { $group: { _id: '$activity.type', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
        ]);

        const total = result.reduce((sum, item) => sum + item.count, 0);
        return result.map((item) => ({
            type: item._id,
            count: item.count,
            percentage: total > 0 ? Math.round((item.count / total) * 100) : 0,
        }));
    }

    /**
     * Helper: Get resource breakdown
     */
    private async getResourceBreakdown(query: any) {
        const result = await UserActivity.aggregate([
            { $match: query },
            { $group: { _id: '$activity.resource', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
        ]);

        const total = result.reduce((sum, item) => sum + item.count, 0);
        return result.map((item) => ({
            resource: item._id,
            count: item.count,
            percentage: total > 0 ? Math.round((item.count / total) * 100) : 0,
        }));
    }

    /**
     * Helper: Get user breakdown
     */
    private async getUserBreakdown(query: any) {
        const result = await UserActivity.aggregate([
            { $match: query },
            {
                $group: {
                    _id: '$userId',
                    activityCount: { $sum: 1 },
                    lastActivity: { $max: '$timestamp' },
                },
            },
            { $sort: { activityCount: -1 } },
            { $limit: 10 },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'user',
                },
            },
            { $unwind: '$user' },
        ]);

        return result.map((item) => ({
            userId: item._id.toString(),
            userName: item.user.name,
            userEmail: item.user.email,
            userRole: item.user.role,
            activityCount: item.activityCount,
            lastActivity: item.lastActivity,
            averageSessionDuration: 0, // Would need session tracking for this
        }));
    }

    /**
     * Helper: Get hourly activity
     */
    private async getHourlyActivity(query: any) {
        const result = await UserActivity.aggregate([
            { $match: query },
            {
                $group: {
                    _id: { $hour: '$timestamp' },
                    count: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
        ]);

        // Fill in missing hours
        const hourlyData = Array.from({ length: 24 }, (_, hour) => ({
            hour,
            count: 0,
        }));

        result.forEach((item) => {
            if (item._id >= 0 && item._id < 24) {
                hourlyData[item._id].count = item.count;
            }
        });

        return hourlyData;
    }

    /**
     * Helper: Get daily activity
     */
    private async getDailyActivity(query: any) {
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const dailyQuery = { ...query, timestamp: { $gte: sevenDaysAgo } };

        const result = await UserActivity.aggregate([
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

        return result.map((item) => ({
            date: item.date.toISOString().split('T')[0],
            count: item.count,
            uniqueUsers: item.uniqueUsers,
        }));
    }

    /**
     * Helper: Get top actions
     */
    private async getTopActions(query: any) {
        const result = await UserActivity.aggregate([
            { $match: query },
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

        return result.map((item) => ({
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
            activity: {
                type: activity.activity.type,
                resource: activity.activity.resource,
                resourceId: activity.activity.resourceId,
                resourceName: activity.activity.resourceName,
                action: activity.activity.action,
                metadata: activity.activity.metadata,
            },
            session: {
                loginTime: new Date(
                    activity.session.startTime || activity.timestamp,
                ),
                lastActivity: activity.timestamp,
                ipAddress: activity.session.ipAddress,
                userAgent: activity.session.userAgent,
                location: activity.session.location,
                isActive: activity.session.isActive,
                duration: activity.session.duration,
            },
            timestamp: activity.timestamp,
            createdAt: activity.createdAt,
            updatedAt: activity.updatedAt,
        };
    }

    /**
     * Get user activity summary for dashboard
     */
    async getUserActivitySummary(user: ITokenPayload): Promise<any> {
        const query: any = {};

        // Apply data scoping
        if (user.role !== UserRole.SUPER_ADMIN) {
            if (user.role === UserRole.ADMIN) {
                // Admin sees all users in their pharmacy
                const pharmacyUsers = await User.find({
                    pharmacyId: user.pharmacyId,
                }).distinct('_id');
                query['userId'] = { $in: pharmacyUsers };
            } else {
                // Pharmacist/Cashier see only users in their branch
                const scopingFilter = getBranchScopingFilter(user);
                const branchUsers =
                    await User.find(scopingFilter).distinct('_id');
                query['userId'] = { $in: branchUsers };
            }
        }

        const [
            todayActivity,
            weeklyActivity,
            monthlyActivity,
            topActiveUsers,
            recentActivities,
            totalSessions,
            activeSessions,
            totalUsers,
        ] = await Promise.all([
            this.getTodaySpecificActivities(query),
            this.getWeeklySpecificActivities(query),
            this.getActivitiesInPeriod(query, 30),
            this.getTopActiveUsers(query, 5),
            this.getRecentSpecificActivities(query, 10),
            this.getTotalSessions(query),
            this.getActiveSessionsCount(query),
            this.getTotalUsers(query),
        ]);

        return {
            totalSessions,
            activeSessions,
            totalUsers,
            todayActivity,
            weeklyActivity,
            monthlyActivity,
            topActiveUsers,
            recentActivities,
        };
    }

    private async getActivitiesInPeriod(
        baseQuery: any,
        days: number,
    ): Promise<number> {
        const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
        return UserActivity.countDocuments({
            ...baseQuery,
            timestamp: { $gte: startDate },
        });
    }

    private async getTopActiveUsers(
        baseQuery: any,
        limit: number,
    ): Promise<any[]> {
        return UserActivity.aggregate([
            { $match: baseQuery },
            {
                $group: {
                    _id: '$userId',
                    activityCount: { $sum: 1 },
                    lastActivity: { $max: '$timestamp' },
                },
            },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'user',
                },
            },
            { $unwind: '$user' },
            { $sort: { activityCount: -1 } },
            { $limit: limit },
            {
                $project: {
                    userId: '$_id',
                    userName: '$user.name',
                    userRole: '$user.role',
                    activityCount: 1,
                    lastActivity: 1,
                },
            },
        ]);
    }

    private async getRecentActivities(
        baseQuery: any,
        limit: number,
    ): Promise<any[]> {
        const activities = await UserActivity.find(baseQuery)
            .populate('userId', 'name role')
            .sort({ timestamp: -1 })
            .limit(limit)
            .lean();

        return activities.map((activity) => ({
            id: activity._id.toString(),
            userName: (activity.userId as any).name,
            userRole: (activity.userId as any).role,
            action: activity.activity.type,
            resource: activity.activity.resource,
            timestamp: activity.timestamp,
        }));
    }

    /**
     * Update session status (active/inactive)
     */
    async updateSessionStatus(
        sessionId: string,
        isActive: boolean,
    ): Promise<void> {
        try {
            await UserActivity.updateMany(
                { sessionId },
                {
                    $set: {
                        'session.isActive': isActive,
                        ...(isActive ? {} : { 'session.endTime': new Date() }),
                    },
                },
            );
        } catch (error) {
            throw new BadRequestError(
                `Failed to update session status: ${error}`,
            );
        }
    }

    private async getTotalSessions(baseQuery: any): Promise<number> {
        const result = await UserActivity.aggregate([
            { $match: baseQuery },
            {
                $group: {
                    _id: '$sessionId',
                },
            },
            {
                $count: 'totalSessions',
            },
        ]);

        return result.length > 0 ? result[0].totalSessions : 0;
    }

    private async getActiveSessionsCount(baseQuery: any): Promise<number> {
        const result = await UserActivity.aggregate([
            { $match: baseQuery },
            {
                $group: {
                    _id: '$sessionId',
                    lastActivity: { $max: '$timestamp' },
                },
            },
            {
                $match: {
                    lastActivity: {
                        $gte: new Date(Date.now() - 30 * 60 * 1000), // Active in last 30 minutes
                    },
                },
            },
            {
                $count: 'activeSessions',
            },
        ]);

        return result.length > 0 ? result[0].activeSessions : 0;
    }

    private async getTotalUsers(baseQuery: any): Promise<number> {
        const result = await UserActivity.aggregate([
            { $match: baseQuery },
            {
                $group: {
                    _id: '$userId',
                },
            },
            {
                $count: 'totalUsers',
            },
        ]);

        return result.length > 0 ? result[0].totalUsers : 0;
    }

    /**
     * Get today's specific activities with action breakdown
     */
    private async getTodaySpecificActivities(baseQuery: any): Promise<any> {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const query = {
            ...baseQuery,
            timestamp: { $gte: today, $lt: tomorrow },
        };

        const activities = await UserActivity.aggregate([
            { $match: query },
            {
                $group: {
                    _id: {
                        resource: '$activity.resource',
                        action: '$activity.action',
                    },
                    count: { $sum: 1 },
                    users: { $addToSet: '$userId' },
                },
            },
            {
                $project: {
                    resource: '$_id.resource',
                    action: '$_id.action',
                    count: 1,
                    uniqueUsers: { $size: '$users' },
                },
            },
            { $sort: { count: -1 } },
        ]);

        // Group by resource for better organization
        const resourceGroups: any = {};
        let totalActivities = 0;

        activities.forEach((activity) => {
            const resource = activity.resource || 'unknown';
            if (!resourceGroups[resource]) {
                resourceGroups[resource] = [];
            }
            resourceGroups[resource].push({
                action: activity.action,
                count: activity.count,
                uniqueUsers: activity.uniqueUsers,
            });
            totalActivities += activity.count;
        });

        return {
            totalActivities,
            byResource: resourceGroups,
            topActions: activities.slice(0, 10),
        };
    }

    /**
     * Get this week's specific activities with action breakdown
     */
    private async getWeeklySpecificActivities(baseQuery: any): Promise<any> {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        weekAgo.setHours(0, 0, 0, 0);

        const query = {
            ...baseQuery,
            timestamp: { $gte: weekAgo },
        };

        const activities = await UserActivity.aggregate([
            { $match: query },
            {
                $group: {
                    _id: {
                        resource: '$activity.resource',
                        action: '$activity.action',
                        day: {
                            $dateToString: {
                                format: '%Y-%m-%d',
                                date: '$timestamp',
                            },
                        },
                    },
                    count: { $sum: 1 },
                    users: { $addToSet: '$userId' },
                },
            },
            {
                $group: {
                    _id: {
                        resource: '$_id.resource',
                        action: '$_id.action',
                    },
                    totalCount: { $sum: '$count' },
                    dailyBreakdown: {
                        $push: {
                            day: '$_id.day',
                            count: '$count',
                            users: { $size: '$users' },
                        },
                    },
                    uniqueUsers: { $addToSet: '$users' },
                },
            },
            {
                $project: {
                    resource: '$_id.resource',
                    action: '$_id.action',
                    totalCount: 1,
                    dailyBreakdown: 1,
                    uniqueUsers: {
                        $size: {
                            $reduce: {
                                input: '$uniqueUsers',
                                initialValue: [],
                                in: { $setUnion: ['$$value', '$$this'] },
                            },
                        },
                    },
                },
            },
            { $sort: { totalCount: -1 } },
        ]);

        // Group by resource
        const resourceGroups: any = {};
        let totalActivities = 0;

        activities.forEach((activity) => {
            const resource = activity.resource || 'unknown';
            if (!resourceGroups[resource]) {
                resourceGroups[resource] = [];
            }
            resourceGroups[resource].push({
                action: activity.action,
                totalCount: activity.totalCount,
                uniqueUsers: activity.uniqueUsers,
                dailyBreakdown: activity.dailyBreakdown,
            });
            totalActivities += activity.totalCount;
        });

        return {
            totalActivities,
            byResource: resourceGroups,
            topActions: activities.slice(0, 15),
        };
    }

    /**
     * Get recent specific activities with detailed information
     */
    private async getRecentSpecificActivities(
        baseQuery: any,
        limit: number,
    ): Promise<any[]> {
        const activities = await UserActivity.find(baseQuery)
            .populate('userId', 'name email role')
            .sort({ timestamp: -1 })
            .limit(limit)
            .lean();

        return activities.map((activity: any) => ({
            id: activity._id,
            user: {
                id: activity.userId._id,
                name: activity.userId.name,
                email: activity.userId.email,
                role: activity.userId.role,
            },
            activity: {
                type: activity.activity.type,
                resource: activity.activity.resource,
                action: activity.activity.action,
                resourceName: activity.activity.resourceName,
                description: this.getActivityDescription(activity.activity),
            },
            timestamp: activity.timestamp,
            ipAddress: activity.session?.ipAddress,
        }));
    }

    /**
     * Generate human-readable activity description
     */
    private getActivityDescription(activity: any): string {
        const { resource, action, resourceName } = activity;
        const name = resourceName || 'item';

        switch (resource) {
            case 'DRUG':
                switch (action) {
                    case 'CREATE':
                        return `Created new drug: ${name}`;
                    case 'UPDATE':
                        return `Updated drug: ${name}`;
                    case 'DELETE':
                        return `Deleted drug: ${name}`;
                    case 'VIEW':
                        return `Viewed drug: ${name}`;
                    default:
                        return `${action} drug: ${name}`;
                }
            case 'SALE':
                switch (action) {
                    case 'CREATE':
                        return `Processed new sale: ${name}`;
                    case 'UPDATE':
                        return `Updated sale: ${name}`;
                    case 'DELETE':
                        return `Cancelled sale: ${name}`;
                    case 'VIEW':
                        return `Viewed sale: ${name}`;
                    default:
                        return `${action} sale: ${name}`;
                }
            case 'CUSTOMER':
                switch (action) {
                    case 'CREATE':
                        return `Added new customer: ${name}`;
                    case 'UPDATE':
                        return `Updated customer: ${name}`;
                    case 'DELETE':
                        return `Removed customer: ${name}`;
                    case 'VIEW':
                        return `Viewed customer: ${name}`;
                    default:
                        return `${action} customer: ${name}`;
                }
            case 'USER':
                switch (action) {
                    case 'CREATE':
                        return `Created new user: ${name}`;
                    case 'UPDATE':
                        return `Updated user: ${name}`;
                    case 'DELETE':
                        return `Deleted user: ${name}`;
                    case 'LOGIN':
                        return `User logged in`;
                    case 'LOGOUT':
                        return `User logged out`;
                    default:
                        return `${action} user: ${name}`;
                }
            case 'BRANCH':
                switch (action) {
                    case 'CREATE':
                        return `Created new branch: ${name}`;
                    case 'UPDATE':
                        return `Updated branch: ${name}`;
                    case 'DELETE':
                        return `Deleted branch: ${name}`;
                    default:
                        return `${action} branch: ${name}`;
                }
            case 'REPORT':
                switch (action) {
                    case 'GENERATE':
                        return `Generated report: ${name}`;
                    case 'VIEW':
                        return `Viewed report: ${name}`;
                    case 'EXPORT':
                        return `Exported report: ${name}`;
                    default:
                        return `${action} report: ${name}`;
                }
            case 'EXPIRY':
                switch (action) {
                    case 'CHECK':
                        return `Checked expiry for: ${name}`;
                    case 'UPDATE':
                        return `Updated expiry data`;
                    case 'ALERT':
                        return `Generated expiry alert`;
                    default:
                        return `${action} expiry: ${name}`;
                }
            default:
                return `${action} ${resource}: ${name}`;
        }
    }

    /**
     * Alias for cleanupOldActivities (for backward compatibility)
     */
    async cleanupOldActivity(daysToKeep: number): Promise<number> {
        // Create a mock user with SUPER_ADMIN role for internal cleanup
        const systemUser = {
            id: 'system',
            role: UserRole.SUPER_ADMIN,
            pharmacyId: 'system',
            branchId: 'system',
            name: 'System',
            email: 'system@internal',
            isFirstSetup: false,
        } as ITokenPayload;

        return this.cleanupOldActivities(daysToKeep, systemUser);
    }
}
