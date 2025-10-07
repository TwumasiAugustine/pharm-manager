import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { superAdminApi } from '../api/super-admin.api';
import type {
    ICreatePharmacyRequest,
    ICreateAdminRequest,
} from '../api/super-admin.api';
import { useSafeNotify } from '../utils/useSafeNotify';

export const usePharmacies = (params?: {
    page?: number;
    limit?: number;
    search?: string;
    isActive?: boolean;
}) => {
    return useQuery({
        queryKey: ['pharmacies', params],
        queryFn: () => superAdminApi.getAllPharmacies(params),
    });
};

export const useCreatePharmacy = () => {
    const queryClient = useQueryClient();
    const notify = useSafeNotify();

    return useMutation({
        mutationFn: (data: ICreatePharmacyRequest) =>
            superAdminApi.createPharmacy(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pharmacies'] });
            notify.success('Pharmacy created successfully');
        },
        onError: (error: Error) => {
            const apiError = error as {
                response?: { data?: { message?: string } };
            };
            const errorMessage =
                apiError?.response?.data?.message ||
                'Failed to create pharmacy';
            notify.error(errorMessage);
        },
    });
};

export const useDeletePharmacy = () => {
    const queryClient = useQueryClient();
    const notify = useSafeNotify();

    return useMutation({
        mutationFn: (pharmacyId: string) =>
            superAdminApi.deletePharmacy(pharmacyId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pharmacies'] });
            notify.success('Pharmacy deleted successfully');
        },
        onError: (error: Error) => {
            const apiError = error as {
                response?: { data?: { message?: string } };
            };
            const errorMessage =
                apiError?.response?.data?.message ||
                'Failed to delete pharmacy';
            notify.error(errorMessage);
        },
    });
};

export const useAssignAdminToPharmacy = () => {
    const queryClient = useQueryClient();
    const notify = useSafeNotify();

    return useMutation({
        mutationFn: ({
            pharmacyId,
            adminId,
            permissions,
        }: {
            pharmacyId: string;
            adminId: string;
            permissions?: string[];
        }) =>
            superAdminApi.assignAdminToPharmacy(
                pharmacyId,
                adminId,
                permissions,
            ),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pharmacies'] });
            queryClient.invalidateQueries({ queryKey: ['admins'] });
            notify.success('Admin assigned to pharmacy successfully');
        },
        onError: (error: Error) => {
            const apiError = error as {
                response?: { data?: { message?: string } };
            };
            const errorMessage =
                apiError?.response?.data?.message || 'Failed to assign admin';
            notify.error(errorMessage);
        },
    });
};

export const useRemoveAdminFromPharmacy = () => {
    const queryClient = useQueryClient();
    const notify = useSafeNotify();

    return useMutation({
        mutationFn: ({
            pharmacyId,
            adminId,
        }: {
            pharmacyId: string;
            adminId: string;
        }) => superAdminApi.removeAdminFromPharmacy(pharmacyId, adminId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pharmacies'] });
            queryClient.invalidateQueries({ queryKey: ['admins'] });
            notify.success('Admin removed from pharmacy successfully');
        },
        onError: (error: Error) => {
            const apiError = error as {
                response?: { data?: { message?: string } };
            };
            const errorMessage =
                apiError?.response?.data?.message || 'Failed to remove admin';
            notify.error(errorMessage);
        },
    });
};

export const useRemoveAdminFromAllPharmacies = () => {
    const queryClient = useQueryClient();
    const notify = useSafeNotify();

    return useMutation({
        mutationFn: (adminId: string) =>
            superAdminApi.removeAdminFromAllPharmacies(adminId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pharmacies'] });
            queryClient.invalidateQueries({ queryKey: ['admins'] });
            notify.success('Admin removed from all pharmacies successfully');
        },
        onError: (error: Error) => {
            const apiError = error as {
                response?: { data?: { message?: string } };
            };
            const errorMessage =
                apiError?.response?.data?.message ||
                'Failed to remove admin from all pharmacies';
            notify.error(errorMessage);
        },
    });
};

export const useAdmins = () => {
    return useQuery({
        queryKey: ['admins'],
        queryFn: () => superAdminApi.getAllAdmins(),
    });
};

export const useCreateAdmin = () => {
    const queryClient = useQueryClient();
    const notify = useSafeNotify();

    return useMutation({
        mutationFn: (data: ICreateAdminRequest) =>
            superAdminApi.createAdminUser(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admins'] });
            queryClient.invalidateQueries({ queryKey: ['users'] });
            notify.success('Admin created successfully');
        },
        onError: (error: Error) => {
            const apiError = error as {
                response?: { data?: { message?: string } };
            };
            const errorMessage =
                apiError?.response?.data?.message || 'Failed to create admin';
            notify.error(errorMessage);
        },
    });
};

export const useUpdateAdmin = () => {
    const queryClient = useQueryClient();
    const notify = useSafeNotify();

    return useMutation({
        mutationFn: ({
            adminId,
            data,
        }: {
            adminId: string;
            data: {
                name?: string;
                email?: string;
                pharmacyId?: string;
                isActive?: boolean;
            };
        }) => superAdminApi.updateAdminUser(adminId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admins'] });
            queryClient.invalidateQueries({ queryKey: ['users'] });
            queryClient.invalidateQueries({ queryKey: ['pharmacies'] });
            notify.success('Admin updated successfully');
        },
        onError: (error: Error) => {
            const apiError = error as {
                response?: { data?: { message?: string } };
            };
            const errorMessage =
                apiError?.response?.data?.message || 'Failed to update admin';
            notify.error(errorMessage);
        },
    });
};

// Role-aware hooks for both Super Admin and Admin access
export const usePharmaciesByRole = (params?: {
    page?: number;
    limit?: number;
    search?: string;
    isActive?: boolean;
}) => {
    return useQuery({
        queryKey: ['pharmacies', 'by-role', params],
        queryFn: () => superAdminApi.getPharmaciesByRole(params),
    });
};

export const useAdminsByRole = () => {
    return useQuery({
        queryKey: ['admins', 'by-role'],
        queryFn: () => superAdminApi.getAdminsByRole(),
    });
};
