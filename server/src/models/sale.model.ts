import { Schema, model, Document, Types } from 'mongoose';
import { IDrug } from './drug.model';
import { IUser } from '../types/auth.types';
import { ICustomer } from './customer.model';

// Interface for a single item in a sale
export interface ISaleItem {
    drug: Types.ObjectId | IDrug;
    quantity: number;
    packageType: 'individual' | 'pack' | 'carton';
    unitsSold: number;
    packsSold?: number;
    cartonsSold?: number;
    priceAtSale: number; // Price of the drug at the time of sale
}

// Interface for the Sale document
export interface ISale extends Document {
    items: ISaleItem[];
    totalAmount: number;
    soldBy: Types.ObjectId | IUser;
    customer?: Types.ObjectId | ICustomer; // Added customer reference
    paymentMethod: 'cash' | 'card' | 'mobile';
    transactionId?: string; // For card or mobile payments
    notes?: string; // Optional notes about the sale
    createdAt: Date;
    updatedAt: Date;
}

const saleItemSchema = new Schema<ISaleItem>(
    {
        drug: {
            type: Schema.Types.ObjectId,
            ref: 'Drug',
            required: true,
        },
        quantity: {
            type: Number,
            required: true,
            min: 1,
        },
        packageType: {
            type: String,
            enum: ['individual', 'pack', 'carton'],
            default: 'individual',
            required: true,
        },
        unitsSold: {
            type: Number,
            required: true,
            min: 1,
        },
        packsSold: {
            type: Number,
            min: 0,
            default: 0,
        },
        cartonsSold: {
            type: Number,
            min: 0,
            default: 0,
        },
        priceAtSale: {
            type: Number,
            required: true,
            min: 0,
        },
    },
    { _id: false },
);

const saleSchema = new Schema<ISale>(
    {
        items: {
            type: [saleItemSchema],
            required: true,
        },
        totalAmount: {
            type: Number,
            required: true,
            min: 0,
        },
        soldBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        customer: {
            type: Schema.Types.ObjectId,
            ref: 'Customer',
        },
        paymentMethod: {
            type: String,
            enum: ['cash', 'card', 'mobile'],
            required: true,
        },
        transactionId: {
            type: String,
        },
        notes: {
            type: String,
        },
    },
    {
        timestamps: true, // Adds createdAt and updatedAt fields
    },
);

// Indexes for better query performance
saleSchema.index({ soldBy: 1 });
saleSchema.index({ customer: 1 });
saleSchema.index({ createdAt: -1 });
saleSchema.index({ 'items.packageType': 1 });
saleSchema.index({ 'items.drug': 1 });

export const Sale = model<ISale>('Sale', saleSchema);
