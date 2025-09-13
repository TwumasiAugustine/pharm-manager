import { Types } from 'mongoose';

export interface IBranch {
    _id: string;
    name: string;
    pharmacyId: Types.ObjectId | string;
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
    manager?: Types.ObjectId | string;
    createdAt: Date | string;
    updatedAt: Date | string;
}
