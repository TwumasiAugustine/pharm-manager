import mongoose, { Document, Schema } from 'mongoose';

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
drugSchema.pre('save', function (next) {
    // @ts-ignore
    const doc = this;
    // Auto-calculate pricePerPack and pricePerCarton if only pricePerUnit is provided
    if (
        doc.pricePerUnit &&
        (!doc.pricePerPack || doc.pricePerPack === 0) &&
        doc.unitsPerCarton
    ) {
        doc.pricePerPack = doc.pricePerUnit * doc.unitsPerCarton;
    }
    if (
        doc.pricePerPack &&
        (!doc.pricePerCarton || doc.pricePerCarton === 0) &&
        doc.packsPerCarton
    ) {
        doc.pricePerCarton = doc.pricePerPack * doc.packsPerCarton;
    }
    // Auto-calculate quantity based on carton and unit data
    if (doc.drugsInCarton && doc.unitsPerCarton && doc.packsPerCarton) {
        doc.quantity =
            doc.drugsInCarton * doc.unitsPerCarton * doc.packsPerCarton;
    }
    // Ensure costPrice is per unit (already enforced by schema)
    next();
});
drugSchema.pre<IDrug>('save', function (next) {
    this.quantity = this.drugsInCarton * this.unitsPerCarton;

    // Only calculate prices if not set
    if (
        !this.pricePerPack &&
        this.pricePerUnit &&
        this.unitsPerCarton &&
        this.packsPerCarton
    ) {
        this.pricePerPack =
            this.pricePerUnit * (this.unitsPerCarton / this.packsPerCarton);
    }
    if (!this.pricePerCarton && this.pricePerUnit && this.unitsPerCarton) {
        this.pricePerCarton = this.pricePerUnit * this.unitsPerCarton;
    }
    if (!this.pricePerUnit && this.pricePerCarton && this.unitsPerCarton) {
        this.pricePerUnit = this.pricePerCarton / this.unitsPerCarton;
    }
    if (
        !this.pricePerUnit &&
        this.pricePerPack &&
        this.unitsPerCarton &&
        this.packsPerCarton
    ) {
        this.pricePerUnit =
            this.pricePerPack / (this.unitsPerCarton / this.packsPerCarton);
    }

    next();
});

drugSchema.index({ name: 'text', brand: 'text', category: 'text' });
drugSchema.index({ batchNumber: 1 });
drugSchema.index({ expiryDate: 1 });

export const Drug = mongoose.model<IDrug>('Drug', drugSchema);
