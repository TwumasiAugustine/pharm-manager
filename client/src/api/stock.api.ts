import api from './api';

export interface StockTransferRequest {
    drugId: string;
    fromBranchId: string;
    toBranchId: string;
    quantity: number;
}

export interface StockTransferResponse {
    message: string;
}

/**
 * Calls the backend API to transfer stock between branches.
 * @param data Stock transfer request payload
 * @returns Response with message
 */
export async function transferStock(
    data: StockTransferRequest
): Promise<StockTransferResponse> {
    try {
        const response = await api.post<StockTransferResponse>(
            '/stock/transfer',
            data
        );
        return response.data;
    } catch (error) {
        if (error && typeof error === 'object' && 'response' in error) {
            // @ts-expect-error: error.response is from axios
            throw new Error(
                error.response?.data?.error ||
                error.response?.message ||
                'Stock transfer failed'
            );
        }
        throw new Error((error as Error)?.message || 'Stock transfer failed');
    }
}
