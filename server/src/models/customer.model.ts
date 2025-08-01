import { Schema, model, Document, Types } from 'mongoose';

export interface ICustomer extends Document {
    name: string;
    phone: string;
    purchases: Types.ObjectId[];
    email?: string;
    address?: string;
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
        },
        email: {
            type: String,
            index: true,
        },
        address: {
            type: String,
        },
        purchases: {
            type: [{ type: Schema.Types.ObjectId, ref: 'Sale' }],
            default: [],
        },
    },
    {
        timestamps: true, // Adds createdAt and updatedAt
    },
);

// Create indexes for faster lookups
customerSchema.index({ name: 'text', phone: 'text', email: 'text' });

const Customer = model<ICustomer>('Customer', customerSchema);
export default Customer;
