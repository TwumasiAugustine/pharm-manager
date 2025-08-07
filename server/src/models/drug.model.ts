import mongoose, { Document, Schema } from 'mongoose';

/**
 * Interface representing a drug in the database
 */
export interface IDrug extends Document {
    name: string;
    generic: string;
    brand: string;
    category: string;
    type: string;
    dosageForm: string;
    quantity: number;
    price: number;
    packageInfo?: {
        isPackaged: boolean;
        unitsPerPack?: number;
        packsPerCarton?: number;
        packPrice?: number;
        cartonPrice?: number;
    };
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
        generic: {
            type: String,
            required: [true, 'Generic name is required'],
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
        type: {
            type: String,
            required: [true, 'Drug type is required'],
            trim: true,
        },
        dosageForm: {
            type: String,
            required: [true, 'Dosage form is required'],
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
        packageInfo: {
            isPackaged: {
                type: Boolean,
                default: false,
            },
            unitsPerPack: {
                type: Number,
                min: [1, 'Units per pack must be at least 1'],
            },
            packsPerCarton: {
                type: Number,
                min: [1, 'Packs per carton must be at least 1'],
            },
            packPrice: {
                type: Number,
                min: [0, 'Pack price cannot be negative'],
            },
            cartonPrice: {
                type: Number,
                min: [0, 'Carton price cannot be negative'],
            },
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
drugSchema.index({ name: 'text', brand: 'text', category: 'text', generic: 'text' });
drugSchema.index({ batchNumber: 1 });
drugSchema.index({ expiryDate: 1 });
drugSchema.index({ 'packageInfo.isPackaged': 1 });

/**
 * Drug model for MongoDB interaction
 */
const Drug = mongoose.model<IDrug>('Drug', drugSchema);

export default Drug;
