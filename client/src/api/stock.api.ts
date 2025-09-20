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
        console.error('Refresh token failed:', error);
        return { message: 'Stock transfer failed.' };
    }
}
