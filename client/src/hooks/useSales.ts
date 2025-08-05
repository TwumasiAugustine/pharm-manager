import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import saleApi from '../api/sale.api';
import type {
    Sale,
    CreateSaleRequest,
    SaleSearchParams,
    SalesListResponse,
} from '../types/sale.types';
import { useSafeNotify } from '../utils/useSafeNotify';

export const useSales = (params: SaleSearchParams) => {
    return useQuery<SalesListResponse, Error>({
        queryKey: ['sales', params],
        queryFn: async () => {
            const raw = await saleApi.getSales(params);
            return raw;
        },
    });
};


export const useSale = (id: string) => {
    return useQuery<Sale, Error>({
        queryKey: ['sale', id],
        queryFn: async () => {
            const raw = await saleApi.getSaleById(id);
            return raw;
        },
    });
};

export const useCreateSale = () => {
    const queryClient = useQueryClient();
    const notify = useSafeNotify();
    return useMutation<Sale, Error, CreateSaleRequest>({
        mutationFn: (sale) => saleApi.createSale(sale),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sales'] });
            notify.success('Sale created successfully');
        },
        onError: (error) => {
            console.error('Error creating sale:', error);
            notify.error('Failed to create sale');
        },
    });
};
