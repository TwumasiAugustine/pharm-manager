export interface UserActivityFilters {
    userId?: string;
    sessionId?: string;
    activityType?: 'LOGIN' | 'LOGOUT' | 'CREATE' | 'UPDATE' | 'DELETE' | 'VIEW' | 'DOWNLOAD' | 'SEARCH';
    resource?: 'USER' | 'DRUG' | 'SALE' | 'CUSTOMER' | 'REPORT' | 'SYSTEM' | 'DASHBOARD';
    startDate?: string;
    endDate?: string;
    isActive?: boolean;
    userRole?: string;
    ipAddress?: string;
    page?: number;
    limit?: number;
}

export interface UserActivity {
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
        loginTime: string;
        lastActivity: string;
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
    timestamp: string;
    createdAt: string;
    updatedAt: string;
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
        lastActivity: string;
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
    loginTime: string;
    lastActivity: string;
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
        timestamp: string;
        resourceName?: string;
    }[];
}

export interface UserActivitySummary {
    totalActivities: number;
    activities: UserActivity[];
    totalPages: number;
    currentPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
}

export interface UserActivityResponse {
    success: boolean;
    message: string;
    data: UserActivitySummary;
}

export interface UserActivityStatsResponse {
    success: boolean;
    message: string;
    data: UserActivityStats;
}

export interface UserSessionResponse {
    success: boolean;
    message: string;
    data: UserSessionInfo;
}
