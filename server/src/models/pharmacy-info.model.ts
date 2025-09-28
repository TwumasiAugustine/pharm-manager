import mongoose, { Schema, Document } from 'mongoose';

export interface IPharmacyInfo extends Document {
    name: string;
    requireSaleShortCode?: boolean; // Admin-controlled feature toggle
    shortCodeExpiryMinutes?: number; // Time in minutes before short code expires (default: 15)
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
        website?: string;
    };
    registrationNumber: string;
    taxId: string;
    operatingHours: string;
    slogan: string;
    isActive?: boolean;
    createdBy?: mongoose.Types.ObjectId; // Super Admin who created this pharmacy
    admins?: mongoose.Types.ObjectId[]; // Admin IDs assigned to this pharmacy
    createdAt: Date;
    updatedAt: Date;
}

const PharmacyInfoSchema: Schema = new Schema(
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
            website: { type: String },
        },
        registrationNumber: { type: String, required: true },
        taxId: { type: String, required: true },
        operatingHours: { type: String, required: true },
        slogan: { type: String, required: true },
        requireSaleShortCode: { type: Boolean, default: false },
        shortCodeExpiryMinutes: { type: Number, default: 15 }, // Default 15 minutes expiry
        isActive: { type: Boolean, default: true },
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: false,
        },
        admins: [
            {
                type: Schema.Types.ObjectId,
                ref: 'User',
            },
        ],
    },
    {
        timestamps: true,
    },
);

export default mongoose.model<IPharmacyInfo>(
    'PharmacyInfo',
    PharmacyInfoSchema,
);
