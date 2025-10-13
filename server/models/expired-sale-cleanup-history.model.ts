/**
 * Expired Sale Cleanup History Model
 * Tracks cleanup operations for statistics and audit purposes
 */

import { Schema, model, Document } from 'mongoose';

export interface IExpiredSaleCleanupHistory extends Document {
    _id: string;
    cleanupDate: Date;
    cleanedUpCount: number;
    totalValue: number;
    operationType: 'automatic' | 'manual';
    triggeredBy?: string; // User ID for manual cleanups
    pharmacyId?: string; // Pharmacy ID for data scoping
    branch?: string; // Branch ID for data scoping (renamed from branchId for consistency)
    createdAt: Date;
    updatedAt: Date;
}

const expiredSaleCleanupHistorySchema = new Schema<IExpiredSaleCleanupHistory>(
    {
        cleanupDate: {
            type: Date,
            required: true,
            default: Date.now,
        },
        cleanedUpCount: {
            type: Number,
            required: true,
            min: 0,
        },
        totalValue: {
            type: Number,
            required: true,
            min: 0,
        },
        operationType: {
            type: String,
            required: true,
            enum: ['automatic', 'manual'],
            default: 'automatic',
        },
        triggeredBy: {
            type: String,
            required: false,
        },
        pharmacyId: {
            type: Schema.Types.ObjectId,
            ref: 'PharmacyInfo',
            required: false,
        },
        branch: {
            type: Schema.Types.ObjectId,
            ref: 'Branch',
            required: false,
        },
    },
    {
        timestamps: true,
        collection: 'expired_sale_cleanup_history',
    },
);

// Index for performance
expiredSaleCleanupHistorySchema.index({ cleanupDate: -1 });
expiredSaleCleanupHistorySchema.index({ operationType: 1 });
expiredSaleCleanupHistorySchema.index({ pharmacyId: 1 });
expiredSaleCleanupHistorySchema.index({ branch: 1 });

export const ExpiredSaleCleanupHistory = model<IExpiredSaleCleanupHistory>(
    'ExpiredSaleCleanupHistory',
    expiredSaleCleanupHistorySchema,
);
