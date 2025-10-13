import api from './api';
import type {
    ExpiredSaleStats,
    ExpiredSaleCleanupResult,
} from '../types/expired-sale-cleanup.types';

export const expiredSaleCleanupApi = {
    // Get statistics about expired sales
    getExpiredSaleStats: async (): Promise<ExpiredSaleStats> => {
        const response = await api.get('/expired-sales/expired-stats');
        // Extract data from the server's response wrapper
        return response.data.data || response.data;
    },

    // Manually trigger cleanup of expired sales (admin only)
    triggerCleanup: async (): Promise<ExpiredSaleCleanupResult> => {
        const response = await api.post('/expired-sales/cleanup-expired');
        // Extract data from the server's response wrapper
        return response.data.data || response.data;
    },
};
