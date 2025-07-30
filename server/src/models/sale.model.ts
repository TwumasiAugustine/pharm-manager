import { Schema, model, Document, Types } from 'mongoose';
import { IDrug } from './drug.model';
import { IUser } from '../types/auth.types';


// Interface for a single item in a sale
export interface ISaleItem {
    drug: Types.ObjectId | IDrug;
    quantity: number;
    priceAtSale: number; // Price of the drug at the time of sale
}

// Interface for the Sale document
export interface ISale extends Document {
    items: ISaleItem[];
    totalAmount: number;
    soldBy: Types.ObjectId | IUser;
    // customer?: Types.ObjectId | ICustomer; // Removed customer reference
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
        // customer: {
        //     type: Schema.Types.ObjectId,
        //     ref: 'Customer',
        // },
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

export const Sale = model<ISale>('Sale', saleSchema);
