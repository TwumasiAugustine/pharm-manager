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
            console.log(raw);
            // Defensive mapping for all sales
            return {
                ...raw,
                data: Array.isArray(raw.data)
                    ? raw.data.map((sale: unknown) => {
                          const saleObj = sale as Record<string, unknown>;
                          return {
                              id: String(saleObj.id || saleObj._id || ''),
                              _id: String(saleObj._id || ''),
                              items: Array.isArray(saleObj.items)
                                  ? saleObj.items.map((item: unknown) => {
                                        const itemObj = item as Record<
                                            string,
                                            unknown
                                        >;
                                        const drugObj = itemObj.drug as
                                            | Record<string, unknown>
                                            | undefined;
                                        return {
                                            drugId: String(
                                                drugObj?.id ||
                                                    drugObj?._id ||
                                                    itemObj.drugId ||
                                                    '',
                                            ),
                                            name: String(drugObj?.name || ''),
                                            brand: String(drugObj?.brand || ''),
                                            quantity:
                                                Number(itemObj.quantity) || 0,
                                            priceAtSale:
                                                Number(itemObj.priceAtSale) ||
                                                0,
                                        };
                                    })
                                  : [],
                              totalAmount: Number(saleObj.totalAmount) || 0,
                              soldBy:
                                  saleObj.soldBy &&
                                  typeof saleObj.soldBy === 'object'
                                      ? {
                                            id: String(
                                                (
                                                    saleObj.soldBy as Record<
                                                        string,
                                                        unknown
                                                    >
                                                ).id ||
                                                    (
                                                        saleObj.soldBy as Record<
                                                            string,
                                                            unknown
                                                        >
                                                    )._id ||
                                                    '',
                                            ),
                                            _id: String(
                                                (
                                                    saleObj.soldBy as Record<
                                                        string,
                                                        unknown
                                                    >
                                                )._id || '',
                                            ),
                                            name: String(
                                                (
                                                    saleObj.soldBy as Record<
                                                        string,
                                                        unknown
                                                    >
                                                ).name || '',
                                            ),
                                        }
                                      : { id: '', _id: '', name: '' },
                              customer:
                                  saleObj.customer &&
                                  typeof saleObj.customer === 'object'
                                      ? {
                                            id: String(
                                                (
                                                    saleObj.customer as Record<
                                                        string,
                                                        unknown
                                                    >
                                                ).id ||
                                                    (
                                                        saleObj.customer as Record<
                                                            string,
                                                            unknown
                                                        >
                                                    )._id ||
                                                    '',
                                            ),
                                            _id: String(
                                                (
                                                    saleObj.customer as Record<
                                                        string,
                                                        unknown
                                                    >
                                                )._id || '',
                                            ),
                                            name: String(
                                                (
                                                    saleObj.customer as Record<
                                                        string,
                                                        unknown
                                                    >
                                                ).name || '',
                                            ),
                                            phone: String(
                                                (
                                                    saleObj.customer as Record<
                                                        string,
                                                        unknown
                                                    >
                                                ).phone || '',
                                            ),
                                        }
                                      : undefined,
                              paymentMethod:
                                  (saleObj.paymentMethod as
                                      | 'cash'
                                      | 'card'
                                      | 'mobile') || 'cash',
                              transactionId: String(
                                  saleObj.transactionId || '',
                              ),
                              notes: String(saleObj.notes || ''),
                              createdAt: String(saleObj.createdAt || ''),
                              date: String(saleObj.date || ''),
                          };
                      })
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
            let data: unknown = raw;
            // If backend wraps in { data: ... }
            if (raw && typeof raw === 'object' && 'data' in raw && raw.data) {
                data = raw.data;
            }
            if (!data || typeof data !== 'object') {
                throw new Error('Sale data is undefined or invalid');
            }

            const dataObj = data as Record<string, unknown>;
            const sale: Sale = {
                id: String(dataObj.id || dataObj._id || ''),
                _id: String(dataObj._id || ''),
                items: Array.isArray(dataObj.items)
                    ? dataObj.items.map((item: unknown) => {
                          const itemObj = item as Record<string, unknown>;
                          const drugObj = itemObj.drug as
                              | Record<string, unknown>
                              | undefined;
                          return {
                              drugId: String(
                                  drugObj?.id ||
                                      drugObj?._id ||
                                      itemObj.drugId ||
                                      '',
                              ),
                              name: String(drugObj?.name || ''),
                              brand: String(drugObj?.brand || ''),
                              quantity: Number(itemObj.quantity) || 0,
                              priceAtSale: Number(itemObj.priceAtSale) || 0,
                          };
                      })
                    : [],
                totalAmount: Number(dataObj.totalAmount) || 0,
                soldBy:
                    dataObj.soldBy && typeof dataObj.soldBy === 'object'
                        ? {
                              id: String(
                                  (dataObj.soldBy as Record<string, unknown>)
                                      .id ||
                                      (
                                          dataObj.soldBy as Record<
                                              string,
                                              unknown
                                          >
                                      )._id ||
                                      '',
                              ),
                              _id: String(
                                  (dataObj.soldBy as Record<string, unknown>)
                                      ._id || '',
                              ),
                              name: String(
                                  (dataObj.soldBy as Record<string, unknown>)
                                      .name || '',
                              ),
                          }
                        : { id: '', _id: '', name: '' },
                customer:
                    dataObj.customer && typeof dataObj.customer === 'object'
                        ? {
                              id: String(
                                  (dataObj.customer as Record<string, unknown>)
                                      .id ||
                                      (
                                          dataObj.customer as Record<
                                              string,
                                              unknown
                                          >
                                      )._id ||
                                      '',
                              ),
                              _id: String(
                                  (dataObj.customer as Record<string, unknown>)
                                      ._id || '',
                              ),
                              name: String(
                                  (dataObj.customer as Record<string, unknown>)
                                      .name || '',
                              ),
                              phone: String(
                                  (dataObj.customer as Record<string, unknown>)
                                      .phone || '',
                              ),
                          }
                        : undefined,
                paymentMethod:
                    (dataObj.paymentMethod as 'cash' | 'card' | 'mobile') ||
                    'cash',
                transactionId: String(dataObj.transactionId || ''),
                notes: String(dataObj.notes || ''),
                createdAt: String(dataObj.createdAt || ''),
                date: String(dataObj.date || ''),
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
