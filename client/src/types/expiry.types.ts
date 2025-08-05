export interface ExpiryDrug {
    id: string;
    _id: string;
    drugId: string;
    drugName: string;
    brand: string;
    category: string;
    expiryDate: string;
    daysUntilExpiry: number;
    quantity: number;
    price: number;
    batchNumber: string;
    alertLevel: 'expired' | 'critical' | 'warning' | 'notice';
    isAcknowledged: boolean;
    acknowledgedBy?: string;
    acknowledgedAt?: string;
    createdAt: string;
    updatedAt: string;
}

export interface ExpiryStats {
    totalExpiredDrugs: number;
    totalCriticalDrugs: number;
    totalWarningDrugs: number;
    totalNoticeDrugs: number;
    totalValue: number;
    expiredValue: number;
    criticalValue: number;
    upcomingExpiries: {
        next7Days: number;
        next30Days: number;
        next60Days: number;
        next90Days: number;
    };
}

export interface ExpiryNotification {
    id: string;
    _id: string;
    type: 'expiry_alert' | 'batch_expired' | 'low_stock_expiry';
    title: string;
    message: string;
    drugId: string;
    alertLevel: 'expired' | 'critical' | 'warning' | 'notice';
    isRead: boolean;
    userId?: string;
    createdAt: string;
    expiresAt: string;
}

export interface ExpiryFilters {
    daysRange?: number;
    alertLevel?: 'expired' | 'critical' | 'warning' | 'notice';
    isAcknowledged?: boolean;
    category?: string;
}

export interface ExpiryDrugsResponse {
    data: {
        data: ExpiryDrug[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    };
    success: boolean;
    message: string;
    statusCode: number;
}

export interface ExpiryNotificationsResponse {
    data: {
        data: ExpiryNotification[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    };
    success: boolean;
    message: string;
    statusCode: number;
}

export interface DrugExpiryCheck {
    isExpired: boolean;
    isExpiring: boolean;
    daysUntilExpiry: number;
    canSell: boolean;
}
