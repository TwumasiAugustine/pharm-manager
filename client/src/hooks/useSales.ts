import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../api/api';
import type {
    Sale,
    CreateSaleRequest,
    SaleSearchParams,
    GroupedSales,
} from '../types/sale.types';

interface SalesResponse {
    data: Sale[] | GroupedSales[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

// Helper function to process MongoDB documents
const transformMongoResponse = (sale: any): Sale => {
    // Handle _id vs id inconsistency
    const processedSale: Sale = {
        id: sale.id || (sale._id ? sale._id.toString() : undefined),
        items: Array.isArray(sale.items)
            ? sale.items.map((item: any) => ({
                  drug:
                      typeof item.drug === 'object' && item.drug !== null
                          ? {
                                id:
                                    item.drug.id ||
                                    (item.drug._id
                                        ? item.drug._id.toString()
                                        : ''),
                                name: item.drug.name || '',
                                brand: item.drug.brand || '',
                            }
                          : {
                                id: item.drugId || '',
                                name: item.name || '',
                                brand: '',
                            },
                  quantity: item.quantity || 0,
                  priceAtSale: item.priceAtSale || 0,
              }))
            : [],
        totalAmount: sale.totalAmount || 0,
        soldBy:
            typeof sale.soldBy === 'object' && sale.soldBy !== null
                ? {
                      id:
                          sale.soldBy.id ||
                          (sale.soldBy._id ? sale.soldBy._id.toString() : ''),
                      name: sale.soldBy.name || 'Unknown',
                  }
                : { id: '', name: 'Unknown' },
        // Customer information removed
        createdAt: sale.createdAt || new Date().toISOString(),
        date:
            sale.date ||
            (sale.createdAt
                ? new Date(sale.createdAt).toISOString().split('T')[0]
                : ''),
    };

    return processedSale;
};

const fetchSales = async (params: SaleSearchParams): Promise<SalesResponse> => {
    // Ensure numeric parameters are passed as numbers, not strings
    const queryParams = {
        ...params,
        page: params.page ? Number(params.page) : 1,
        limit: params.limit ? Number(params.limit) : 10,
    };

    console.log('Fetching sales with params:', queryParams);

    try {
        const response = await api.get('/sales', { params: queryParams });
        console.log('Sales API Response:', response.data);

        // The server response structure: { success, message, data, statusCode }
        if (response.data && response.data.data) {
            const responseData = response.data.data;

            // Check if responseData has the paginated structure
            if (responseData.data && responseData.pagination) {
                // Transform the data to ensure consistent format
                const transformedData = Array.isArray(responseData.data)
                    ? responseData.data.map(transformMongoResponse)
                    : [];

                return {
                    data: transformedData,
                    pagination: responseData.pagination,
                };
            }

            // If responseData is the sales array directly
            if (Array.isArray(responseData)) {
                const transformedData = responseData.map(
                    transformMongoResponse,
                );

                return {
                    data: transformedData,
                    pagination: {
                        total: transformedData.length,
                        page: 1,
                        limit: transformedData.length,
                        totalPages: 1,
                    },
                };
            }

            // If it's a single sale, wrap it in an array
            if (responseData && typeof responseData === 'object') {
                const transformedSale = transformMongoResponse(responseData);

                return {
                    data: [transformedSale],
                    pagination: {
                        total: 1,
                        page: 1,
                        limit: 1,
                        totalPages: 1,
                    },
                };
            }
        }
    } catch (err) {
        if (err instanceof Error) {
            console.error('Error processing sales response:', err.message);
        } else {
            console.error('Error processing sales response:', err);
        }
    }

    return {
        data: [],
        pagination: {
            total: 0,
            page: 1,
            limit: 10,
            totalPages: 0,
        },
    };
};

const fetchSaleById = async (id: string): Promise<Sale> => {
    const response = await api.get(`/sales/${id}`);
    console.log('Sale by ID response:', response.data);

    try {
        // Handle the nested response structure
        if (response.data && response.data.data) {
            return transformMongoResponse(response.data.data);
        }
    } catch (err) {
        console.error('Error processing sale by ID response:', err);
    }

    throw new Error('Sale not found or invalid response structure');
};

const createSale = async (saleData: CreateSaleRequest): Promise<Sale> => {
    const response = await api.post('/sales', saleData);
    console.log('Create sale response:', response.data);

    // Handle the nested response structure
    if (response.data && response.data.data) {
        return transformMongoResponse(response.data.data);
    }

    throw new Error('Failed to create sale');
};

export const useSales = (params: SaleSearchParams) => {
    // Add console log to see the params being used
    console.log('useSales hook called with params:', params);

    return useQuery<SalesResponse, Error>({
        queryKey: ['sales', params],
        queryFn: () => fetchSales(params),
    });
};

export const useSale = (id: string) => {
    return useQuery<Sale, Error>({
        queryKey: ['sales', id],
        queryFn: () => fetchSaleById(id),
        enabled: !!id,
    });
};

export const useCreateSale = () => {
    const queryClient = useQueryClient();
    return useMutation<Sale, Error, CreateSaleRequest>({
        mutationFn: createSale,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sales'] });
            queryClient.invalidateQueries({ queryKey: ['drugs'] }); // Invalidate drugs due to stock changes
        },
    });
};
