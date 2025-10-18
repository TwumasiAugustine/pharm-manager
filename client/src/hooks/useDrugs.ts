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

    const queryParams = React.useMemo(() => {
        const result: DrugSearchParams = {
            page,
            limit,
            search: searchQuery || params.search,
        };

        // Only include branchId if it's not empty
        if (params.branchId && params.branchId.trim() !== '') {
            result.branchId = params.branchId;
        }

        // Include other search parameters
        if (params.category) result.category = params.category;
        if (params.requiresPrescription !== undefined)
            result.requiresPrescription = params.requiresPrescription;
        if (params.sortBy) result.sortBy = params.sortBy;
        if (params.sortOrder) result.sortOrder = params.sortOrder;
        if (params.expiryBefore) result.expiryBefore = params.expiryBefore;
        if (params.expiryAfter) result.expiryAfter = params.expiryAfter;

        return result;
    }, [
        params.branchId,
        params.search,
        params.category,
        params.requiresPrescription,
        params.sortBy,
        params.sortOrder,
        params.expiryBefore,
        params.expiryAfter,
        page,
        limit,
        searchQuery,
    ]);

    const queryKey = [
        'drugs',
        {
            branchId: queryParams.branchId,
            search: queryParams.search,
            category: queryParams.category,
            requiresPrescription: queryParams.requiresPrescription,
            sortBy: queryParams.sortBy,
            sortOrder: queryParams.sortOrder,
            expiryBefore: queryParams.expiryBefore,
            expiryAfter: queryParams.expiryAfter,
            page: queryParams.page,
            limit: queryParams.limit,
        },
    ];

    const query = useQuery({
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
                totalItems: 0,
                page,
                limit,
                totalPages: 0,
            };
        }
        return {
            drugs: Array.isArray(raw.drugs)
                ? raw.drugs.map((drug: Record<string, unknown>) => ({
                      id: drug.id || drug._id || '',
                      _id: drug._id || '',
                      name: drug.name || '',
                      brand: drug.brand || '',
                      category: drug.category || '',
                      dosageForm: drug.dosageForm || '',
                      ableToSell:
                          typeof drug.ableToSell === 'boolean'
                              ? drug.ableToSell
                              : true,
                      drugsInCarton: drug.drugsInCarton ?? 0,
                      unitsPerCarton: drug.unitsPerCarton ?? 0,
                      packsPerCarton: drug.packsPerCarton ?? 0,
                      quantity: drug.quantity ?? 0,
                      pricePerUnit: drug.pricePerUnit ?? 0,
                      pricePerPack: drug.pricePerPack ?? 0,
                      pricePerCarton: drug.pricePerCarton ?? 0,
                      costPrice: drug.costPrice ?? 0,
                      expiryDate: drug.expiryDate || '',
                      batchNumber: drug.batchNumber || '',
                      requiresPrescription: !!drug.requiresPrescription,
                      supplier: drug.supplier || '',
                      location: drug.location || '',
                      createdAt: drug.createdAt || '',
                      updatedAt: drug.updatedAt || '',
                      branchId: (drug.branchId as string) || '',
                      branch:
                          drug.branch && typeof drug.branch === 'object'
                              ? {
                                    id:
                                        ((
                                            drug.branch as Record<
                                                string,
                                                unknown
                                            >
                                        ).id as string) ||
                                        ((
                                            drug.branch as Record<
                                                string,
                                                unknown
                                            >
                                        )._id as string) ||
                                        '',
                                    name:
                                        ((
                                            drug.branch as Record<
                                                string,
                                                unknown
                                            >
                                        ).name as string) || '',
                                    _id:
                                        ((
                                            drug.branch as Record<
                                                string,
                                                unknown
                                            >
                                        )._id as string) || '',
                                }
                              : undefined,
                      branches: Array.isArray(drug.branches)
                          ? drug.branches.map(
                                (branch: Record<string, unknown>) => ({
                                    id:
                                        (((
                                            branch.branchId as Record<
                                                string,
                                                unknown
                                            >
                                        )?.id ||
                                            (
                                                branch.branchId as Record<
                                                    string,
                                                    unknown
                                                >
                                            )?._id ||
                                            branch.id ||
                                            branch._id) as string) || '',
                                    name:
                                        (((
                                            branch.branchId as Record<
                                                string,
                                                unknown
                                            >
                                        )?.name || branch.name) as string) ||
                                        '',
                                    _id:
                                        (((
                                            branch.branchId as Record<
                                                string,
                                                unknown
                                            >
                                        )?._id || branch._id) as string) || '',
                                }),
                            )
                          : undefined,
                  }))
                : [],
            totalCount: raw.totalCount ?? 0,
            page: raw.page ?? page,
            limit: raw.limit ?? limit,
            totalItems: raw.totalItems ?? 0,
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
        totalItems: mappedData.totalItems,
    };

    return {
        ...query,
        data: mappedData,
        pagination,
        setSearchQuery,
    };
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
                dosageForm: raw.dosageForm || '',
                ableToSell:
                    typeof raw.ableToSell === 'boolean' ? raw.ableToSell : true,
                drugsInCarton: raw.drugsInCarton ?? 0,
                unitsPerCarton: raw.unitsPerCarton ?? 0,
                packsPerCarton: raw.packsPerCarton ?? 0,
                quantity: raw.quantity ?? 0,
                pricePerUnit: raw.pricePerUnit ?? 0,
                pricePerPack: raw.pricePerPack ?? 0,
                pricePerCarton: raw.pricePerCarton ?? 0,
                costPrice: raw.costPrice ?? 0,
                expiryDate: raw.expiryDate || '',
                batchNumber: raw.batchNumber || '',
                requiresPrescription: !!raw.requiresPrescription,
                supplier: raw.supplier || '',
                location: raw.location || '',
                createdAt: raw.createdAt || '',
                updatedAt: raw.updatedAt || '',
                branchId: raw.branchId || '',
                branch:
                    raw.branch && typeof raw.branch === 'object'
                        ? {
                              id: raw.branch.id || raw.branch._id || '',
                              name: raw.branch.name || '',
                              _id: raw.branch._id || '',
                          }
                        : undefined,
                branches: Array.isArray(raw.branches)
                    ? raw.branches.map((branch: Record<string, unknown>) => ({
                          id:
                              (((branch.branchId as Record<string, unknown>)
                                  ?.id ||
                                  (branch.branchId as Record<string, unknown>)
                                      ?._id ||
                                  branch.id ||
                                  branch._id) as string) || '',
                          name:
                              (((branch.branchId as Record<string, unknown>)
                                  ?.name || branch.name) as string) || '',
                          _id:
                              (((branch.branchId as Record<string, unknown>)
                                  ?._id || branch._id) as string) || '',
                      }))
                    : undefined,
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
                dosageForm: raw.dosageForm || '',
                ableToSell:
                    typeof raw.ableToSell === 'boolean' ? raw.ableToSell : true,
                drugsInCarton: raw.drugsInCarton ?? 0,
                unitsPerCarton: raw.unitsPerCarton ?? 0,
                packsPerCarton: raw.packsPerCarton ?? 0,
                quantity: raw.quantity ?? 0,
                pricePerUnit: raw.pricePerUnit ?? 0,
                pricePerPack: raw.pricePerPack ?? 0,
                pricePerCarton: raw.pricePerCarton ?? 0,
                costPrice: raw.costPrice ?? 0,
                expiryDate: raw.expiryDate || '',
                batchNumber: raw.batchNumber || '',
                requiresPrescription: !!raw.requiresPrescription,
                supplier: raw.supplier || '',
                location: raw.location || '',
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
                dosageForm: raw.dosageForm || '',
                ableToSell:
                    typeof raw.ableToSell === 'boolean' ? raw.ableToSell : true,
                drugsInCarton: raw.drugsInCarton ?? 0,
                unitsPerCarton: raw.unitsPerCarton ?? 0,
                packsPerCarton: raw.packsPerCarton ?? 0,
                quantity: raw.quantity ?? 0,
                pricePerUnit: raw.pricePerUnit ?? 0,
                pricePerPack: raw.pricePerPack ?? 0,
                pricePerCarton: raw.pricePerCarton ?? 0,
                costPrice: raw.costPrice ?? 0,
                expiryDate: raw.expiryDate || '',
                batchNumber: raw.batchNumber || '',
                requiresPrescription: !!raw.requiresPrescription,
                supplier: raw.supplier || '',
                location: raw.location || '',
                createdAt: raw.createdAt || '',
                updatedAt: raw.updatedAt || '',
                branchId: raw.branchId || '',
                branch:
                    raw.branch && typeof raw.branch === 'object'
                        ? {
                              id: raw.branch.id || raw.branch._id || '',
                              name: raw.branch.name || '',
                              _id: raw.branch._id || '',
                          }
                        : undefined,
                branches: Array.isArray(raw.branches)
                    ? raw.branches.map((branch: Record<string, unknown>) => ({
                          id:
                              (((branch.branchId as Record<string, unknown>)
                                  ?.id ||
                                  (branch.branchId as Record<string, unknown>)
                                      ?._id ||
                                  branch.id ||
                                  branch._id) as string) || '',
                          name:
                              (((branch.branchId as Record<string, unknown>)
                                  ?.name || branch.name) as string) || '',
                          _id:
                              (((branch.branchId as Record<string, unknown>)
                                  ?._id || branch._id) as string) || '',
                      }))
                    : undefined,
            };
        },
        onSuccess: (updatedDrug) => {
            queryClient.setQueryData(['drug', id], updatedDrug);
            queryClient.invalidateQueries({ queryKey: ['drugs'] });
            notify.success('Drug updated successfully');
        },
        onError: (error: Error) => {
            console.error('Drug update error:', error);
            console.error('Error details:', {
                message: error.message,
                stack: error.stack,
                name: error.name,
            });
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
            let drugsArr: Drug[] = [];
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
            return drugsArr.map(
                (drug: Drug): Drug => ({
                    id: drug.id || drug._id || '',
                    _id: drug._id || '',
                    name: drug.name || '',
                    brand: drug.brand || '',
                    category: drug.category || '',
                    dosageForm: drug.dosageForm || '',
                    ableToSell:
                        typeof drug.ableToSell === 'boolean'
                            ? drug.ableToSell
                            : true,
                    costPrice: drug.costPrice ?? 0,
                    drugsInCarton: drug.drugsInCarton ?? 0,
                    unitsPerCarton: drug.unitsPerCarton ?? 0,
                    packsPerCarton: drug.packsPerCarton ?? 0,
                    quantity: drug.quantity ?? 0,
                    pricePerUnit: drug.pricePerUnit ?? 0,
                    pricePerPack: drug.pricePerPack ?? 0,
                    pricePerCarton: drug.pricePerCarton ?? 0,
                    expiryDate: drug.expiryDate || '',
                    batchNumber: drug.batchNumber || '',
                    requiresPrescription: !!drug.requiresPrescription,
                    supplier: drug.supplier || '',
                    location: drug.location || '',
                    createdAt: drug.createdAt || '',
                    updatedAt: drug.updatedAt || '',
                }),
            );
        },
    });
};
