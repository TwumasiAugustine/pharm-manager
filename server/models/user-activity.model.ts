import { Schema, model, Document, Types } from 'mongoose';
import { IUser } from '../types/auth.types';

export interface IUserActivity extends Document {
    userId: Types.ObjectId | IUser;
    sessionId: string;
    pharmacyId?: Types.ObjectId; // For data scoping
    branch?: Types.ObjectId; // For data scoping
    activity: {
        type:
            | 'LOGIN'
            | 'LOGOUT'
            | 'CREATE'
            | 'UPDATE'
            | 'DELETE'
            | 'VIEW'
            | 'DOWNLOAD'
            | 'SEARCH'
            | 'GENERATE'
            | 'EXPORT'
            | 'CHECK'
            | 'ALERT';
        resource:
            | 'USER'
            | 'DRUG'
            | 'SALE'
            | 'CUSTOMER'
            | 'REPORT'
            | 'SYSTEM'
            | 'DASHBOARD'
            | 'BRANCH'
            | 'EXPIRY';
        resourceId?: string;
        resourceName?: string;
        action: string; // Detailed action description
        metadata?: Record<string, any>;
    };
    session: {
        loginTime: Date;
        lastActivity: Date;
        ipAddress: string;
        userAgent: string;
        location?: string; // Optional geolocation
        isActive: boolean;
        duration?: number; // Session duration in minutes
    };
    performance: {
        responseTime?: number; // API response time in ms
        requestSize?: number; // Request payload size
        responseSize?: number; // Response payload size
    };
    timestamp: Date;
    createdAt: Date;
    updatedAt: Date;
}

const userActivitySchema = new Schema<IUserActivity>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        sessionId: {
            type: String,
            required: true,
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
        activity: {
            type: {
                type: String,
                enum: [
                    'LOGIN',
                    'LOGOUT',
                    'CREATE',
                    'UPDATE',
                    'DELETE',
                    'VIEW',
                    'DOWNLOAD',
                    'SEARCH',
                    'GENERATE',
                    'EXPORT',
                    'CHECK',
                    'ALERT',
                ],
                required: true,
            },
            resource: {
                type: String,
                enum: [
                    'USER',
                    'DRUG',
                    'SALE',
                    'CUSTOMER',
                    'REPORT',
                    'SYSTEM',
                    'DASHBOARD',
                    'BRANCH',
                    'EXPIRY',
                ],
                required: true,
            },
            resourceId: {
                type: String,
            },
            resourceName: {
                type: String,
            },
            action: {
                type: String,
                required: true,
            },
            metadata: {
                type: Schema.Types.Mixed,
            },
        },
        session: {
            loginTime: {
                type: Date,
                required: true,
            },
            lastActivity: {
                type: Date,
                required: true,
                default: Date.now,
            },
            ipAddress: {
                type: String,
                required: true,
            },
            userAgent: {
                type: String,
                required: true,
            },
            location: {
                type: String,
            },
            isActive: {
                type: Boolean,
                default: true,
            },
            duration: {
                type: Number, // in minutes
            },
        },
        performance: {
            responseTime: {
                type: Number,
            },
            requestSize: {
                type: Number,
            },
            responseSize: {
                type: Number,
            },
        },
        timestamp: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    },
);

// Indexes for better query performance
userActivitySchema.index({ userId: 1 });
userActivitySchema.index({ sessionId: 1 });
userActivitySchema.index({ 'activity.type': 1 });
userActivitySchema.index({ 'activity.resource': 1 });
userActivitySchema.index({ timestamp: -1 });
userActivitySchema.index({ 'session.loginTime': -1 });
userActivitySchema.index({ 'session.isActive': 1 });

// Compound indexes for common queries
userActivitySchema.index({ userId: 1, timestamp: -1 });
userActivitySchema.index({ sessionId: 1, timestamp: -1 });
userActivitySchema.index({ 'activity.type': 1, timestamp: -1 });

export const UserActivity = model<IUserActivity>(
    'UserActivity',
    userActivitySchema,
);
