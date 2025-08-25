import mongoose, { Schema, Document } from 'mongoose';
/**
 * Branch document interface
 */
export interface IBranch extends Document {
    name: string;
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
    manager?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const BranchSchema: Schema<IBranch> = new Schema(
    {
        name: { type: String, required: true },
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
        manager: { type: Schema.Types.ObjectId, ref: 'User' },
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

// Add unique indexes for branch name and contact email/phone
BranchSchema.index({ name: 1 }, { unique: true });
BranchSchema.index({ 'contact.email': 1 }, { unique: true });
BranchSchema.index({ 'contact.phone': 1 }, { unique: true });

export default mongoose.model<IBranch>('Branch', BranchSchema);
