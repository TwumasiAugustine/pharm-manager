/**
 * Expired Sale Cleanup Service
 * Handles automatic cleanup of expired unfinalised sales and restores drug quantities
 */

import { Sale } from '../models/sale.model';
import PharmacyInfo from '../models/pharmacy-info.model';
import { Drug } from '../models/drug.model';
import { ExpiredSaleCleanupHistory } from '../models/expired-sale-cleanup-history.model';
import { Types } from 'mongoose';
import {
    getBranchScopingFilter,
    getPharmacyScopingFilter,
} from '../utils/data-scoping';
import { ITokenPayload } from '../types/auth.types';

export class ExpiredSaleCleanupService {
    /**
     * Find and cleanup expired unfinalised sales
     * @param operationType - Whether this is automatic or manual cleanup
     * @param triggeredBy - User ID for manual cleanups
     * @param user - User context for data scoping (required for manual cleanups)
     * @returns Number of sales cleaned up
     */
    static async cleanupExpiredSales(
        operationType: 'automatic' | 'manual' = 'automatic',
        triggeredBy?: string,
        user?: ITokenPayload,
    ): Promise<number> {
        try {
            console.log('🧹 Starting expired sale cleanup...');

            // Get pharmacy settings
            const pharmacyInfo = await PharmacyInfo.findOne();
            if (!pharmacyInfo?.requireSaleShortCode) {
                console.log(
                    'ℹ️ Short code feature not enabled, skipping cleanup',
                );
                return 0;
            }

            const expiryMinutes = pharmacyInfo.shortCodeExpiryMinutes || 15;
            const expiryTime = new Date(Date.now() - expiryMinutes * 60 * 1000);

            console.log(
                `⏰ Looking for unfinalised sales older than ${expiryMinutes} minutes (before ${expiryTime.toISOString()})`,
            );

            // Build query filter with data scoping
            const queryFilter: any = {
                finalized: { $ne: true }, // Not finalized
                shortCode: { $exists: true, $ne: null }, // Has short code
                createdAt: { $lt: expiryTime }, // Created before expiry time
            };

            // Apply data scoping based on operation type and user context
            if (operationType === 'manual' && user) {
                // Manual cleanup: apply branch-level scoping based on user role
                const scopingFilter = getBranchScopingFilter(user);
                Object.assign(queryFilter, scopingFilter);
                console.log(`🏪 Manual cleanup with scoping:`, scopingFilter);
            } else if (operationType === 'automatic') {
                // Automatic cleanup: clean all branches (no scoping filter)
                console.log('🤖 Automatic cleanup across all branches');
            }

            // Find expired unfinalised sales
            const expiredSales =
                await Sale.find(queryFilter).populate('items.drug');

            console.log(
                `📦 Found ${expiredSales.length} expired unfinalised sales`,
            );

            let cleanedUpCount = 0;

            for (const sale of expiredSales) {
                try {
                    console.log(
                        `🔄 Processing expired sale: ${sale._id} (created: ${sale.createdAt})`,
                    );

                    // Restore drug quantities for each item
                    await this.restoreDrugQuantities(sale);

                    // Delete the expired sale
                    await Sale.findByIdAndDelete(sale._id);

                    cleanedUpCount++;
                    console.log(`✅ Cleaned up expired sale: ${sale._id}`);
                } catch (itemError) {
                    console.error(
                        `❌ Error cleaning up sale ${sale._id}:`,
                        itemError,
                    );
                    // Continue with other sales even if one fails
                }
            }

            // Record cleanup history if any sales were cleaned up
            if (cleanedUpCount > 0) {
                const totalValue = expiredSales.reduce(
                    (sum, sale) => sum + (sale.totalAmount || 0),
                    0,
                );

                // Determine pharmacy and branch context for history recording
                let pharmacyId: string | undefined;
                let branchId: string | undefined;

                if (operationType === 'manual' && user) {
                    // For manual cleanups, use the user's pharmacy and branch
                    pharmacyId = user.pharmacyId;
                    branchId = user.branchId;
                } else if (operationType === 'automatic') {
                    // For automatic cleanups, we don't set specific pharmacy/branch
                    // as it operates across all pharmacies and branches
                    pharmacyId = undefined;
                    branchId = undefined;
                }

                await ExpiredSaleCleanupHistory.create({
                    cleanedUpCount,
                    totalValue,
                    operationType,
                    triggeredBy,
                    pharmacyId,
                    branch: branchId,
                    cleanupDate: new Date(),
                });

                console.log(
                    `📊 Cleanup history recorded: ${cleanedUpCount} sales, ${totalValue} total value${pharmacyId ? ` (pharmacy: ${pharmacyId}${branchId ? `, branch: ${branchId}` : ''})` : ' (all pharmacies)'}`,
                );
            }

            console.log(
                `🎉 Cleanup completed. ${cleanedUpCount} sales cleaned up.`,
            );
            return cleanedUpCount;
        } catch (error) {
            console.error('❌ Error during expired sale cleanup:', error);
            throw error;
        }
    }

    /**
     * Restore drug quantities for items in a sale
     * @param sale - The sale to restore quantities for
     */
    private static async restoreDrugQuantities(sale: any): Promise<void> {
        console.log(
            `📋 Restoring quantities for ${sale.items.length} items in sale ${sale._id}`,
        );

        for (const item of sale.items) {
            try {
                const drugId = item.drug._id || item.drug;
                const quantityToRestore = item.quantity;

                console.log(
                    `🔄 Restoring ${quantityToRestore} units for drug ${drugId}`,
                );

                // Update drug quantity by adding back the sold quantity
                const updateResult = await Drug.findByIdAndUpdate(
                    drugId,
                    { $inc: { quantity: quantityToRestore } },
                    { new: true },
                );

                if (updateResult) {
                    console.log(
                        `✅ Restored ${quantityToRestore} units to drug ${drugId}. New quantity: ${updateResult.quantity}`,
                    );
                } else {
                    console.warn(
                        `⚠️ Drug ${drugId} not found, could not restore quantity`,
                    );
                }
            } catch (itemError) {
                console.error(
                    `❌ Error restoring quantity for item:`,
                    item,
                    itemError,
                );
                // Continue with other items even if one fails
            }
        }
    }

    /**
     * Check if a sale is expired based on current pharmacy settings
     * @param sale - The sale to check
     * @returns True if the sale is expired
     */
    static async isSaleExpired(sale: any): Promise<boolean> {
        const pharmacyInfo = await PharmacyInfo.findOne();
        if (!pharmacyInfo?.requireSaleShortCode) {
            return false; // If feature not enabled, sales don't expire
        }

        const expiryMinutes = pharmacyInfo.shortCodeExpiryMinutes || 15;
        const expiryTime = new Date(Date.now() - expiryMinutes * 60 * 1000);

        return !sale.finalized && sale.shortCode && sale.createdAt < expiryTime;
    }

    /**
     * Get expired sale statistics without cleaning up
     * @param user - User context for data scoping
     * @returns Object with expired sale counts and details including cleanup history
     */
    static async getExpiredSaleStats(user?: ITokenPayload): Promise<{
        expiredSalesCount: number;
        totalValue: number;
        totalExpiredSales: number;
        totalSalesAffected: number;
        oldestExpired?: string;
        totalCleaned: number;
        lastCleanupTime?: string;
    }> {
        const pharmacyInfo = await PharmacyInfo.findOne();
        if (!pharmacyInfo?.requireSaleShortCode) {
            // Get cleanup history even if feature is disabled, but apply scoping
            const cleanupStats = await this.getCleanupHistoryStats(user);
            return {
                expiredSalesCount: 0,
                totalValue: 0,
                totalExpiredSales: 0,
                totalSalesAffected: 0,
                ...cleanupStats,
            };
        }

        const expiryMinutes = pharmacyInfo.shortCodeExpiryMinutes || 15;
        const expiryTime = new Date(Date.now() - expiryMinutes * 60 * 1000);

        // Build query filter with data scoping
        const queryFilter: any = {
            finalized: { $ne: true },
            shortCode: { $exists: true, $ne: null },
            createdAt: { $lt: expiryTime },
        };

        // Apply data scoping based on user context
        if (user) {
            const scopingFilter = getBranchScopingFilter(user);
            Object.assign(queryFilter, scopingFilter);
        }

        const expiredSales = await Sale.find(queryFilter).sort({
            createdAt: 1,
        });

        const expiredSalesCount = expiredSales.length;
        const totalValue = expiredSales.reduce(
            (sum, sale) => sum + (sale.totalAmount || 0),
            0,
        );
        const oldestExpired =
            expiredSales.length > 0
                ? expiredSales[0].createdAt.toISOString()
                : undefined;

        // Get cleanup history statistics with scoping
        const cleanupStats = await this.getCleanupHistoryStats(user);

        return {
            expiredSalesCount,
            totalValue,
            totalExpiredSales: expiredSalesCount, // Same as current expired count
            totalSalesAffected: cleanupStats.totalCleaned + expiredSalesCount,
            oldestExpired,
            ...cleanupStats,
        };
    }

    /**
     * Get cleanup history statistics
     * @param user - User context for data scoping
     * @returns Object with cleanup history data
     */
    private static async getCleanupHistoryStats(user?: ITokenPayload): Promise<{
        totalCleaned: number;
        lastCleanupTime?: string;
    }> {
        try {
            // Build query filter with data scoping
            const queryFilter: any = {};

            // Apply data scoping based on user context
            if (user) {
                const scopingFilter = getBranchScopingFilter(user);
                Object.assign(queryFilter, scopingFilter);
            }

            // Get total cleaned count with scoping
            const totalCleanedResult =
                await ExpiredSaleCleanupHistory.aggregate([
                    { $match: queryFilter },
                    {
                        $group: {
                            _id: null,
                            totalCleaned: { $sum: '$cleanedUpCount' },
                        },
                    },
                ]);

            const totalCleaned = totalCleanedResult[0]?.totalCleaned || 0;

            // Get last cleanup time with scoping
            const lastCleanup = await ExpiredSaleCleanupHistory.findOne(
                queryFilter,
                { cleanupDate: 1 },
                { sort: { cleanupDate: -1 } },
            );

            const lastCleanupTime = lastCleanup?.cleanupDate.toISOString();

            return {
                totalCleaned,
                lastCleanupTime,
            };
        } catch (error) {
            console.error('Error fetching cleanup history stats:', error);
            return {
                totalCleaned: 0,
            };
        }
    }
}
