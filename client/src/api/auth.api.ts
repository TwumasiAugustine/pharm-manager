import api from './api';
import type { LoginRequest, RegisterRequest, User } from '../types/auth.types';

interface ApiResponseData<T> {
    success: boolean;
    message: string;
    data: T;
}

export const authApi = {
    login: async (credentials: LoginRequest): Promise<User> => {
        const response = await api.post<ApiResponseData<User>>(
            '/auth/login',
            credentials,
        );
        return response.data.data;
    },

    register: async (userData: RegisterRequest): Promise<User> => {
        const response = await api.post<ApiResponseData<User>>(
            '/auth/register',
            userData,
        );
        return response.data.data;
    },

    logout: async (): Promise<void> => {
        await api.post<ApiResponseData<null>>('/auth/logout');
    },

    getCurrentUser: async (): Promise<User> => {
        const response = await api.get<ApiResponseData<User>>('/auth/me');
        return response.data.data;
    },

    refreshToken: async (): Promise<boolean> => {
        try {
            const response = await api.get<ApiResponseData<null>>(
                '/auth/refresh',
            );
            return response.data.success;
        } catch (error) {
            // If refresh fails, return false instead of throwing
            console.error('Refresh token failed:', error);
            return false;
        }
    },
};
