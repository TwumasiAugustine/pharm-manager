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
    }
);

drugSchema.pre<IDrug>('save', function (next) {
    this.quantity = this.drugsInCarton * this.unitsPerCarton;

    // Only calculate prices if not set
    if (!this.pricePerPack && this.pricePerUnit && this.unitsPerCarton && this.packsPerCarton) {
        this.pricePerPack = this.pricePerUnit * (this.unitsPerCarton / this.packsPerCarton);
    }
    if (!this.pricePerCarton && this.pricePerUnit && this.unitsPerCarton) {
        this.pricePerCarton = this.pricePerUnit * this.unitsPerCarton;
    }
    if (!this.pricePerUnit && this.pricePerCarton && this.unitsPerCarton) {
        this.pricePerUnit = this.pricePerCarton / this.unitsPerCarton;
    }
    if (!this.pricePerUnit && this.pricePerPack && this.unitsPerCarton && this.packsPerCarton) {
        this.pricePerUnit = this.pricePerPack / (this.unitsPerCarton / this.packsPerCarton);
    }

    next();
});

drugSchema.index({ name: 'text', brand: 'text', category: 'text' });
drugSchema.index({ batchNumber: 1 });
drugSchema.index({ expiryDate: 1 });

export const Drug = mongoose.model<IDrug>('Drug', drugSchema);
