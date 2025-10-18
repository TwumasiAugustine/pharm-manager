import mongoose, { Document, Schema } from 'mongoose';

export interface IDrugBranch extends Document {
    drugId: mongoose.Types.ObjectId;
    branchId: mongoose.Types.ObjectId;
    pharmacyId: mongoose.Types.ObjectId;
    quantity: number;
    location?: string; // Specific location within the branch
    createdAt: Date;
    updatedAt: Date;
}

const drugBranchSchema = new Schema<IDrugBranch>(
    {
        drugId: {
            type: Schema.Types.ObjectId,
            ref: 'Drug',
            required: true,
        },
        branchId: {
            type: Schema.Types.ObjectId,
            ref: 'Branch',
            required: true,
        },
        pharmacyId: {
            type: Schema.Types.ObjectId,
            ref: 'PharmacyInfo',
            required: true,
        },
        quantity: {
            type: Schema.Types.Number,
            default: 0,
            min: 0,
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

// Ensure unique drug-branch combination
drugBranchSchema.index({ drugId: 1, branchId: 1 }, { unique: true });
drugBranchSchema.index({ pharmacyId: 1 });
drugBranchSchema.index({ branchId: 1 });
drugBranchSchema.index({ drugId: 1 });

export const DrugBranch = mongoose.model<IDrugBranch>(
    'DrugBranch',
    drugBranchSchema,
);
