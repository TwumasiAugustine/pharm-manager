import { Types } from 'mongoose';

export interface IExpiryAlert {
    _id: Types.ObjectId;
    drugId: Types.ObjectId;
    drugName: string;
    brand: string;
    category: string;
    expiryDate: Date;
    daysUntilExpiry: number;
    quantity: number;
    price: number;
    batchNumber: string;
    alertLevel: 'expired' | 'critical' | 'warning' | 'notice';
    isAcknowledged: boolean;
    acknowledgedBy?: Types.ObjectId;
    acknowledgedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

export interface IExpiryFilters {
    alertLevel?: 'expired' | 'critical' | 'warning' | 'notice';
    daysRange?: number;
    isAcknowledged?: boolean;
    category?: string;
}

export interface IExpiryStats {
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

export interface IExpiryNotification {
    _id: Types.ObjectId;
    type: 'expiry_alert' | 'batch_expired' | 'low_stock_expiry';
    title: string;
    message: string;
    drugId: Types.ObjectId;
    alertLevel: 'expired' | 'critical' | 'warning' | 'notice';
    isRead: boolean;
    userId?: Types.ObjectId;
    createdAt: Date;
    expiresAt: Date;
}
