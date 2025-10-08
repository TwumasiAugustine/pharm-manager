export interface UserActivityFilters {
    userId?: string;
    sessionId?: string;
    activityType?:
        | 'LOGIN'
        | 'LOGOUT'
        | 'CREATE'
        | 'UPDATE'
        | 'DELETE'
        | 'VIEW'
        | 'DOWNLOAD'
        | 'SEARCH';
    resource?:
        | 'USER'
        | 'DRUG'
        | 'SALE'
        | 'CUSTOMER'
        | 'REPORT'
        | 'SYSTEM'
        | 'DASHBOARD'
        | 'BRANCH'
        | 'EXPIRY';
    startDate?: Date;
    endDate?: Date;
    isActive?: boolean;
    userRole?: string;
    ipAddress?: string;
    page?: number;
    limit?: number;
}

export interface CreateUserActivityRequest {
    userId: string;
    sessionId: string;
    activity: {
        type:
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
        resourceId?: string;
        resourceName?: string;
        action: string;
        metadata?: Record<string, any>;
    };
    session: {
        loginTime: Date;
        lastActivity?: Date;
        ipAddress: string;
        userAgent: string;
        location?: string;
        isActive?: boolean;
        duration?: number;
    };
    performance?: {
        responseTime?: number;
        requestSize?: number;
        responseSize?: number;
    };
}

export interface UserActivityResponse {
    id: string;
    userId: {
        id: string;
        name: string;
        email: string;
        role: string;
    };
    sessionId: string;
    activity: {
        type: string;
        resource: string;
        resourceId?: string;
        resourceName?: string;
        action: string;
        metadata?: Record<string, any>;
    };
    session: {
        loginTime: Date;
        lastActivity: Date;
        ipAddress: string;
        userAgent: string;
        location?: string;
        isActive: boolean;
        duration?: number;
    };
    performance?: {
        responseTime?: number;
        requestSize?: number;
        responseSize?: number;
    };
    timestamp: Date;
    createdAt: Date;
    updatedAt: Date;
}

export interface UserActivityStats {
    overview: {
        totalActivities: number;
        activeUsers: number;
        activeSessions: number;
        totalSessions: number;
        averageSessionDuration: number;
        totalUniqueUsers: number;
    };
    activityBreakdown: {
        type: string;
        count: number;
        percentage: number;
    }[];
    resourceBreakdown: {
        resource: string;
        count: number;
        percentage: number;
    }[];
    userBreakdown: {
        userId: string;
        userName: string;
        userEmail: string;
        userRole: string;
        activityCount: number;
        lastActivity: Date;
        averageSessionDuration: number;
    }[];
    hourlyActivity: {
        hour: number;
        count: number;
    }[];
    dailyActivity: {
        date: string;
        count: number;
        uniqueUsers: number;
    }[];
    topActions: {
        action: string;
        count: number;
        resource: string;
    }[];
}

export interface UserSessionInfo {
    sessionId: string;
    userId: string;
    userName: string;
    userEmail: string;
    userRole: string;
    loginTime: Date;
    lastActivity: Date;
    duration: number;
    activityCount: number;
    ipAddress: string;
    userAgent: string;
    location?: string;
    isActive: boolean;
    activities: {
        type: string;
        resource: string;
        action: string;
        timestamp: Date;
        resourceName?: string;
    }[];
}

export interface UserActivitySummary {
    totalActivities: number;
    activities: UserActivityResponse[];
    totalPages: number;
    currentPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
}
