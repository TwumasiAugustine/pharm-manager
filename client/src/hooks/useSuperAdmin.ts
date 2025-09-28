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
