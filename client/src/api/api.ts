import axios, { AxiosError } from 'axios';
import type { AxiosRequestConfig, AxiosResponse } from 'axios';

// Create API base URL based on environment
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
    baseURL,
    headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
    },
    withCredentials: true, // Important for cookies
    timeout: 30000, // Set a default timeout of 30 seconds
});

// --- Robust request interceptor ---
api.interceptors.request.use(
    (config) => {
        // Add CSRF token header for state-changing requests
        const method = config.method?.toUpperCase();
        if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method || '')) {
            // Always read CSRF token fresh from cookies
            const csrfToken = document.cookie
                .split('; ')
                .find((row) => row.startsWith('csrfToken='))
                ?.split('=')[1];
            if (csrfToken) {
                if (!config.headers)
                    config.headers = {} as typeof config.headers;
                (config.headers as Record<string, string>)['X-CSRF-Token'] =
                    csrfToken;
            }
        }

        // All session checks are handled by the server via cookies.
        return config;
    },
    (error) => Promise.reject(error),
);

// --- Robust refresh logic with request queueing (singleton outside interceptor) ---
let isRefreshing = false;
type QueuePromise = {
    resolve: (value?: unknown) => void;
    reject: (reason?: unknown) => void;
};
let failedQueue: QueuePromise[] = [];
const processQueue = (error: unknown, token: unknown = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

api.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error: AxiosError) => {
        // If the error was client-side (request cancellation), just pass it through
        if (error.message?.includes('request canceled client-side')) {
            return Promise.reject(error);
        }

        const originalRequest = error.config as
            | (AxiosRequestConfig & { _retry?: boolean })
            | undefined;

        if (
            error.response?.status === 401 &&
            originalRequest &&
            !originalRequest._retry
        ) {
            originalRequest._retry = true;

            // Don't try to refresh for auth endpoints
            const isAuthEndpoint =
                originalRequest.url === '/auth/refresh' ||
                originalRequest.url === '/auth/login' ||
                originalRequest.url === '/auth/register' ||
                originalRequest.url === '/auth/me';
            if (isAuthEndpoint) {
                return Promise.reject(error);
            }

            if (isRefreshing) {
                return new Promise(function (resolve, reject) {
                    failedQueue.push({ resolve, reject });
                })
                    .then(() => api(originalRequest))
                    .catch((err) => Promise.reject(err));
            }

            isRefreshing = true;
            return new Promise((resolve, reject) => {
                (async () => {
                    try {
                        const refreshSuccess = await import('./auth.api').then(
                            (module) => module.authApi.refreshToken(),
                        );
                        if (refreshSuccess) {
                            processQueue(null);
                            resolve(api(originalRequest));
                        } else {
                            processQueue(error);
                            // Redirect to login if refresh fails
                            if (
                                !window.location.pathname.includes('/login') &&
                                !window.location.pathname.includes('/register')
                            ) {
                                window.location.href = '/login';
                            }
                            reject(error);
                        }
                    } catch (refreshError) {
                        processQueue(refreshError);
                        if (
                            !window.location.pathname.includes('/login') &&
                            !window.location.pathname.includes('/register')
                        ) {
                            window.location.href = '/login';
                        }
                        reject(refreshError);
                    } finally {
                        isRefreshing = false;
                    }
                })();
            });
        }

        // For non-401 errors or errors that couldn't be recovered via refresh
        return Promise.reject(error);
    },
);

// Debug toggling removed for security: no localStorage or sessionStorage usage allowed

export default api;
