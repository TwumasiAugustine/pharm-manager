import api from './api';
import type {
    ExpiryStats,
    ExpiryNotification,
    ExpiryFilters,
    ExpiryDrugsResponse,
    ExpiryNotificationsResponse,
    DrugExpiryCheck,
} from '../types/expiry.types';

export const expiryApi = {
    // Get drugs expiring within specified days
    getExpiringDrugs: async (
        params: ExpiryFilters & { page?: number; limit?: number },
    ): Promise<ExpiryDrugsResponse> => {
        try {
            const response = await api.get('/expiry/drugs', { params });
            // Ensure we always return the expected structure
            return response.data && response.data.data
                ? response.data
                : {
                      data: [],
                      pagination: {
                          total: 0,
                          page: 1,
                          limit: 20,
                          totalPages: 0,
                      },
                  };
        } catch (error) {
            console.error('Error fetching expiring drugs:', error);
            // Return empty structure on error
            return {
                data: [],
                pagination: { total: 0, page: 1, limit: 20, totalPages: 0 },
            };
        }
    },

    // Get expiry statistics
    getExpiryStats: async (): Promise<ExpiryStats> => {
        const response = await api.get('/expiry/stats');
        return response.data.data;
    },

    // Get expiry notifications
    getNotifications: async (params: {
        isRead?: boolean;
        alertLevel?: string;
        page?: number;
        limit?: number;
    }): Promise<ExpiryNotificationsResponse> => {
        try {
            const response = await api.get('/expiry/notifications', { params });
            // Ensure we always return the expected structure
            return response.data && response.data.data
                ? response.data
                : {
                      data: [],
                      pagination: {
                          total: 0,
                          page: 1,
                          limit: 20,
                          totalPages: 0,
                      },
                  };
        } catch (error) {
            console.error('Error fetching expiry notifications:', error);
            // Return empty structure on error
            return {
                data: [],
                pagination: { total: 0, page: 1, limit: 20, totalPages: 0 },
            };
        }
    },

    // Mark notification as read
    markNotificationAsRead: async (
        notificationId: string,
    ): Promise<ExpiryNotification> => {
        const response = await api.put(
            `/expiry/notifications/${notificationId}/read`,
        );
        return response.data.data;
    },

    // Mark all notifications as read
    markAllNotificationsAsRead: async (): Promise<void> => {
        await api.put('/expiry/notifications/read-all');
    },

    // Create/refresh expiry notifications
    createExpiryNotifications: async (): Promise<void> => {
        await api.post('/expiry/notifications/create');
    },

    // Check if drug can be sold (not expired)
    checkDrugExpiry: async (drugId: string): Promise<DrugExpiryCheck> => {
        const response = await api.get(`/expiry/drugs/${drugId}/check`);
        return response.data.data;
    },
};
