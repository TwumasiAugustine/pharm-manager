import mongoose, { Schema, Document } from 'mongoose';
/**
 * Branch document interface
 */
export interface IBranch extends Document {
    name: string;
    pharmacyId: mongoose.Types.ObjectId;
    address: {
        street: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
    };
    contact: {
        phone: string;
        email: string;
    };

    createdAt: Date;
    updatedAt: Date;
}

const BranchSchema: Schema<IBranch> = new Schema(
    {
        name: { type: String, required: true },
        pharmacyId: {
            type: Schema.Types.ObjectId,
            ref: 'PharmacyInfo',
            required: true,
            index: true,
        },
        address: {
            street: { type: String, required: true },
            city: { type: String, required: true },
            state: { type: String, required: true },
            postalCode: { type: String, required: true },
            country: { type: String, required: true },
        },
        contact: {
            phone: { type: String, required: true },
            email: { type: String, required: true },
        },
    },
    {
        timestamps: true,
        toJSON: {
            versionKey: false,
            virtuals: true,
            /**
             * Transform _id to id and remove _id from output
             */
            transform: (_: any, ret: any) => {
                ret.id = ret._id;
                delete ret._id;
            },
        },
        toObject: {
            versionKey: false,
            virtuals: true,
            transform: (_: any, ret: any) => {
                ret.id = ret._id;
                delete ret._id;
            },
        },
    },
);

// Add compound indexes for pharmacy-specific unique constraints
BranchSchema.index({ pharmacyId: 1, name: 1 }, { unique: true });
BranchSchema.index({ pharmacyId: 1, 'contact.email': 1 }, { unique: true });
BranchSchema.index({ pharmacyId: 1, 'contact.phone': 1 }, { unique: true });

// Add index for pharmacy-based queries
BranchSchema.index({ pharmacyId: 1 });

export default mongoose.model<IBranch>('Branch', BranchSchema);
