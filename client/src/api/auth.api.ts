import api from './api';
import type { LoginRequest, RegisterRequest, User } from '../types/auth.types';

type WrappedData<T> = T | { user: T };

interface ApiResponseData<T> {
    success: boolean;
    message: string;
    data: WrappedData<T>;
}

function unwrap<T>(d: WrappedData<T>): T {
    // If server wraps the payload as { user: T }, return the inner user
    if (d && typeof d === 'object' && 'user' in (d as object)) {
        return (d as { user: T }).user;
    }
    return d as T;
}

export const authApi = {
    login: async (credentials: LoginRequest): Promise<User> => {
        const response = await api.post<ApiResponseData<User>>(
            '/auth/login',
            credentials,
        );
        // Normalize server response which may be either `User` or `{ user: User }`.
        return unwrap(response.data.data);
    },

    register: async (userData: RegisterRequest): Promise<User> => {
        const response = await api.post<ApiResponseData<User>>(
            '/auth/register',
            userData,
        );
        return unwrap(response.data.data);
    },

    logout: async (): Promise<void> => {
        await api.post<ApiResponseData<null>>('/auth/logout');
    },

    getCurrentUser: async (): Promise<User> => {
        const response = await api.get<ApiResponseData<User>>('/auth/me');
        return unwrap(response.data.data);
    },

    refreshToken: async (): Promise<{ success: boolean; user?: User }> => {
        try {
            const response = await api.post<ApiResponseData<{ user: User }>>(
                '/auth/refresh',
            );
            // Normalize the wrapped response and extract the inner user
            const payload = unwrap(response.data.data) as { user: User } | null;
            return {
                success: response.data.success,
                user: payload ? payload.user : undefined,
            };
        } catch (error) {
            // If refresh fails, return false instead of throwing
            console.error('Refresh token failed:', error);
            return { success: false };
        }
    },
};
