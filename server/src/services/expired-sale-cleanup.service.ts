/**
 * Expired Sale Cleanup Service
 * Handles automatic cleanup of expired unfinalised sales and restores drug quantities
 */

import { Sale } from '../models/sale.model';
import PharmacyInfo from '../models/pharmacy-info.model';
import { Drug } from '../models/drug.model';
import { Types } from 'mongoose';

export class ExpiredSaleCleanupService {
    /**
     * Find and cleanup expired unfinalised sales
     * @returns Number of sales cleaned up
     */
    static async cleanupExpiredSales(): Promise<number> {
        try {
            console.log('🧹 Starting expired sale cleanup...');

            // Get pharmacy settings
            const pharmacyInfo = await PharmacyInfo.findOne();
            if (!pharmacyInfo?.requireSaleShortCode) {
                console.log('ℹ️ Short code feature not enabled, skipping cleanup');
                return 0;
            }

            const expiryMinutes = pharmacyInfo.shortCodeExpiryMinutes || 15;
            const expiryTime = new Date(Date.now() - expiryMinutes * 60 * 1000);

            console.log(`⏰ Looking for unfinalised sales older than ${expiryMinutes} minutes (before ${expiryTime.toISOString()})`);

            // Find expired unfinalised sales
            const expiredSales = await Sale.find({
                finalized: { $ne: true }, // Not finalized
                shortCode: { $exists: true, $ne: null }, // Has short code
                createdAt: { $lt: expiryTime }, // Created before expiry time
            }).populate('items.drug');

            console.log(`📦 Found ${expiredSales.length} expired unfinalised sales`);

            let cleanedUpCount = 0;

            for (const sale of expiredSales) {
                try {
                    console.log(`🔄 Processing expired sale: ${sale._id} (created: ${sale.createdAt})`);

                    // Restore drug quantities for each item
                    await this.restoreDrugQuantities(sale);

                    // Delete the expired sale
                    await Sale.findByIdAndDelete(sale._id);

                    cleanedUpCount++;
                    console.log(`✅ Cleaned up expired sale: ${sale._id}`);

                } catch (itemError) {
                    console.error(`❌ Error cleaning up sale ${sale._id}:`, itemError);
                    // Continue with other sales even if one fails
                }
            }

            console.log(`🎉 Cleanup completed. ${cleanedUpCount} sales cleaned up.`);
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
        console.log(`📋 Restoring quantities for ${sale.items.length} items in sale ${sale._id}`);

        for (const item of sale.items) {
            try {
                const drugId = item.drug._id || item.drug;
                const quantityToRestore = item.quantity;

                console.log(`🔄 Restoring ${quantityToRestore} units for drug ${drugId}`);

                // Update drug quantity by adding back the sold quantity
                const updateResult = await Drug.findByIdAndUpdate(
                    drugId,
                    { $inc: { quantity: quantityToRestore } },
                    { new: true }
                );

                if (updateResult) {
                    console.log(`✅ Restored ${quantityToRestore} units to drug ${drugId}. New quantity: ${updateResult.quantity}`);
                } else {
                    console.warn(`⚠️ Drug ${drugId} not found, could not restore quantity`);
                }

            } catch (itemError) {
                console.error(`❌ Error restoring quantity for item:`, item, itemError);
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

        return !sale.finalized && 
               sale.shortCode && 
               sale.createdAt < expiryTime;
    }

    /**
     * Get expired sale statistics without cleaning up
     * @returns Object with expired sale counts and details
     */
    static async getExpiredSaleStats(): Promise<{
        count: number;
        totalValue: number;
        oldestExpired?: Date;
    }> {
        const pharmacyInfo = await PharmacyInfo.findOne();
        if (!pharmacyInfo?.requireSaleShortCode) {
            return { count: 0, totalValue: 0 };
        }

        const expiryMinutes = pharmacyInfo.shortCodeExpiryMinutes || 15;
        const expiryTime = new Date(Date.now() - expiryMinutes * 60 * 1000);

        const expiredSales = await Sale.find({
            finalized: { $ne: true },
            shortCode: { $exists: true, $ne: null },
            createdAt: { $lt: expiryTime },
        }).sort({ createdAt: 1 });

        const count = expiredSales.length;
        const totalValue = expiredSales.reduce((sum, sale) => sum + (sale.totalAmount || 0), 0);
        const oldestExpired = expiredSales.length > 0 ? expiredSales[0].createdAt : undefined;

        return { count, totalValue, oldestExpired };
    }
}