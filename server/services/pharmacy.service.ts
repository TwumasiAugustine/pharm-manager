import PharmacyInfo, { IPharmacyInfo } from '../models/pharmacy-info.model';
import { Types } from 'mongoose';
import { UserRole } from '../types/user.types';
import { ITokenPayload } from '../types/auth.types';

export const getPharmacyInfo = async (
    pharmacyId?: string,
    user?: ITokenPayload,
) => {
    // Super admin can access any pharmacy or get the first one for platform management
    if (user?.role === UserRole.SUPER_ADMIN) {
        if (pharmacyId) {
            return await PharmacyInfo.findById(pharmacyId);
        }
        // For super admin without specific pharmacy, return first one for platform config
        return await PharmacyInfo.findOne();
    }

    // For regular users, require pharmacyId
    if (pharmacyId) {
        return await PharmacyInfo.findById(pharmacyId);
    }

    // Fallback for backward compatibility
    return await PharmacyInfo.findOne();
};

export const updatePharmacyInfo = async (
    data: IPharmacyInfo,
    pharmacyId?: string,
    user?: ITokenPayload,
) => {
    // Super admin can update any pharmacy or create new ones
    if (user?.role === UserRole.SUPER_ADMIN) {
        if (pharmacyId) {
            return await PharmacyInfo.findByIdAndUpdate(pharmacyId, data, {
                new: true,
            });
        }
        // For super admin without specific pharmacy, update/create first one
        return await PharmacyInfo.findOneAndUpdate({}, data, {
            new: true,
            upsert: true,
        });
    }

    // For regular users, require pharmacyId
    if (pharmacyId) {
        return await PharmacyInfo.findByIdAndUpdate(pharmacyId, data, {
            new: true,
        });
    }

    // Fallback for backward compatibility
    return await PharmacyInfo.findOneAndUpdate({}, data, {
        new: true,
        upsert: true,
    });
};

export const checkConfigStatus = async (
    pharmacyId?: string,
    user?: ITokenPayload,
): Promise<boolean> => {
    // Super admin can check any pharmacy or platform-wide config
    if (user?.role === UserRole.SUPER_ADMIN) {
        if (pharmacyId) {
            const pharmacyInfo = await PharmacyInfo.findById(pharmacyId);
            return !!pharmacyInfo;
        }
        // For super admin without specific pharmacy, check if any pharmacy exists
        const pharmacyInfo = await PharmacyInfo.findOne();
        return !!pharmacyInfo;
    }

    // For regular users, require pharmacyId
    if (pharmacyId) {
        const pharmacyInfo = await PharmacyInfo.findById(pharmacyId);
        return !!pharmacyInfo;
    }

    // Fallback to checking any pharmacy for backward compatibility
    const pharmacyInfo = await PharmacyInfo.findOne();
    return !!pharmacyInfo;
};
