import { z } from 'zod';

export const createUserActivitySchema = z.object({
    userId: z.string().min(1, 'User ID is required'),
    sessionId: z.string().min(1, 'Session ID is required'),
    activity: z.object({
        type: z.enum([
            'LOGIN',
            'LOGOUT',
            'CREATE',
            'UPDATE',
            'DELETE',
            'VIEW',
            'DOWNLOAD',
            'SEARCH',
        ]),
        resource: z.enum([
            'USER',
            'DRUG',
            'SALE',
            'CUSTOMER',
            'REPORT',
            'SYSTEM',
            'DASHBOARD',
        ]),
        resourceId: z.string().optional(),
        resourceName: z.string().optional(),
        action: z.string().min(1, 'Action description is required'),
        metadata: z.record(z.any()).optional(),
    }),
    session: z.object({
        loginTime: z.date(),
        lastActivity: z.date().optional(),
        ipAddress: z.string().min(1, 'IP address is required'),
        userAgent: z.string().min(1, 'User agent is required'),
        location: z.string().optional(),
        isActive: z.boolean().optional().default(true),
        duration: z.number().optional(),
    }),
    performance: z
        .object({
            responseTime: z.number().optional(),
            requestSize: z.number().optional(),
            responseSize: z.number().optional(),
        })
        .optional(),
});

export const userActivityFiltersSchema = z.object({
    userId: z.string().optional(),
    sessionId: z.string().optional(),
    activityType: z
        .enum([
            'LOGIN',
            'LOGOUT',
            'CREATE',
            'UPDATE',
            'DELETE',
            'VIEW',
            'DOWNLOAD',
            'SEARCH',
        ])
        .optional(),
    resource: z
        .enum([
            'USER',
            'DRUG',
            'SALE',
            'CUSTOMER',
            'REPORT',
            'SYSTEM',
            'DASHBOARD',
        ])
        .optional(),
    startDate: z.date().optional(),
    endDate: z.date().optional(),
    isActive: z.boolean().optional(),
    userRole: z.string().optional(),
    ipAddress: z.string().optional(),
    page: z.number().min(1).optional().default(1),
    limit: z.number().min(1).max(100).optional().default(20),
});

export type CreateUserActivityInput = z.infer<typeof createUserActivitySchema>;
export type UserActivityFiltersInput = z.infer<
    typeof userActivityFiltersSchema
>;
