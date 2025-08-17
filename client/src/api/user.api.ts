import api from './api';

export const userApi = {
    // Assign permissions to a user (admin only)
    assignPermissions: async (userId: string, permissions: string[]) => {
        const response = await api.post('/users/assign-permissions', {
            userId,
            permissions,
        });
        return response.data;
    },
};
