import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { pharmacyApi, type PharmacyInfo } from '../api/pharmacy.api';
import { useSafeNotify } from '../utils/useSafeNotify';
import { useAuthStore } from '../store/auth.store';

export const usePharmacyInfo = () => {
    const notify = useSafeNotify();

    return useQuery({
        queryKey: ['pharmacyInfo'],
        queryFn: async () => {
            try {
                return await pharmacyApi.getPharmacyInfo();
            } catch (error) {
                console.error('Error fetching pharmacy info:', error);
                notify.error('Failed to fetch pharmacy information');
                // Return a default object to prevent UI errors
                return {
                    pharmacyInfo: {
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
                    },
                    isConfigured: false,
                };
            }
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};

export const useUpdatePharmacyInfo = () => {
    const queryClient = useQueryClient();
    const notify = useSafeNotify();
    const { user, setPharmacyConfigured } = useAuthStore();

    return useMutation({
        mutationFn: (data: PharmacyInfo) => {
            if (user?.role !== 'admin' && user?.role !== 'super_admin') {
                const error = new Error(
                    'You are not authorized to perform this action.',
                );
                notify.error(error.message);
                return Promise.reject(error);
            }
            return pharmacyApi.updatePharmacyInfo(data);
        },
        onSuccess: async (data) => {
            queryClient.setQueryData(['pharmacyInfo'], data);
            queryClient.invalidateQueries({ queryKey: ['pharmacyInfo'] });
            setPharmacyConfigured(true);

            // Check if this is the first time setup using API
            try {
                const response = await pharmacyApi.checkAdminFirstSetup();
                if (response.isFirstSetup) {
                    notify.success(
                        'Pharmacy information configured successfully! You can now use the system.',
                    );
                } else {
                    notify.success(
                        'Pharmacy information updated successfully!',
                    );
                }
            } catch {
                notify.error('Failed to check first setup status.');
            }
        },
        onError: (error: Error) => {
            notify.error(
                error.message || 'Failed to update pharmacy information',
            );
        },
    });
};

export const useCheckPharmacySetup = () => {
    return useQuery({
        queryKey: ['pharmacySetupStatus'],
        queryFn: () => pharmacyApi.checkConfigStatus(),
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};

export const useCheckAdminFirstSetup = () => {
    return useQuery({
        queryKey: ['adminFirstSetup'],
        queryFn: async () => {
            return await pharmacyApi.checkAdminFirstSetup();
        },
    });
};

export const useUpdateShortCodeSettings = () => {
    const queryClient = useQueryClient();
    const notify = useSafeNotify();
    const { user } = useAuthStore();

    return useMutation({
        mutationFn: (settings: {
            requireSaleShortCode?: boolean;
            shortCodeExpiryMinutes?: number;
        }) => {
            if (user?.role !== 'admin' && user?.role !== 'super_admin') {
                const error = new Error(
                    'You are not authorized to perform this action.',
                );
                notify.error(error.message);
                return Promise.reject(error);
            }
            return pharmacyApi.updateShortCodeSettings(settings);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pharmacyInfo'] });
            notify.success('Short code settings updated successfully!');
        },
        onError: (error: Error) => {
            notify.error(
                error.message || 'Failed to update short code settings',
            );
        },
    });
};
