import Drug from '../models/drug.model';
import { ExpiryNotification } from '../models/expiry.model';
import type {
    IExpiryAlert,
    IExpiryFilters,
    IExpiryStats,
    IExpiryNotification,
} from '../types/expiry.types';
import { Types } from 'mongoose';

export class ExpiryService {
    /**
     * Get drugs expiring within specified days with alert levels
     */
    async getExpiringDrugs({
        daysRange = 90,
        alertLevel,
        isAcknowledged = false,
        category,
        page = 1,
        limit = 20,
    }: IExpiryFilters & { page?: number; limit?: number }) {
        const today = new Date();
        const futureDate = new Date();
        futureDate.setDate(today.getDate() + daysRange);

        // Build query
        const query: any = {
            expiryDate: { $lte: futureDate },
            quantity: { $gt: 0 }, // Only show drugs with stock
        };

        if (category) {
            query.category = { $regex: category, $options: 'i' };
        }

        const drugs = await Drug.find(query)
            .sort({ expiryDate: 1 })
            .skip((page - 1) * limit)
            .limit(limit);

        const total = await Drug.countDocuments(query);

        // Process drugs and add alert levels
        const expiringDrugs: IExpiryAlert[] = drugs.map((drug) => {
            const daysUntilExpiry = Math.ceil(
                (drug.expiryDate.getTime() - today.getTime()) /
                    (1000 * 60 * 60 * 24),
            );

            let alertLevel: 'expired' | 'critical' | 'warning' | 'notice';
            if (daysUntilExpiry < 0) alertLevel = 'expired';
            else if (daysUntilExpiry <= 7) alertLevel = 'critical';
            else if (daysUntilExpiry <= 30) alertLevel = 'warning';
            else alertLevel = 'notice';

            return {
                _id: drug._id,
                drugId: drug._id,
                drugName: drug.name,
                brand: drug.brand,
                category: drug.category,
                expiryDate: drug.expiryDate,
                daysUntilExpiry,
                quantity: drug.quantity,
                price: drug.price,
                batchNumber: drug.batchNumber,
                alertLevel,
                isAcknowledged: false,
                createdAt: drug.createdAt,
                updatedAt: drug.updatedAt,
            } as IExpiryAlert;
        });

        // Filter by alert level if specified
        const filteredDrugs = alertLevel
            ? expiringDrugs.filter((drug) => drug.alertLevel === alertLevel)
            : expiringDrugs;

        return {
            data: filteredDrugs,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    /**
     * Get expiry statistics
     */
    async getExpiryStats(): Promise<IExpiryStats> {
        const today = new Date();
        const next7Days = new Date();
        next7Days.setDate(today.getDate() + 7);
        const next30Days = new Date();
        next30Days.setDate(today.getDate() + 30);
        const next60Days = new Date();
        next60Days.setDate(today.getDate() + 60);
        const next90Days = new Date();
        next90Days.setDate(today.getDate() + 90);

        // Get all drugs for calculations
        const allDrugs = await Drug.find({ quantity: { $gt: 0 } });

        let totalExpiredDrugs = 0;
        let totalCriticalDrugs = 0;
        let totalWarningDrugs = 0;
        let totalNoticeDrugs = 0;
        let totalValue = 0;
        let expiredValue = 0;
        let criticalValue = 0;

        const upcomingExpiries = {
            next7Days: 0,
            next30Days: 0,
            next60Days: 0,
            next90Days: 0,
        };

        allDrugs.forEach((drug) => {
            const daysUntilExpiry = Math.ceil(
                (drug.expiryDate.getTime() - today.getTime()) /
                    (1000 * 60 * 60 * 24),
            );
            const drugValue = drug.quantity * drug.price;
            totalValue += drugValue;

            if (daysUntilExpiry < 0) {
                totalExpiredDrugs++;
                expiredValue += drugValue;
            } else if (daysUntilExpiry <= 7) {
                totalCriticalDrugs++;
                criticalValue += drugValue;
                upcomingExpiries.next7Days++;
            } else if (daysUntilExpiry <= 30) {
                totalWarningDrugs++;
                upcomingExpiries.next30Days++;
            } else if (daysUntilExpiry <= 60) {
                totalNoticeDrugs++;
                upcomingExpiries.next60Days++;
            } else if (daysUntilExpiry <= 90) {
                upcomingExpiries.next90Days++;
            }
        });

        return {
            totalExpiredDrugs,
            totalCriticalDrugs,
            totalWarningDrugs,
            totalNoticeDrugs,
            totalValue,
            expiredValue,
            criticalValue,
            upcomingExpiries,
        };
    }

    /**
     * Create expiry notifications for drugs
     */
    async createExpiryNotifications(): Promise<void> {
        const today = new Date();
        const next7Days = new Date();
        next7Days.setDate(today.getDate() + 7);
        const next30Days = new Date();
        next30Days.setDate(today.getDate() + 30);

        // Get drugs expiring soon or already expired
        const expiringDrugs = await Drug.find({
            expiryDate: { $lte: next30Days },
            quantity: { $gt: 0 },
        });

        for (const drug of expiringDrugs) {
            const daysUntilExpiry = Math.ceil(
                (drug.expiryDate.getTime() - today.getTime()) /
                    (1000 * 60 * 60 * 24),
            );

            let alertLevel: 'expired' | 'critical' | 'warning' | 'notice';
            let title: string;
            let message: string;
            let type: 'expiry_alert' | 'batch_expired' | 'low_stock_expiry';

            if (daysUntilExpiry < 0) {
                alertLevel = 'expired';
                type = 'batch_expired';
                title = `Drug Expired: ${drug.name}`;
                message = `${drug.name} (${drug.brand}) has expired ${Math.abs(
                    daysUntilExpiry,
                )} days ago. Remove from inventory immediately.`;
            } else if (daysUntilExpiry <= 7) {
                alertLevel = 'critical';
                type = 'expiry_alert';
                title = `Critical Expiry Alert: ${drug.name}`;
                message = `${drug.name} (${drug.brand}) expires in ${daysUntilExpiry} days. Take immediate action.`;
            } else if (daysUntilExpiry <= 30) {
                alertLevel = 'warning';
                type = 'expiry_alert';
                title = `Expiry Warning: ${drug.name}`;
                message = `${drug.name} (${drug.brand}) expires in ${daysUntilExpiry} days. Plan disposal or promotion.`;
            } else {
                continue; // Skip drugs expiring later than 30 days
            }

            // Check if notification already exists for today
            const existingNotification = await ExpiryNotification.findOne({
                drugId: drug._id,
                alertLevel,
                createdAt: {
                    $gte: new Date(
                        today.getFullYear(),
                        today.getMonth(),
                        today.getDate(),
                    ),
                },
            });

            if (!existingNotification) {
                await ExpiryNotification.create({
                    type,
                    title,
                    message,
                    drugId: drug._id,
                    alertLevel,
                    isRead: false,
                });
            }
        }
    }

    /**
     * Get notifications with pagination
     */
    async getNotifications({
        isRead,
        alertLevel,
        page = 1,
        limit = 20,
    }: {
        isRead?: boolean;
        alertLevel?: string;
        page?: number;
        limit?: number;
    }) {
        const query: any = {};
        if (isRead !== undefined) query.isRead = isRead;
        if (alertLevel) query.alertLevel = alertLevel;

        const notifications = await ExpiryNotification.find(query)
            .populate('drugId', 'name brand category')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        const total = await ExpiryNotification.countDocuments(query);

        return {
            data: notifications,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    /**
     * Mark notification as read
     */
    async markNotificationAsRead(
        notificationId: string,
    ): Promise<IExpiryNotification | null> {
        return await ExpiryNotification.findByIdAndUpdate(
            notificationId,
            { isRead: true },
            { new: true },
        );
    }

    /**
     * Mark all notifications as read
     */
    async markAllNotificationsAsRead(): Promise<void> {
        await ExpiryNotification.updateMany(
            { isRead: false },
            { isRead: true },
        );
    }

    /**
     * Delete old notifications (called by cron job)
     */
    async cleanupOldNotifications(): Promise<void> {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        await ExpiryNotification.deleteMany({
            createdAt: { $lt: thirtyDaysAgo },
            isRead: true,
        });
    }

    /**
     * Check if a drug is expired or expiring soon (for sale validation)
     */
    async isDrugExpiredOrExpiring(drugId: string): Promise<{
        isExpired: boolean;
        isExpiring: boolean;
        daysUntilExpiry: number;
        canSell: boolean;
    }> {
        const drug = await Drug.findById(drugId);
        if (!drug) {
            throw new Error('Drug not found');
        }

        const today = new Date();
        const daysUntilExpiry = Math.ceil(
            (drug.expiryDate.getTime() - today.getTime()) /
                (1000 * 60 * 60 * 24),
        );

        const isExpired = daysUntilExpiry < 0;
        const isExpiring = daysUntilExpiry <= 7; // Critical period
        const canSell = !isExpired; // Don't sell expired drugs

        return {
            isExpired,
            isExpiring,
            daysUntilExpiry,
            canSell,
        };
    }
}
