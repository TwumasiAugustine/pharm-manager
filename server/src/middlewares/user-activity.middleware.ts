import { Request, Response, NextFunction } from 'express';
import { UserActivityService } from '../services/user-activity.service';
import { CreateUserActivityRequest } from '../types/user-activity.types';
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

/**
 * User activity tracking middleware
 */
export const userActivityTracker = (
    activityType:
        | 'LOGIN'
        | 'LOGOUT'
        | 'CREATE'
        | 'UPDATE'
        | 'DELETE'
        | 'VIEW'
        | 'DOWNLOAD'
        | 'SEARCH',
    resource:
        | 'USER'
        | 'DRUG'
        | 'SALE'
        | 'CUSTOMER'
        | 'REPORT'
        | 'SYSTEM'
        | 'DASHBOARD',
    getActionDescription: (req: Request, res: Response) => string,
    getResourceInfo?: (
        req: Request,
        res: Response,
    ) => { id?: string; name?: string },
    capturePerformance: boolean = false,
) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) {
            next();
            return;
        }

        const startTime = capturePerformance ? Date.now() : undefined;
        let originalSend: any;

        if (capturePerformance) {
            // Intercept response to capture performance metrics
            originalSend = res.send;
            res.send = function (body: any) {
                // Log activity after response is sent
                setImmediate(async () => {
                    await logUserActivity(req, res, {
                        activityType,
                        resource,
                        actionDescription: getActionDescription(req, res),
                        resourceInfo: getResourceInfo
                            ? getResourceInfo(req, res)
                            : undefined,
                        performanceMetrics: startTime
                            ? {
                                  responseTime: Date.now() - startTime,
                                  requestSize: JSON.stringify(req.body || {})
                                      .length,
                                  responseSize:
                                      typeof body === 'string'
                                          ? body.length
                                          : JSON.stringify(body).length,
                              }
                            : undefined,
                    });
                });

                return originalSend.call(this, body);
            };
        } else {
            // Log activity after response is sent (without performance metrics)
            const originalEnd = res.end;
            res.end = function (...args: any[]) {
                setImmediate(async () => {
                    await logUserActivity(req, res, {
                        activityType,
                        resource,
                        actionDescription: getActionDescription(req, res),
                        resourceInfo: getResourceInfo
                            ? getResourceInfo(req, res)
                            : undefined,
                    });
                });

                // Use .call with spread to maintain proper typing
                return (originalEnd as any).call(this, ...args);
            };
        }

        next();
    };
};

/**
 * Initialize user session on login
 */
export const initializeUserSession = (userId: string, req: Request): string => {
    const sessionId = uuidv4();
    const loginTime = new Date();

    sessionStore.set(userId, {
        sessionId,
        loginTime,
        userId,
    });

    // Log the login activity
    setImmediate(async () => {
        await logUserActivity(req, null, {
            activityType: 'LOGIN',
            resource: 'SYSTEM',
            actionDescription: 'User logged in',
            sessionId,
            loginTime,
            forceLog: true,
        });
    });

    return sessionId;
};

/**
 * End user session on logout
 */
export const endUserSession = async (
    userId: string,
    req: Request,
): Promise<void> => {
    const sessionInfo = sessionStore.get(userId);

    if (sessionInfo) {
        // Calculate session duration
        const duration = Math.round(
            (Date.now() - sessionInfo.loginTime.getTime()) / (1000 * 60),
        );

        // Log logout activity
        await logUserActivity(req, null, {
            activityType: 'LOGOUT',
            resource: 'SYSTEM',
            actionDescription: `User logged out (session duration: ${duration} minutes)`,
            sessionId: sessionInfo.sessionId,
            loginTime: sessionInfo.loginTime,
            sessionDuration: duration,
            forceLog: true,
        });

        // Update session status to inactive
        await userActivityService.updateSessionStatus(
            sessionInfo.sessionId,
            false,
        );

        // Remove from session store
        sessionStore.delete(userId);
    }
};

/**
 * Log user activity
 */
async function logUserActivity(
    req: Request,
    res: Response | null,
    options: {
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
            | 'DASHBOARD';
        actionDescription: string;
        resourceInfo?: { id?: string; name?: string };
        performanceMetrics?: {
            responseTime: number;
            requestSize: number;
            responseSize: number;
        };
        sessionId?: string;
        loginTime?: Date;
        sessionDuration?: number;
        forceLog?: boolean;
    },
): Promise<void> {
    try {
        if (!req.user && !options.forceLog) return;

        const userId = req.user?.id;
        if (!userId && !options.forceLog) return;

        // Get session info
        const sessionInfo =
            options.sessionId && options.loginTime
                ? {
                      sessionId: options.sessionId,
                      loginTime: options.loginTime,
                  }
                : sessionStore.get(userId!);

        if (!sessionInfo && !options.forceLog) {
            // If no session info and not a forced log (like login), skip
            return;
        }

        // Determine if successful operation (for non-forced logs)
        const isSuccessful =
            options.forceLog ||
            !res ||
            (res.statusCode >= 200 && res.statusCode < 300);

        if (!isSuccessful) return;

        const activityData: CreateUserActivityRequest = {
            userId: userId!,
            sessionId: sessionInfo?.sessionId || 'unknown',
            activity: {
                type: options.activityType,
                resource: options.resource,
                resourceId: options.resourceInfo?.id,
                resourceName: options.resourceInfo?.name,
                action: options.actionDescription,
                metadata: {
                    method: req.method,
                    path: req.originalUrl,
                    userAgent: req.get('User-Agent'),
                    timestamp: new Date(),
                    ...(options.performanceMetrics && {
                        performance: options.performanceMetrics,
                    }),
                },
            },
            session: {
                loginTime:
                    sessionInfo?.loginTime || options.loginTime || new Date(),
                lastActivity: new Date(),
                ipAddress: req.ip || req.connection?.remoteAddress || 'unknown',
                userAgent: req.get('User-Agent') || 'unknown',
                isActive: options.activityType !== 'LOGOUT',
                ...(options.sessionDuration && {
                    duration: options.sessionDuration,
                }),
            },
            ...(options.performanceMetrics && {
                performance: options.performanceMetrics,
            }),
        };

        await userActivityService.createUserActivity(activityData);
    } catch (error) {
        console.error('Failed to log user activity:', error);
        // Don't throw error as this would affect the main operation
    }
}

/**
 * Cleanup expired sessions (should be called periodically)
 */
export const cleanupExpiredSessions = (): void => {
    const now = Date.now();
    const sessionTimeout = 30 * 60 * 1000; // 30 minutes

    for (const [userId, sessionInfo] of sessionStore.entries()) {
        if (now - sessionInfo.loginTime.getTime() > sessionTimeout) {
            sessionStore.delete(userId);
        }
    }
};

/**
 * Get active session for user
 */
export const getUserSession = (userId: string) => {
    return sessionStore.get(userId);
};
