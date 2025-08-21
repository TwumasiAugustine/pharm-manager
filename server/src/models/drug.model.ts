import mongoose, { Document, Schema } from 'mongoose';

import { IBranch } from '../types/branch.types';

export interface IDrug extends Document {
    name: string;
    brand: string;
    category: string;
    dosageForm: string;
    ableToSell: boolean;
    drugsInCarton: number;
    unitsPerCarton: number;
    packsPerCarton: number;
    quantity: number;
    pricePerUnit: number;
    pricePerPack: number;
    pricePerCarton: number;
    expiryDate: Date;
    batchNumber: string;
    requiresPrescription: boolean;
    supplier?: string;
    location?: string;
    costPrice: number;
    branch: IBranch | mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const drugSchema = new Schema<IDrug>(
    {
        name: {
            type: Schema.Types.String,
            required: [true, 'Drug name is required'],
            trim: true,
        },
        brand: {
            type: Schema.Types.String,
            required: [true, 'Brand name is required'],
            trim: true,
        },
        category: {
            type: Schema.Types.String,
            required: [true, 'Category is required'],
            trim: true,
        },
        dosageForm: {
            type: Schema.Types.String,
            required: [true, 'Dosage form is required'],
            trim: true,
            // enum: ['tablet', 'capsule', 'syrup', 'injection'], // Uncomment and extend as needed
        },
        ableToSell: {
            type: Schema.Types.Boolean,
            default: true,
        },
        drugsInCarton: {
            type: Schema.Types.Number,
            default: 0,
            min: 0,
        },
        unitsPerCarton: {
            type: Schema.Types.Number,
            required: [true, 'Units per carton is required'],
            min: 1,
        },
        packsPerCarton: {
            type: Schema.Types.Number,
            required: [true, 'Packs per carton is required'],
            min: 1,
        },
        costPrice: {
            type: Schema.Types.Number,
            required: [true, 'Cost price per unit is required'],
            min: [0.01, 'Cost price must be greater than 0'],
        },
        quantity: {
            type: Schema.Types.Number,
            default: 0,
            min: 0,
        },
        pricePerUnit: {
            type: Schema.Types.Number,
            required: [true, 'Price per unit is required'],
            min: 0,
        },
        pricePerPack: {
            type: Schema.Types.Number,
            default: 0,
            min: 0,
        },
        pricePerCarton: {
            type: Schema.Types.Number,
            default: 0,
            min: 0,
        },
        expiryDate: {
            type: Schema.Types.Date,
            required: true,
        },
        batchNumber: {
            type: Schema.Types.String,
            required: true,
            trim: true,
        },
        requiresPrescription: {
            type: Schema.Types.Boolean,
            default: false,
        },
        supplier: {
            type: Schema.Types.String,
            trim: true,
        },
        location: {
            type: Schema.Types.String,
            trim: true,
        },
        branch: {
            type: Schema.Types.ObjectId,
            ref: 'Branch',
            required: true,
        },
    },
    {
        timestamps: true,
        toJSON: {
            virtuals: true,
            versionKey: false,
            transform: (_, ret) => {
                ret.id = ret._id;
                delete ret._id;
            },
        },
        toObject: {
            virtuals: true,
            versionKey: false,
            transform: (_, ret) => {
                ret.id = ret._id;
                delete ret._id;
            },
        },
    },
);

// Pre-save hook for auto-calculation
drugSchema.pre<IDrug>('save', function (next) {
    // Auto-calculate pricePerPack and pricePerCarton if only pricePerUnit is provided
    if (
        this.pricePerUnit &&
        (!this.pricePerPack || this.pricePerPack === 0) &&
        this.unitsPerCarton
    ) {
        this.pricePerPack = this.pricePerUnit * this.unitsPerCarton;
    }
    if (
        this.pricePerPack &&
        (!this.pricePerCarton || this.pricePerCarton === 0) &&
        this.packsPerCarton
    ) {
        this.pricePerCarton = this.pricePerPack * this.packsPerCarton;
    }
    // Auto-calculate quantity based on carton and unit data
    if (this.drugsInCarton && this.unitsPerCarton && this.packsPerCarton) {
        this.quantity =
            this.drugsInCarton * this.unitsPerCarton * this.packsPerCarton;
    }
    // Ensure costPrice is per unit (already enforced by schema)
    next();
});

drugSchema.index({ name: 'text', brand: 'text', category: 'text' });
drugSchema.index({ batchNumber: 1 });
drugSchema.index({ expiryDate: 1 });

export const Drug = mongoose.model<IDrug>('Drug', drugSchema);
