// Type guard for API user response
function isUserResponse(obj: unknown): obj is { user: User } {
    return (
        typeof obj === 'object' &&
        obj !== null &&
        'user' in obj &&
        typeof (obj as { user?: unknown }).user === 'object'
    );
}
import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authApi } from '../api/auth.api';
import type { LoginRequest, RegisterRequest, User } from '../types/auth.types';
import { useAuthStore } from '../store/auth.store';
import { useNavigate } from 'react-router-dom';
import { useSafeNotify } from '../utils/useSafeNotify';
import { pharmacyApi } from '../api/pharmacy.api';
import { UserRole } from '../types/auth.types';

export const useLogin = () => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const { setUser, setIsAuthenticated, setPharmacyConfigured } =
        useAuthStore();
    const notify = useSafeNotify();

    return useMutation({
        mutationFn: async (credentials: LoginRequest) => {
            // First, login the user
            const responseUser = await authApi.login(credentials);
            const user = isUserResponse(responseUser)
                ? responseUser.user
                : responseUser;

            // If user is admin level, check pharmacy configuration status
            if (
                user.role === UserRole.ADMIN ||
                user.role === UserRole.SUPER_ADMIN
            ) {
                try {
                    const isConfigured = await pharmacyApi.checkConfigStatus();
                    setPharmacyConfigured(isConfigured);
                    return { user, isPharmacyConfigured: isConfigured };
                } catch (error) {
                    if (error instanceof Error) {
                        console.error('Error:', error.message);
                    } else {
                        console.error('Error:', error);
                    }
                    setPharmacyConfigured(false);
                    return { user, isPharmacyConfigured: false };
                }
            }

            // Non-admin users don't need to set up pharmacy
            setPharmacyConfigured(true);
            return { user, isPharmacyConfigured: true };
        },
        onSuccess: (data) => {
            setUser(data.user);
            setIsAuthenticated(true);
            queryClient.setQueryData(['currentUser'], data.user);

            // If admin level and pharmacy not configured, redirect to setup
            if (
                (data.user.role === UserRole.ADMIN ||
                    data.user.role === UserRole.SUPER_ADMIN) &&
                !data.isPharmacyConfigured
            ) {
                navigate('/pharmacy-setup');
                notify.success(
                    'Please set up your pharmacy information to get started',
                );
            } else {
                navigate('/dashboard');
                notify.success('Logged in successfully');
            }
        },
        onError: (error: Error) => {
            notify.error(error.message || 'Failed to login. Please try again.');
        },
    });
};

export const useRegister = () => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const { setUser, setIsAuthenticated } = useAuthStore();
    const notify = useSafeNotify();

    return useMutation({
        mutationFn: (userData: RegisterRequest) => authApi.register(userData),
        onSuccess: (responseUser) => {
            const user = isUserResponse(responseUser)
                ? responseUser.user
                : responseUser;
            setUser(user);
            setIsAuthenticated(true);
            queryClient.setQueryData(['currentUser'], user);
            navigate('/dashboard');
            notify.success('Account created successfully');
        },
        onError: (error: Error) => {
            notify.error(
                error.message || 'Registration failed. Please try again.',
            );
        },
    });
};

export const useLogout = () => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const { clearAuth } = useAuthStore();
    const notify = useSafeNotify();

    return useMutation({
        mutationFn: () => authApi.logout(),
        onSuccess: () => {
            clearAuth();
            queryClient.clear();
            navigate('/login');
            notify.success('Logged out successfully');
        },
        onError: () => {
            notify.error('Failed to logout. Please try again.');
        },
    });
};

export const useCurrentUser = () => {
    const { setUser, setIsAuthenticated, setIsLoading } = useAuthStore();

    const query = useQuery<User, Error>({
        queryKey: ['currentUser'],
        queryFn: () => authApi.getCurrentUser(),
        retry: false,
        staleTime: 5 * 60 * 1000, // 5 minutes
        refetchOnWindowFocus: false, // Prevent excessive refetching
        refetchOnMount: true, // Always refetch on mount to sync session
    });

    useEffect(() => {
        if (query.isSuccess && query.data) {
            const user = isUserResponse(query.data)
                ? query.data.user
                : query.data;
            setUser(user);
            setIsAuthenticated(true);
            setIsLoading(false);
        } else if (query.isError) {
            setUser(null);
            setIsAuthenticated(false);
            setIsLoading(false);
        }
    }, [
        query.isSuccess,
        query.isError,
        query.data,
        setUser,
        setIsAuthenticated,
        setIsLoading,
    ]);

    return query;
};
