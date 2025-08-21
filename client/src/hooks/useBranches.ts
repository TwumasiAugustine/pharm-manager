import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    fetchBranches,
    createBranch,
    updateBranch,
    deleteBranch,
} from '../api/branch.api';
import type { Branch } from '../types/branch.types';

export function useBranches() {
    return useQuery<Branch[]>({
        queryKey: ['branches'],
        queryFn: fetchBranches,
    });
}

export function useCreateBranch() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createBranch,
        onSuccess: () =>
            queryClient.invalidateQueries({ queryKey: ['branches'] }),
    });
}

export function useUpdateBranch() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, branch }: { id: string; branch: Partial<Branch> }) =>
            updateBranch(id, branch),
        onSuccess: () =>
            queryClient.invalidateQueries({ queryKey: ['branches'] }),
    });
}

export function useDeleteBranch() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteBranch,
        onSuccess: () =>
            queryClient.invalidateQueries({ queryKey: ['branches'] }),
    });
}
