import { Schema, model, Document, Types } from 'mongoose';

export interface ICustomer extends Document {
    name: string;
    phone: string;
    purchases: Types.ObjectId[];
    email?: string;
    address?: string;
    pharmacyId: Types.ObjectId;
    branch?: Types.ObjectId; // Branch assignment for customers
    createdAt: Date;
    updatedAt: Date;
}

const customerSchema = new Schema<ICustomer>(
    {
        name: {
            type: String,
            required: true,
            index: true,
        },
        phone: {
            type: String,
            required: true,
            index: true,
            unique: true,
        },
        email: {
            type: String,
            index: true,
            unique: true,
            sparse: true, // allow multiple docs with no email
        },
        address: {
            type: String,
        },
        purchases: {
            type: [{ type: Schema.Types.ObjectId, ref: 'Sale' }],
            default: [],
        },
        pharmacyId: {
            type: Schema.Types.ObjectId,
            ref: 'PharmacyInfo',
            required: true,
            index: true,
        },
        branch: {
            type: Schema.Types.ObjectId,
            ref: 'Branch',
            required: false, // Optional, customers may not be assigned to specific branches
        },
    },
    {
        timestamps: true, // Adds createdAt and updatedAt
    },
);

// Create indexes for faster lookups
customerSchema.index({ name: 'text', phone: 'text', email: 'text' });
customerSchema.index({ pharmacyId: 1 });
customerSchema.index({ pharmacyId: 1, phone: 1 }); // Compound index for pharmacy filtering with phone lookup

const Customer = model<ICustomer>('Customer', customerSchema);
export default Customer;
