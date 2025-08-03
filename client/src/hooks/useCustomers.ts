import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import React from 'react';
import customerApi from '../api/customer.api';
import type {
    CreateCustomerRequest,
    Customer,
    PaginatedCustomersResponse,
} from '../types/customer.types';
import type {
    QueryResultWithPagination,
    PaginationControls,
} from '../types/query.types';
import { useSafeNotify } from '../utils/useSafeNotify';

/**
 * Hook for fetching a paginated list of customers
 */
export const useCustomers = (
    params: { page?: number; limit?: number; search?: string } = {},
): QueryResultWithPagination<PaginatedCustomersResponse, Error> => {
    const [searchQuery, setSearchQuery] = React.useState<string>(
        params.search || '',
    );
    const [page, setPage] = React.useState<number>(params.page || 1);
    const [limit, setLimit] = React.useState<number>(params.limit || 10);

    // Update search query when params.search changes
    React.useEffect(() => {
        if (params.search !== undefined) {
            setSearchQuery(params.search);
        }
    }, [params.search]);

    const queryParams = React.useMemo(
        () => ({
            page,
            limit,
            search: searchQuery,
        }),
        [page, limit, searchQuery],
    );

    const queryKey = ['customers', queryParams];

    const query = useQuery<any, Error>({
        queryKey,
        queryFn: () => customerApi.getCustomers(queryParams),
        staleTime: 30 * 1000, // 30 seconds - shorter for real-time updates
    });

    const mappedData: PaginatedCustomersResponse = React.useMemo(() => {
        const raw = query.data;
        if (!raw || typeof raw !== 'object') {
            return {
                customers: [],
                totalCount: 0,
                page,
                limit,
                totalPages: 0,
            };
        }
        return {
            customers: Array.isArray(raw.customers)
                ? raw.customers.map((customer: any) => ({
                      id: customer.id || customer._id || '',
                      name: customer.name || '',
                      phone: customer.phone || '',
                      purchases: Array.isArray(customer.purchases)
                          ? customer.purchases
                          : [],
                      createdAt: customer.createdAt || '',
                      updatedAt: customer.updatedAt || '',
                  }))
                : [],
            totalCount: raw.totalCount ?? 0,
            page: raw.page ?? page,
            limit: raw.limit ?? limit,
            totalPages: raw.totalPages ?? 0,
        };
    }, [query.data, page, limit]);

    const totalPages = React.useMemo(() => {
        return mappedData.totalPages || 0;
    }, [mappedData]);

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
    } as QueryResultWithPagination<PaginatedCustomersResponse, Error>;
};

/**
 * Hook for creating a new customer
 */
export const useCreateCustomer = () => {
    const queryClient = useQueryClient();
    const notify = useSafeNotify();

    return useMutation<Customer, Error, CreateCustomerRequest>({
        mutationFn: (data) => customerApi.createCustomer(data),
        onSuccess: () => {
            // Force fresh data by removing cache and refetching
            queryClient.removeQueries({ queryKey: ['customers'] });
            queryClient.refetchQueries({ queryKey: ['customers'] });
            notify.success('Customer created successfully');
        },
        onError: (error) => {
            notify.error(
                'Failed to create customer' +
                    (error.message ? `: ${error.message}` : ''),
            );
        },
    });
};

/**
 * Hook for getting customer by ID
 */
export const useCustomer = (id: string, options?: { enabled?: boolean }) => {
    return useQuery<Customer, Error>({
        queryKey: ['customers', id],
        queryFn: () => customerApi.getCustomerById(id),
        staleTime: 5 * 60 * 1000, // 5 minutes
        enabled: options?.enabled !== false && !!id,
    });
};
