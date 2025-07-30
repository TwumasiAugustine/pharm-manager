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

// Request interceptor
api.interceptors.request.use(
    (config) => {
        // Public endpoints that don't require authentication
        const publicEndpoints = [
            '/auth/login',
            '/auth/register',
            '/auth/signup', // Added for backward compatibility
            '/auth/refresh',
            '/auth/me', // Added /me endpoint
            '/health', // Added health check endpoint
        ];

        // Add optional debug logging
        const debugMode = localStorage.getItem('apiDebug') === 'true';
        if (debugMode) {
            console.log(`API Request to: ${config.url}`);
        }

        // Check if this is a public endpoint
        const isPublicEndpoint = publicEndpoints.some((endpoint) =>
            config.url?.includes(endpoint),
        );

        // If it's not a public endpoint, check for authentication
        if (!isPublicEndpoint) {
            // Check if we have any reason to believe we're authenticated
            const hasAuthIndicators =
                document.cookie.includes('session') ||
                sessionStorage.getItem('hasSession') === 'true';

            // Check if we're on an auth-protected route in the app

            // If we know we're not authenticated, cancel the request
            if (!hasAuthIndicators) {
                // Create a new error with a specific message
                const error = new Error(
                    'Authentication required - request canceled client-side',
                );
                console.warn(
                    `🛑 Canceled request to ${config.url} - no auth indicators detected`,
                );

                // Return a rejected promise to cancel the request
                return Promise.reject(error);
            }
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    },
);

// Response interceptor
api.interceptors.response.use(
    (response: AxiosResponse) => {
        return response;
    },
    async (error: AxiosError) => {
        // Add optional debug logging
        const debugMode = localStorage.getItem('apiDebug') === 'true';
        if (debugMode) {
            console.log(`API Error:`, error);
        }

        // If the error was client-side (request cancellation), just pass it through
        if (error.message?.includes('request canceled client-side')) {
            return Promise.reject(error);
        }

        const originalRequest = error.config as
            | (AxiosRequestConfig & {
                  _retry?: boolean;
              })
            | undefined;

        // Handle session expiration
        if (
            error.response?.status === 401 &&
            originalRequest &&
            !originalRequest._retry
        ) {
            originalRequest._retry = true;

            // Check if we're already trying to refresh the token or if it's an auth endpoint
            // This prevents infinite refresh loops
            const isAuthEndpoint =
                originalRequest.url === '/auth/refresh' ||
                originalRequest.url === '/auth/login' ||
                originalRequest.url === '/auth/register' ||
                originalRequest.url === '/auth/me';

            // Don't try to refresh for auth endpoints
            if (isAuthEndpoint) {
                // Clear session indicators to prevent future retries
                sessionStorage.removeItem('hasSession');
                console.warn(
                    'Auth endpoint returned 401, clearing session indicator',
                );
                return Promise.reject(error);
            }

            // Check if we might have a session
            const mightHaveSession =
                document.cookie.includes('session') ||
                sessionStorage.getItem('hasSession') === 'true';

            if (!mightHaveSession) {
                // Don't even try to refresh if we know we don't have a session
                console.warn(
                    'No session indicators found, skipping token refresh',
                );
                sessionStorage.removeItem('hasSession'); // Ensure it's cleared
                return Promise.reject(error);
            }

            try {
                console.log('Attempting to refresh authentication token...');
                // Try to refresh token
                const refreshSuccess = await import('./auth.api').then(
                    (module) => module.authApi.refreshToken(),
                );

                // Only retry if refresh was successful
                if (refreshSuccess) {
                    console.log(
                        'Token refresh successful, retrying original request',
                    );
                    sessionStorage.setItem('hasSession', 'true');
                    return api(originalRequest);
                } else {
                    // If refresh fails, clear session indicator
                    console.warn(
                        'Token refresh failed, clearing session indicators',
                    );
                    sessionStorage.removeItem('hasSession');
                    localStorage.removeItem('hasSession');

                    // If we're on a protected route, redirect to login
                    if (
                        !window.location.pathname.includes('/login') &&
                        !window.location.pathname.includes('/register')
                    ) {
                        console.log(
                            'Redirecting to login page after failed token refresh',
                        );
                        window.location.href = '/login';
                    }
                    return Promise.reject(error);
                }
            } catch (refreshError: any) {
                // If refresh fails, clear session indicator
                console.error('Token refresh error:', refreshError);
                sessionStorage.removeItem('hasSession');
                localStorage.removeItem('hasSession');

                // If we're on a protected route, redirect to login
                if (
                    !window.location.pathname.includes('/login') &&
                    !window.location.pathname.includes('/register')
                ) {
                    console.log(
                        'Redirecting to login page after refresh error',
                    );
                    window.location.href = '/login';
                }
                return Promise.reject(refreshError);
            }
        }

        // For non-401 errors or errors that couldn't be recovered via refresh
        return Promise.reject(error);
    },
);

// Utility function to toggle API debugging
export const toggleApiDebug = (enabled: boolean): void => {
    if (enabled) {
        localStorage.setItem('apiDebug', 'true');
        console.log('API debugging enabled');
    } else {
        localStorage.removeItem('apiDebug');
        console.log('API debugging disabled');
    }
};

export default api;
