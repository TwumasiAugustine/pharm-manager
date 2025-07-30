import api from './api';

export interface PharmacyInfo {
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
        website: string;
    };
    registrationNumber: string;
    taxId: string;
    operatingHours: string;
    slogan: string;
    _id?: string;
    __v?: number;
    createdAt?: string;
    updatedAt?: string;
}

export interface PharmacyConfigResponse {
    success: boolean;
    message: string;
    data: {
        pharmacyInfo: PharmacyInfo;
        isConfigured: boolean;
    };
}

export const pharmacyApi = {
    getPharmacyInfo: async (): Promise<{
        pharmacyInfo: PharmacyInfo;
        isConfigured: boolean;
    }> => {
        try {
            const response = await api.get('/pharmacy/pharmacy-info');
            console.log('Raw API response:', response.data);

            // The server might return data in different formats
            let pharmacyInfo: PharmacyInfo;
            let isConfigured = false;

            if (response.data.data?.pharmacyInfo) {
                // Standard format in nested data.pharmacyInfo
                pharmacyInfo = response.data.data.pharmacyInfo;
                isConfigured = response.data.data.isConfigured;
            } else if (response.data.data && response.data.data.name) {
                // Direct pharmacyInfo in data field
                pharmacyInfo = response.data.data;
                isConfigured = true;
            } else if (response.data.name) {
                // Direct pharmacyInfo at root
                pharmacyInfo = response.data;
                isConfigured = true;
            } else {
                // Empty object if no valid data format found
                pharmacyInfo = {
                    name: '',
                    slogan: '',
                    address: {
                        street: '',
                        city: '',
                        state: '',
                        postalCode: '',
                        country: '',
                    },
                    contact: {
                        phone: '',
                        email: '',
                        website: '',
                    },
                    registrationNumber: '',
                    taxId: '',
                    operatingHours: '',
                };
                isConfigured = false;
            }

            // Ensure all required fields exist to match PharmacyInfo interface
            const formattedPharmacyInfo: PharmacyInfo = {
                name: pharmacyInfo.name || '',
                slogan: pharmacyInfo.slogan || '',
                address: {
                    street: pharmacyInfo.address?.street || '',
                    city: pharmacyInfo.address?.city || '',
                    state: pharmacyInfo.address?.state || '',
                    postalCode: pharmacyInfo.address?.postalCode || '',
                    country: pharmacyInfo.address?.country || '',
                },
                contact: {
                    phone: pharmacyInfo.contact?.phone || '',
                    email: pharmacyInfo.contact?.email || '',
                    website: pharmacyInfo.contact?.website || '',
                },
                registrationNumber: pharmacyInfo.registrationNumber || '',
                taxId: pharmacyInfo.taxId || '',
                operatingHours: pharmacyInfo.operatingHours || '',
                _id: pharmacyInfo._id,
                __v: pharmacyInfo.__v,
                createdAt: pharmacyInfo.createdAt,
                updatedAt: pharmacyInfo.updatedAt,
            };

            console.log('Formatted pharmacy info:', formattedPharmacyInfo);

            return {
                pharmacyInfo: formattedPharmacyInfo,
                isConfigured,
            };
        } catch (error) {
            console.error('Error in getPharmacyInfo:', error);
            throw error;
        }
    },

    updatePharmacyInfo: async (
        data: PharmacyInfo,
    ): Promise<{ pharmacyInfo: PharmacyInfo; isConfigured: boolean }> => {
        const response = await api.put<PharmacyConfigResponse>(
            '/pharmacy/pharmacy-info',
            data,
        );
        return response.data.data;
    },

    checkConfigStatus: async (): Promise<boolean> => {
        try {
            const response = await api.get<PharmacyConfigResponse>(
                '/pharmacy/status',
            );
            return response.data.data.isConfigured;
        } catch (error) {
            if (error instanceof Error) {
                console.error(error.message);
            } else {
                console.error(error);
            }
            return false;
        }
    },

    checkAdminFirstSetup: async (): Promise<{ isFirstSetup: boolean }> => {
        const response = await api.get<{ isFirstSetup: boolean }>(
            '/pharmacy/admin-first-setup',
        );
        return response.data;
    },
};
