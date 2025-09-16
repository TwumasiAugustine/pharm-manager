import api from './api';

export interface ExpiredSaleStats {
    expiredSalesCount: number;
    totalValue: number;
    totalExpiredSales: number;
    oldestExpired: string | null;
    totalSalesAffected: number;
}

export interface ExpiredSaleCleanupResult {
    success: boolean;
    message: string;
    cleanedUpCount: number;
}

export const expiredSaleCleanupApi = {
    // Get statistics about expired sales
    getExpiredSaleStats: async (): Promise<ExpiredSaleStats> => {
        const response = await api.get('/expired-sales/expired-stats');
        return response.data;
    },

    // Manually trigger cleanup of expired sales (admin only)
    triggerCleanup: async (): Promise<ExpiredSaleCleanupResult> => {
        const response = await api.post('/expired-sales/cleanup-expired');
        return response.data;
    },
};
