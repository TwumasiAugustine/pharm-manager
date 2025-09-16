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
    requireSaleShortCode?: boolean;
    shortCodeExpiryMinutes?: number;
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
    // Toggle sale short code feature (admin only)
    toggleSaleShortCode: async (
        enabled: boolean,
    ): Promise<{
        requireSaleShortCode: boolean;
        pharmacyInfo?: PharmacyInfo;
    }> => {
        const response = await api.post('/pharmacy/toggle-sale-shortcode', {
            enabled,
        });
        // If backend returns updated pharmacyInfo, return it; else just the flag
        return response.data;
    },
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
                pharmacyInfo = response.data.data.pharmacyInfo;
                isConfigured = response.data.data.isConfigured;
            } else if (response.data.data && response.data.data.name) {
                pharmacyInfo = response.data.data;
                isConfigured = true;
            } else if (response.data.name) {
                pharmacyInfo = response.data;
                isConfigured = true;
            } else {
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
                    requireSaleShortCode: false,
                    shortCodeExpiryMinutes: 15,
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
                requireSaleShortCode:
                    typeof pharmacyInfo.requireSaleShortCode === 'boolean'
                        ? pharmacyInfo.requireSaleShortCode
                        : false,
                shortCodeExpiryMinutes:
                    typeof pharmacyInfo.shortCodeExpiryMinutes === 'number'
                        ? pharmacyInfo.shortCodeExpiryMinutes
                        : 15,
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

    // Update short code settings (admin only)
    updateShortCodeSettings: async (settings: {
        requireSaleShortCode?: boolean;
        shortCodeExpiryMinutes?: number;
    }): Promise<{
        success: boolean;
        message: string;
        data: {
            requireSaleShortCode: boolean;
            shortCodeExpiryMinutes: number;
        };
    }> => {
        const response = await api.patch(
            '/pharmacy/short-code-settings',
            settings,
        );
        return response.data;
    },
};
