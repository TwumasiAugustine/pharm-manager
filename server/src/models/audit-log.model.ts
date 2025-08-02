import { Schema, model, Document, Types } from 'mongoose';
import { IUser } from '../types/auth.types';

export interface IAuditLog extends Document {
    userId: Types.ObjectId | IUser;
    action: 'LOGIN' | 'LOGOUT' | 'CREATE' | 'UPDATE' | 'DELETE' | 'VIEW';
    resource: 'USER' | 'DRUG' | 'SALE' | 'CUSTOMER' | 'REPORT' | 'SYSTEM';
    resourceId?: string;
    details: {
        description: string;
        oldValues?: Record<string, any>;
        newValues?: Record<string, any>;
        userRole?: string;
        ipAddress?: string;
        userAgent?: string;
    };
    timestamp: Date;
    createdAt: Date;
    updatedAt: Date;
}

const auditLogSchema = new Schema<IAuditLog>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        action: {
            type: String,
            enum: ['LOGIN', 'LOGOUT', 'CREATE', 'UPDATE', 'DELETE', 'VIEW'],
            required: true,
        },
        resource: {
            type: String,
            enum: ['USER', 'DRUG', 'SALE', 'CUSTOMER', 'REPORT', 'SYSTEM'],
            required: true,
        },
        resourceId: {
            type: String,
        },
        details: {
            description: {
                type: String,
                required: true,
            },
            oldValues: {
                type: Schema.Types.Mixed,
            },
            newValues: {
                type: Schema.Types.Mixed,
            },
            userRole: {
                type: String,
            },
            ipAddress: {
                type: String,
            },
            userAgent: {
                type: String,
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
auditLogSchema.index({ userId: 1 });
auditLogSchema.index({ action: 1 });
auditLogSchema.index({ resource: 1 });
auditLogSchema.index({ timestamp: -1 });
auditLogSchema.index({ 'details.userRole': 1 });

export const AuditLog = model<IAuditLog>('AuditLog', auditLogSchema);
