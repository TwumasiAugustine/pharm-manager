import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import React from 'react';
import { drugApi } from '../api/drug.api';
import type {
    CreateDrugRequest,
    Drug,
    DrugSearchParams,
    PaginatedDrugsResponse,
    UpdateDrugRequest,
} from '../types/drug.types';
import type {
    QueryResultWithPagination,
    PaginationControls,
} from '../types/query.types';
import { useSafeNotify } from '../utils/useSafeNotify';

/**
 * Hook for fetching a paginated list of drugs
 */
export const useDrugs = (
    params: DrugSearchParams = {},
): QueryResultWithPagination<PaginatedDrugsResponse, Error> => {
    const [searchQuery, setSearchQuery] = React.useState<string>('');
    const [page, setPage] = React.useState<number>(params.page || 1);
    const [limit, setLimit] = React.useState<number>(params.limit || 10);

    const queryParams = React.useMemo(
        () => ({
            ...params,
            page,
            limit,
            search: searchQuery || params.search,
        }),
        [params, page, limit, searchQuery],
    );

    const queryKey = ['drugs', queryParams];

    const query = useQuery<PaginatedDrugsResponse, Error>({
        queryKey,
        queryFn: () => drugApi.getDrugs(queryParams),
        staleTime: 5 * 60 * 1000, // 5 minutes
    });

    // Calculate total pages based on the response
    const totalPages = React.useMemo(() => {
        if (!query.data) return 0;
        return Math.ceil(query.data.totalCount / limit);
    }, [query.data, limit]);

    // Pagination controls
    const pagination: PaginationControls = {
        page,
        setPage,
        limit,
        setLimit,
        totalPages,
    };

    return {
        ...query,
        pagination,
        setSearchQuery,
    } as QueryResultWithPagination<PaginatedDrugsResponse, Error>;
};

/**
 * Hook for fetching a single drug by ID
 */
export const useDrug = (id: string) => {
    return useQuery<Drug, Error>({
        queryKey: ['drug', id],
        queryFn: () => drugApi.getDrug(id),
        enabled: !!id, // Only fetch if ID is provided
    });
};

/**
 * Hook for creating a new drug
 */
export const useCreateDrug = () => {
    const queryClient = useQueryClient();
    const notify = useSafeNotify();

    return useMutation({
        mutationFn: (drugData: CreateDrugRequest) =>
            drugApi.createDrug(drugData),
        onSuccess: () => {
            // Invalidate drugs list query to refetch
            queryClient.invalidateQueries({ queryKey: ['drugs'] });
            notify.success('Drug created successfully');
        },
        onError: (error: Error) => {
            notify.error(error.message || 'Failed to create drug');
        },
    });
};

/**
 * Hook for updating a drug
 */
export const useUpdateDrug = (id: string) => {
    const queryClient = useQueryClient();
    const notify = useSafeNotify();

    return useMutation({
        mutationFn: (updateData: UpdateDrugRequest) =>
            drugApi.updateDrug(id, updateData),
        onSuccess: (updatedDrug) => {
            // Update drug in cache
            queryClient.setQueryData(['drug', id], updatedDrug);
            // Invalidate drugs list query to refetch
            queryClient.invalidateQueries({ queryKey: ['drugs'] });
            notify.success('Drug updated successfully');
        },
        onError: (error: Error) => {
            notify.error(error.message || 'Failed to update drug');
        },
    });
};

/**
 * Hook for deleting a drug
 */
export const useDeleteDrug = () => {
    const queryClient = useQueryClient();
    const notify = useSafeNotify();

    return useMutation({
        mutationFn: (id: string) => drugApi.deleteDrug(id),
        onSuccess: (_data, id) => {
            // Invalidate drugs list query to refetch
            queryClient.invalidateQueries({ queryKey: ['drugs'] });
            // Remove from cache
            queryClient.removeQueries({ queryKey: ['drug', id] });
            notify.success('Drug deleted successfully');
        },
        onError: (error: Error) => {
            notify.error(error.message || 'Failed to delete drug');
        },
    });
};

/**
 * Hook for fetching drug categories
 */
export const useDrugCategories = () => {
    return useQuery<string[], Error>({
        queryKey: ['drugCategories'],
        queryFn: () => drugApi.getCategories(),
        staleTime: 60 * 60 * 1000, // 1 hour
    });
};

/**
 * Hook for fetching drugs expiring soon
 */
export const useExpiringDrugs = (days: number = 30) => {
    return useQuery<Drug[], Error>({
        queryKey: ['expiringDrugs', days],
        queryFn: () => drugApi.getExpiringDrugs(days),
    });
};
