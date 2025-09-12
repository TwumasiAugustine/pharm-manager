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
        const response = await api.get('/expiry/drugs', { params });
        return response.data;
    },

    // Get expiry statistics
    getExpiryStats: async (branchId?: string): Promise<ExpiryStats> => {
        const params = branchId ? { branchId } : {};
        const response = await api.get('/expiry/stats', { params });
        return response.data.data;
    },

    // Get expiry notifications
    getNotifications: async (params: {
        isRead?: boolean;
        alertLevel?: string;
        page?: number;
        limit?: number;
    }): Promise<ExpiryNotificationsResponse> => {
        const response = await api.get('/expiry/notifications', { params });
        return response.data;
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
