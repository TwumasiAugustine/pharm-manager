/**
 * Utility functions for debugging the application
 */

/**
 * Check authentication state
 * Call this from the browser console to see current auth state:
 * import('/src/utils/debugUtils.js').then(m => m.checkAuthState())
 */
export const checkAuthState = (): void => {
    if (process.env.NODE_ENV === 'production') return;
    // In development only: use browser console to inspect items manually
    // Avoid logging sensitive data in shared environments
    // Example usage in dev: import('/src/utils/debugUtils.js').then(m => m.checkAuthState())
};

/**
 * Clear all authentication state
 * Call this from the browser console to clear all auth state:
 * import('/src/utils/debugUtils.js').then(m => m.clearAuthState())
 */
export const clearAuthState = (): void => {
    if (process.env.NODE_ENV === 'production') return;
    sessionStorage.removeItem('hasSession');
    localStorage.removeItem('hasLoggedInBefore');
};
