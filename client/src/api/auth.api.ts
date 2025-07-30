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
            // Skip refresh attempt if there's no session indicator
            if (
                !document.cookie.includes('session') &&
                sessionStorage.getItem('hasSession') !== 'true'
            ) {
                console.log('Skipping token refresh - no session detected');
                return false;
            }

            const response = await api.get<ApiResponseData<null>>(
                '/auth/refresh',
            );
            return response.data.success;
        } catch (error) {
            // If refresh fails, return false instead of throwing
            console.error('Refresh token failed:', error);
            // Clear session indicator on refresh failure
            sessionStorage.removeItem('hasSession');
            return false;
        }
    },
};
