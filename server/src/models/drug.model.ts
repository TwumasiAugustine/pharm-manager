import mongoose, { Document, Schema } from 'mongoose';

/**
 * Interface representing a drug in the database
 */
export interface IDrug extends Document {
    name: string;
    brand: string;
    category: string;
    quantity: number;
    price: number;
    expiryDate: Date;
    batchNumber: string;
    requiresPrescription: boolean;
    supplier?: string;
    location?: string;
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Mongoose schema for the Drug model
 */
const drugSchema = new Schema<IDrug>(
    {
        name: {
            type: String,
            required: [true, 'Drug name is required'],
            trim: true,
        },
        brand: {
            type: String,
            required: [true, 'Brand name is required'],
            trim: true,
        },
        category: {
            type: String,
            required: [true, 'Category is required'],
            trim: true,
        },
        quantity: {
            type: Number,
            required: [true, 'Quantity is required'],
            min: [0, 'Quantity cannot be negative'],
        },
        price: {
            type: Number,
            required: [true, 'Price is required'],
            min: [0, 'Price cannot be negative'],
        },
        expiryDate: {
            type: Date,
            required: [true, 'Expiry date is required'],
        },
        batchNumber: {
            type: String,
            required: [true, 'Batch number is required'],
            trim: true,
        },
        requiresPrescription: {
            type: Boolean,
            default: false,
        },
        supplier: {
            type: String,
            trim: true,
        },
        location: {
            type: String,
            trim: true,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    },
);

// Create indexes for better search performance
drugSchema.index({ name: 'text', brand: 'text', category: 'text' });
drugSchema.index({ batchNumber: 1 });
drugSchema.index({ expiryDate: 1 });

/**
 * Drug model for MongoDB interaction
 */
const Drug = mongoose.model<IDrug>('Drug', drugSchema);

export default Drug;
