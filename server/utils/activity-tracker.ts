import { Request } from 'express';
import { UserActivityService } from '../services/user-activity.service';
import { CreateUserActivityRequest } from '../types/user-activity.types';
import { ITokenPayload } from '../types/auth.types';
import { v4 as uuidv4 } from 'uuid';

const userActivityService = new UserActivityService();

// Store session info in memory (in production, use Redis)
const sessionStore = new Map<
    string,
    {
        sessionId: string;
        loginTime: Date;
        userId: string;
    }
>();

export interface ActivityOptions {
    activityType:
        | 'LOGIN'
        | 'LOGOUT'
        | 'CREATE'
        | 'UPDATE'
        | 'DELETE'
        | 'VIEW'
        | 'DOWNLOAD'
        | 'SEARCH';
    resource:
        | 'USER'
        | 'DRUG'
        | 'SALE'
        | 'CUSTOMER'
        | 'REPORT'
        | 'SYSTEM'
        | 'DASHBOARD'
        | 'BRANCH'
        | 'EXPIRY';
    action: string;
    resourceId?: string;
    resourceName?: string;
    metadata?: Record<string, any>;
}

/**
 * Track user activity
 */
export const trackActivity = async (
    userId: string,
    activityType: ActivityOptions['activityType'],
    resource: ActivityOptions['resource'],
    metadata?: Record<string, any>,
): Promise<void> => {
    try {
        if (!userId) return;

        // Get or create session
        let sessionInfo = sessionStore.get(userId);
        let sessionId = sessionInfo?.sessionId || uuidv4();

        if (!sessionInfo || activityType === 'LOGIN') {
            sessionInfo = {
                sessionId,
                loginTime: new Date(),
                userId: userId,
            };
            sessionStore.set(userId, sessionInfo);
        }

        // Create activity record
        const activityData: CreateUserActivityRequest = {
            userId: userId,
            sessionId: sessionInfo.sessionId,
            activity: {
                type: activityType,
                resource: resource,
                resourceId: metadata?.resourceId,
                resourceName: metadata?.resourceName,
                action: metadata?.action || `${activityType}_${resource}`,
                metadata: metadata,
            },
            session: {
                loginTime: sessionInfo.loginTime,
                lastActivity: new Date(),
                ipAddress: metadata?.ipAddress || 'unknown',
                userAgent: metadata?.userAgent || 'unknown',
                isActive: true,
            },
            performance: {
                requestSize: metadata?.requestSize || 0,
            },
        };

        // Save activity (don't await to avoid blocking the response)
        userActivityService.createUserActivity(activityData).catch((error) => {
            console.error('Failed to track user activity:', error);
        });

        // Update session store
        sessionStore.set(userId, {
            ...sessionInfo,
            sessionId: sessionInfo.sessionId,
        });
    } catch (error) {
        console.error('Activity tracking error:', error);
        // Don't throw error to avoid breaking the main request
    }
};

/**
 * Mark session as inactive (for logout)
 */
export const markSessionInactive = async (userId: string): Promise<void> => {
    try {
        const sessionInfo = sessionStore.get(userId);
        if (sessionInfo) {
            await userActivityService.updateSessionStatus(
                sessionInfo.sessionId,
                false,
            );
            sessionStore.delete(userId);
        }
    } catch (error) {
        console.error('Failed to mark session inactive:', error);
    }
};

/**
 * Get resource name helper
 */
export const getResourceName = (req: Request, resourceType: string): string => {
    switch (resourceType) {
        case 'DRUG':
            return (
                req.body?.name ||
                req.params?.name ||
                `Drug ${req.params?.id || 'Unknown'}`
            );
        case 'SALE':
            return `Sale ${req.params?.id || 'New'}`;
        case 'CUSTOMER':
            return req.body?.name || `Customer ${req.params?.id || 'Unknown'}`;
        case 'USER':
            return (
                req.body?.name ||
                req.body?.email ||
                `User ${req.params?.id || 'Unknown'}`
            );
        case 'BRANCH':
            return req.body?.name || `Branch ${req.params?.id || 'Unknown'}`;
        case 'REPORT':
            return (req.query?.type as string) || 'Report';
        default:
            return 'Unknown';
    }
};
