import { Request, Response, NextFunction } from 'express';
import { AuditLogService } from '../services/audit-log.service';
import type { CreateAuditLogRequest } from '../types/audit-log.types';

const auditLogService = new AuditLogService();

/**
 * Audit logging middleware that tracks user actions
 */
export const auditLogger = (
    action: 'LOGIN' | 'LOGOUT' | 'CREATE' | 'UPDATE' | 'DELETE' | 'VIEW',
    resource: 'USER' | 'DRUG' | 'SALE' | 'CUSTOMER' | 'REPORT' | 'SYSTEM',
    getDescription: (req: Request, res: Response) => string,
    getResourceId?: (req: Request, res: Response) => string,
    captureChanges: boolean = false,
) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        // Store original data for comparison if capturing changes
        let originalData: any = null;
        
        if (captureChanges && (action === 'UPDATE' || action === 'DELETE') && getResourceId) {
            try {
                const resourceId = getResourceId(req, res);
                // This would need to be enhanced based on the specific resource
                // For now, we'll store the request body as a reference
                originalData = { ...req.body };
            } catch (error) {
                // Continue without original data if we can't capture it
            }
        }

        // Intercept the response to log after the action is completed
        const originalSend = res.send;
        res.send = function (body: any) {
            // Only log if the request was successful (2xx status codes)
            if (res.statusCode >= 200 && res.statusCode < 300 && req.user) {
                // Create audit log entry asynchronously (don't block response)
                setImmediate(async () => {
                    try {
                        const auditData: CreateAuditLogRequest = {
                            userId: req.user!.id,
                            action,
                            resource,
                            resourceId: getResourceId ? getResourceId(req, res) : undefined,
                            details: {
                                description: getDescription(req, res),
                                userRole: req.user!.role,
                                ipAddress: req.ip || req.connection.remoteAddress,
                                userAgent: req.get('User-Agent'),
                                ...(captureChanges && originalData && {
                                    oldValues: originalData,
                                }),
                                ...(captureChanges && req.body && {
                                    newValues: req.body,
                                }),
                            },
                        };

                        await auditLogService.createAuditLog(auditData);
                    } catch (error) {
                        console.error('Failed to create audit log:', error);
                        // Don't throw error as this would affect the main response
                    }
                });
            }

            return originalSend.call(this, body);
        };

        next();
    };
};

/**
 * Quick audit logging function for use in controllers
 */
export const logAuditEvent = async (
    userId: string,
    action: 'LOGIN' | 'LOGOUT' | 'CREATE' | 'UPDATE' | 'DELETE' | 'VIEW',
    resource: 'USER' | 'DRUG' | 'SALE' | 'CUSTOMER' | 'REPORT' | 'SYSTEM',
    description: string,
    options: {
        resourceId?: string;
        userRole?: string;
        ipAddress?: string;
        userAgent?: string;
        oldValues?: Record<string, any>;
        newValues?: Record<string, any>;
    } = {},
): Promise<void> => {
    try {
        const auditData: CreateAuditLogRequest = {
            userId,
            action,
            resource,
            resourceId: options.resourceId,
            details: {
                description,
                userRole: options.userRole,
                ipAddress: options.ipAddress,
                userAgent: options.userAgent,
                oldValues: options.oldValues,
                newValues: options.newValues,
            },
        };

        await auditLogService.createAuditLog(auditData);
    } catch (error) {
        console.error('Failed to log audit event:', error);
        // Don't throw error as this would affect the main operation
    }
};
