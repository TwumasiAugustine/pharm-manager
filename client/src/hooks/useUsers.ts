import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/api';
import type { IUser } from '../types/user.types';

interface UserSearchParams {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    branchId?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export function useUsers(params: UserSearchParams) {
    return useQuery<
        {
            users: IUser[];
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        },
        Error
    >({
        queryKey: ['users', params],
        queryFn: async () => {
            const { data } = await api.get('/users', { params });
            return data.data; // unwrap the .data property from API response
        },
    });
}

export function useCreateUser() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (user: Partial<IUser>) => {
            await api.post('/users', user);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
    });
}

export function useUpdateUser() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (user: Partial<IUser> & { id: string }) => {
            await api.put(`/users/${user.id}`, user);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
    });
}

export function useDeleteUser() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            await api.delete(`/users/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
    });
}
