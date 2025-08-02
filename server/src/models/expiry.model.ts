import { Schema, model } from 'mongoose';
import type { IExpiryNotification } from '../types/expiry.types';

const expiryNotificationSchema = new Schema<IExpiryNotification>(
    {
        type: {
            type: String,
            enum: ['expiry_alert', 'batch_expired', 'low_stock_expiry'],
            required: true,
        },
        title: {
            type: String,
            required: true,
            trim: true,
        },
        message: {
            type: String,
            required: true,
            trim: true,
        },
        drugId: {
            type: Schema.Types.ObjectId,
            ref: 'Drug',
            required: true,
        },
        alertLevel: {
            type: String,
            enum: ['expired', 'critical', 'warning', 'notice'],
            required: true,
        },
        isRead: {
            type: Boolean,
            default: false,
        },
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: false,
        },
        expiresAt: {
            type: Date,
            required: true,
            // Auto-delete notifications after 30 days
            default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    },
);

// Index for efficient queries
expiryNotificationSchema.index({ drugId: 1, alertLevel: 1 });
expiryNotificationSchema.index({ isRead: 1, createdAt: -1 });
expiryNotificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const ExpiryNotification = model<IExpiryNotification>(
    'ExpiryNotification',
    expiryNotificationSchema,
);
