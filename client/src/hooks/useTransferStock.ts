import { useMutation, type UseMutationResult } from '@tanstack/react-query';
import type {
    StockTransferRequest,
    StockTransferResponse,
} from '../api/stock.api';
import { transferStock } from '../api/stock.api';

/**
 * React Query mutation hook for transferring stock between branches.
 * @returns Mutation object for stock transfer
 */
export function useTransferStock(): UseMutationResult<
    StockTransferResponse,
    Error,
    StockTransferRequest
> {
    return useMutation<StockTransferResponse, Error, StockTransferRequest>(
        (data) => transferStock(data),
    );
}
