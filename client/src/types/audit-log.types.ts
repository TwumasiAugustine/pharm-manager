export interface AuditLogFilters {
    userId?: string;
    action?: 'LOGIN' | 'LOGOUT' | 'CREATE' | 'UPDATE' | 'DELETE' | 'VIEW';
    resource?: 'USER' | 'DRUG' | 'SALE' | 'CUSTOMER' | 'REPORT' | 'SYSTEM';
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
    userRole?: string;
}

export interface AuditLogResponse {
    id: string;
    userId: string;
    userName: string;
    action: 'LOGIN' | 'LOGOUT' | 'CREATE' | 'UPDATE' | 'DELETE' | 'VIEW';
    resource: 'USER' | 'DRUG' | 'SALE' | 'CUSTOMER' | 'REPORT' | 'SYSTEM';
    resourceId?: string;
    details: {
        description: string;
        oldValues?: Record<string, any>;
        newValues?: Record<string, any>;
        userRole?: string;
        ipAddress?: string;
        userAgent?: string;
    };
    timestamp: string;
    createdAt: string;
}

export interface AuditLogsListResponse {
    data: AuditLogResponse[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export interface AuditLogStatsResponse {
    totalLogs: number;
    todayLogs: number;
    weekLogs: number;
    actionBreakdown: Record<string, number>;
    resourceBreakdown: Record<string, number>;
    topUsers: Array<{
        userId: string;
        userName: string;
        count: number;
    }>;
}
