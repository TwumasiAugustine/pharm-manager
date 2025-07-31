import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import React from 'react';
import drugApi from '../api/drug.api';
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

    const query = useQuery<any, Error>({
        queryKey,
        queryFn: () => drugApi.getDrugs(queryParams),
        staleTime: 5 * 60 * 1000, // 5 minutes
    });

    // Defensive mapping for paginated drugs response
    const mappedData: PaginatedDrugsResponse = React.useMemo(() => {
        const raw = query.data;
        if (!raw || typeof raw !== 'object') {
            return {
                drugs: [],
                totalCount: 0,
                page,
                limit,
                totalPages: 0,
            };
        }
        return {
            drugs: Array.isArray(raw.drugs)
                ? raw.drugs.map((drug: any) => ({
                      id: drug.id || drug._id || '',
                      _id: drug._id || '',
                      name: drug.name || '',
                      brand: drug.brand || '',
                      category: drug.category || '',
                      price: drug.price ?? 0,
                      stock: drug.stock ?? 0,
                      expiryDate: drug.expiryDate || '',
                      requiresPrescription: !!drug.requiresPrescription,
                      createdAt: drug.createdAt || '',
                      updatedAt: drug.updatedAt || '',
                  }))
                : [],
            totalCount: raw.totalCount ?? 0,
            page: raw.page ?? page,
            limit: raw.limit ?? limit,
            totalPages: raw.totalPages ?? 0,
        };
    }, [query.data, page, limit]);

    // Calculate total pages based on the response
    const totalPages = React.useMemo(() => {
        return mappedData.totalPages || 0;
    }, [mappedData]);

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
        data: mappedData,
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
        queryFn: async () => {
            const raw = await drugApi.getDrug(id);
            if (!raw || typeof raw !== 'object') {
                throw new Error('Drug data is undefined or invalid');
            }
            return {
                id: raw.id || raw._id || '',
                _id: raw._id || '',
                name: raw.name || '',
                brand: raw.brand || '',
                category: raw.category || '',
                price: raw.price ?? 0,
                stock: raw.stock ?? 0,
                expiryDate: raw.expiryDate || '',
                requiresPrescription: !!raw.requiresPrescription,
                createdAt: raw.createdAt || '',
                updatedAt: raw.updatedAt || '',
                quantity: raw.quantity ?? 0,
                batchNumber: raw.batchNumber || '',
            };
        },
        enabled: !!id,
    });
};

/**
 * Hook for creating a new drug
 */
export const useCreateDrug = () => {
    const queryClient = useQueryClient();
    const notify = useSafeNotify();

    return useMutation({
        mutationFn: async (drugData: CreateDrugRequest) => {
            const raw = await drugApi.createDrug(drugData);
            if (!raw || typeof raw !== 'object') {
                throw new Error('Drug data is undefined or invalid');
            }
            return {
                id: raw.id || raw._id || '',
                _id: raw._id || '',
                name: raw.name || '',
                brand: raw.brand || '',
                category: raw.category || '',
                price: raw.price ?? 0,
                stock: raw.stock ?? 0,
                expiryDate: raw.expiryDate || '',
                requiresPrescription: !!raw.requiresPrescription,
                createdAt: raw.createdAt || '',
                updatedAt: raw.updatedAt || '',
            };
        },
        onSuccess: () => {
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
        mutationFn: async (updateData: UpdateDrugRequest) => {
            const raw = await drugApi.updateDrug(id, updateData);
            if (!raw || typeof raw !== 'object') {
                throw new Error('Drug data is undefined or invalid');
            }
            return {
                id: raw.id || raw._id || '',
                _id: raw._id || '',
                name: raw.name || '',
                brand: raw.brand || '',
                category: raw.category || '',
                price: raw.price ?? 0,
                stock: raw.stock ?? 0,
                expiryDate: raw.expiryDate || '',
                requiresPrescription: !!raw.requiresPrescription,
                createdAt: raw.createdAt || '',
                updatedAt: raw.updatedAt || '',
            };
        },
        onSuccess: (updatedDrug) => {
            queryClient.setQueryData(['drug', id], updatedDrug);
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
        mutationFn: async (id: string) => {
            // No mapping needed for delete
            return await drugApi.deleteDrug(id);
        },
        onSuccess: (_data, id) => {
            queryClient.invalidateQueries({ queryKey: ['drugs'] });
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
        queryFn: async () => {
            const raw = await drugApi.getCategories();
            // Accepts { categories: string[] } or string[] directly
            if (
                raw &&
                typeof raw === 'object' &&
                'categories' in raw &&
                Array.isArray(raw.categories)
            ) {
                return raw.categories;
            }
            if (Array.isArray(raw)) return raw;
            return [];
        },
        staleTime: 60 * 60 * 1000, // 1 hour
    });
};

/**
 * Hook for fetching drugs expiring soon
 */
export const useExpiringDrugs = (days: number) => {
    return useQuery<Drug[], Error>({
        queryKey: ['expiringDrugs', days],
        queryFn: async () => {
            const raw = await drugApi.getExpiringDrugs(days);
            // Accepts { drugs: Drug[] } or Drug[] directly
            let drugsArr: any[] = [];
            if (
                raw &&
                typeof raw === 'object' &&
                'drugs' in raw &&
                Array.isArray(raw.drugs)
            ) {
                drugsArr = raw.drugs;
            } else if (Array.isArray(raw)) {
                drugsArr = raw;
            }
            return drugsArr.map((drug: any) => ({
                id: drug.id || drug._id || '',
                _id: drug._id || '',
                name: drug.name || '',
                brand: drug.brand || '',
                category: drug.category || '',
                price: drug.price ?? 0,
                stock: drug.stock ?? 0,
                expiryDate: drug.expiryDate || '',
                requiresPrescription: !!drug.requiresPrescription,
                createdAt: drug.createdAt || '',
                updatedAt: drug.updatedAt || '',
                quantity: drug.quantity ?? 0,
                batchNumber: drug.batchNumber || '',
            }));
        },
    });
};
