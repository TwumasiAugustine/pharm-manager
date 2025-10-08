export interface AuditLogFilters {
    userId?: string;
    pharmacyId?: string;
    branchId?: string;
    action?: 'LOGIN' | 'LOGOUT' | 'CREATE' | 'UPDATE' | 'DELETE' | 'VIEW';
    resource?:
        | 'USER'
        | 'DRUG'
        | 'SALE'
        | 'CUSTOMER'
        | 'REPORT'
        | 'SYSTEM'
        | 'BRANCH'
        | 'PHARMACY';
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
    userRole?: string;
}

export interface CreateAuditLogRequest {
    userId: string;
    pharmacyId?: string;
    branchId?: string;
    action: 'LOGIN' | 'LOGOUT' | 'CREATE' | 'UPDATE' | 'DELETE' | 'VIEW';
    resource:
        | 'USER'
        | 'DRUG'
        | 'SALE'
        | 'CUSTOMER'
        | 'REPORT'
        | 'SYSTEM'
        | 'BRANCH'
        | 'PHARMACY';
    resourceId?: string;
    details: {
        description: string;
        oldValues?: Record<string, any>;
        newValues?: Record<string, any>;
        userRole?: string;
        ipAddress?: string;
        userAgent?: string;
        pharmacyName?: string;
        branchName?: string;
    };
}

export interface AuditLogResponse {
    id: string;
    userId: string;
    userName: string;
    pharmacyId?: string;
    pharmacyName?: string;
    branchId?: string;
    branchName?: string;
    action: string;
    resource: string;
    resourceId?: string;
    details: {
        description: string;
        oldValues?: Record<string, any>;
        newValues?: Record<string, any>;
        userRole?: string;
        ipAddress?: string;
        userAgent?: string;
        pharmacyName?: string;
        branchName?: string;
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
