import PharmacyInfo, { IPharmacyInfo } from '../models/pharmacy-info.model';

export const getPharmacyInfo = async () => {
    return await PharmacyInfo.findOne();
};

export const updatePharmacyInfo = async (data: IPharmacyInfo) => {
    return await PharmacyInfo.findOneAndUpdate({}, data, {
        new: true,
        upsert: true,
    });
};

export const checkConfigStatus = async (): Promise<boolean> => {
    const pharmacyInfo = await PharmacyInfo.findOne();
    return !!pharmacyInfo;
};
