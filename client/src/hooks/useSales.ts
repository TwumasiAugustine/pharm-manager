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
            // Defensive mapping for all sales
            return {
                ...raw,
                data: Array.isArray(raw.data)
                    ? raw.data.map((sale: any) => ({
                          id: sale.id || sale._id || '',
                          _id: sale._id || '',
                          items: Array.isArray(sale.items)
                              ? sale.items.map((item: any) => ({
                                    drugId:
                                        (item.drug &&
                                            (item.drug.id || item.drug._id)) ||
                                        item.drugId ||
                                        '',
                                    name: item.drug?.name || '',
                                    brand: item.drug?.brand || '',
                                    quantity: item.quantity ?? 0,
                                    priceAtSale: item.priceAtSale ?? 0,
                                }))
                              : [],
                          totalAmount: sale.totalAmount ?? 0,
                          soldBy:
                              sale.soldBy && typeof sale.soldBy === 'object'
                                  ? {
                                        id:
                                            sale.soldBy.id ||
                                            sale.soldBy._id ||
                                            '',
                                        _id: sale.soldBy._id || '',
                                        name: sale.soldBy.name || '',
                                    }
                                  : { id: '', name: '' },
                          paymentMethod: sale.paymentMethod || 'cash',
                          transactionId: sale.transactionId,
                          notes: sale.notes,
                          createdAt: sale.createdAt || '',
                          date: sale.date,
                      }))
                    : [],
            };
        },
    });
};

export const useSale = (id: string) => {
    return useQuery<Sale, Error>({
        queryKey: ['sale', id],
        queryFn: async () => {
            const raw = await saleApi.getSaleById(id);
            // Defensive mapping for a single sale
            let data: any = raw;
            // If backend wraps in { data: ... }
            if (raw && typeof raw === 'object' && 'data' in raw && raw.data) {
                data = raw.data;
            }
            if (!data || typeof data !== 'object') {
                throw new Error('Sale data is undefined or invalid');
            }
            const sale: Sale = {
                id: data.id || data._id || '',
                _id: data._id || '',
                items: Array.isArray(data.items)
                    ? data.items.map((item: any) => ({
                          drugId:
                              (item.drug && (item.drug.id || item.drug._id)) ||
                              item.drugId ||
                              '',
                          name: item.drug?.name || '',
                          brand: item.drug?.brand || '',
                          quantity: item.quantity ?? 0,
                          priceAtSale: item.priceAtSale ?? 0,
                      }))
                    : [],
                totalAmount: data.totalAmount ?? 0,
                soldBy:
                    data.soldBy && typeof data.soldBy === 'object'
                        ? {
                              id: data.soldBy.id || data.soldBy._id || '',
                              _id: data.soldBy._id || '',
                              name: data.soldBy.name || '',
                          }
                        : { id: '', name: '' },
                paymentMethod: data.paymentMethod || 'cash',
                transactionId: data.transactionId ?? '',
                notes: data.notes ?? '',
                createdAt: data.createdAt || '',
                date: data.date ?? '',
            };
            if (!sale.id && !sale._id) {
                throw new Error('Sale data is undefined or invalid');
            }
            return sale;
        },
        enabled: !!id,
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
