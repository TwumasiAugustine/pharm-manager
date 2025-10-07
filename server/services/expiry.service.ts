import { Drug } from '../models/drug.model';
import { ExpiryNotification } from '../models/expiry.model';
import type {
    IExpiryAlert,
    IExpiryFilters,
    IExpiryStats,
    IExpiryNotification,
} from '../types/expiry.types';
import { UserRole } from '../types/user.types';
import { ITokenPayload } from '../types/auth.types';
import { getBranchScopingFilter } from '../utils/data-scoping';

export class ExpiryService {
    /**
     * Get drugs expiring within specified days with alert levels and branch filtering
     */
    async getExpiringDrugs(
        {
            daysRange = 90,
            alertLevel,
            isAcknowledged = false,
            category,
            branchId,
            page = 1,
            limit = 20,
        }: IExpiryFilters & {
            page?: number;
            limit?: number;
            branchId?: string;
        },
        user: ITokenPayload,
    ) {
        const today = new Date();
        const futureDate = new Date();
        futureDate.setDate(today.getDate() + daysRange);

        // Build query with data scoping
        const query: any = {
            expiryDate: { $lte: futureDate },
            quantity: { $gt: 0 }, // Only show drugs with stock
        };

        // Apply data scoping based on user role and pharmacy/branch assignment
        const scopingFilter = getBranchScopingFilter(user);
        Object.assign(query, scopingFilter);

        if (category) {
            query.category = { $regex: category, $options: 'i' };
        }

        // If a specific branchId is requested and user is SUPER_ADMIN, allow it
        if (branchId && user.role === UserRole.SUPER_ADMIN) {
            query.branch = branchId;
        }

        const drugs = await Drug.find(query)
            .populate('branch', 'name address')
            .sort({ expiryDate: 1 })
            .skip((page - 1) * limit)
            .limit(limit);

        const total = await Drug.countDocuments(query);

        // Process drugs and add alert levels with enhanced pricing information
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

            // Calculate potential financial impact
            const unitValueLoss = drug.quantity * drug.pricePerUnit;
            const packValueLoss =
                Math.floor(drug.quantity / drug.unitsPerCarton) *
                drug.pricePerPack;
            const cartonValueLoss =
                Math.floor(
                    drug.quantity / (drug.unitsPerCarton * drug.packsPerCarton),
                ) * drug.pricePerCarton;
            const costLoss = drug.quantity * drug.costPrice;
            const profitLoss = unitValueLoss - costLoss;

            const branch = drug.branch as any;

            return {
                _id: drug._id,
                drugId: drug._id,
                drugName: drug.name,
                brand: drug.brand,
                category: drug.category,
                dosageForm: drug.dosageForm,
                expiryDate: drug.expiryDate,
                daysUntilExpiry,
                quantity: drug.quantity,
                price: drug.pricePerUnit, // Legacy compatibility
                costPrice: drug.costPrice,
                pricePerUnit: drug.pricePerUnit,
                pricePerPack: drug.pricePerPack,
                pricePerCarton: drug.pricePerCarton,
                unitsPerCarton: drug.unitsPerCarton,
                packsPerCarton: drug.packsPerCarton,
                batchNumber: drug.batchNumber,
                // Financial impact analysis
                unitValueLoss,
                packValueLoss,
                cartonValueLoss,
                costLoss,
                profitLoss,
                // Branch information
                branchId: branch?._id || drug.branch,
                branchName: branch?.name || '',
                // Additional drug info
                requiresPrescription: drug.requiresPrescription,
                supplier: drug.supplier,
                location: drug.location,
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
     * Get expiry statistics with enhanced financial impact analysis
     */
    async getExpiryStats(
        user: ITokenPayload,
        branchId?: string,
    ): Promise<IExpiryStats> {
        const today = new Date();
        const next7Days = new Date();
        next7Days.setDate(today.getDate() + 7);
        const next30Days = new Date();
        next30Days.setDate(today.getDate() + 30);
        const next60Days = new Date();
        next60Days.setDate(today.getDate() + 60);
        const next90Days = new Date();
        next90Days.setDate(today.getDate() + 90);

        // Build query with data scoping
        const query: any = { quantity: { $gt: 0 } };

        // Apply data scoping based on user role and pharmacy/branch assignment
        const scopingFilter = getBranchScopingFilter(user);
        Object.assign(query, scopingFilter);

        // If a specific branchId is requested and user is SUPER_ADMIN, allow it
        if (branchId && user.role === UserRole.SUPER_ADMIN) {
            query.branch = branchId;
        }

        // Get all drugs for calculations
        const allDrugs = await Drug.find(query).populate('branch', 'name');

        let totalExpiredDrugs = 0;
        let totalCriticalDrugs = 0;
        let totalWarningDrugs = 0;
        let totalNoticeDrugs = 0;
        let totalValue = 0;
        let totalCostValue = 0;
        let expiredValue = 0;
        let expiredCostValue = 0;
        let criticalValue = 0;
        let criticalCostValue = 0;
        let warningValue = 0;
        let warningCostValue = 0;

        const upcomingExpiries = {
            next7Days: 0,
            next30Days: 0,
            next60Days: 0,
            next90Days: 0,
        };

        const categoryBreakdown: Record<
            string,
            {
                expired: number;
                critical: number;
                warning: number;
                notice: number;
                totalValue: number;
                costValue: number;
            }
        > = {};

        allDrugs.forEach((drug) => {
            const daysUntilExpiry = Math.ceil(
                (drug.expiryDate.getTime() - today.getTime()) /
                    (1000 * 60 * 60 * 24),
            );
            const drugValue = drug.quantity * drug.pricePerUnit;
            const drugCostValue = drug.quantity * drug.costPrice;

            totalValue += drugValue;
            totalCostValue += drugCostValue;

            // Initialize category if not exists
            if (!categoryBreakdown[drug.category]) {
                categoryBreakdown[drug.category] = {
                    expired: 0,
                    critical: 0,
                    warning: 0,
                    notice: 0,
                    totalValue: 0,
                    costValue: 0,
                };
            }

            categoryBreakdown[drug.category].totalValue += drugValue;
            categoryBreakdown[drug.category].costValue += drugCostValue;

            if (daysUntilExpiry < 0) {
                totalExpiredDrugs++;
                expiredValue += drugValue;
                expiredCostValue += drugCostValue;
                categoryBreakdown[drug.category].expired++;
            } else if (daysUntilExpiry <= 7) {
                totalCriticalDrugs++;
                criticalValue += drugValue;
                criticalCostValue += drugCostValue;
                upcomingExpiries.next7Days++;
                categoryBreakdown[drug.category].critical++;
            } else if (daysUntilExpiry <= 30) {
                totalWarningDrugs++;
                warningValue += drugValue;
                warningCostValue += drugCostValue;
                upcomingExpiries.next30Days++;
                categoryBreakdown[drug.category].warning++;
            } else if (daysUntilExpiry <= 60) {
                totalNoticeDrugs++;
                upcomingExpiries.next60Days++;
                categoryBreakdown[drug.category].notice++;
            } else if (daysUntilExpiry <= 90) {
                upcomingExpiries.next90Days++;
            }
        });

        // Calculate financial impact
        const totalPotentialLoss = expiredValue + criticalValue + warningValue;
        const totalCostLoss =
            expiredCostValue + criticalCostValue + warningCostValue;
        const profitLoss = totalPotentialLoss - totalCostLoss;

        return {
            totalExpiredDrugs,
            totalCriticalDrugs,
            totalWarningDrugs,
            totalNoticeDrugs,
            totalValue,
            totalCostValue,
            expiredValue,
            expiredCostValue,
            criticalValue,
            criticalCostValue,
            warningValue,
            warningCostValue,
            totalPotentialLoss,
            profitLoss,
            upcomingExpiries,
            categoryBreakdown,
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
