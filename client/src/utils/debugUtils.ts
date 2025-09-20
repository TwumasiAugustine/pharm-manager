/**
 * Utility functions for debugging the application
 */

/**
 * Check authentication state
 * Call this from the browser console to see current auth state:
 * import('/src/utils/debugUtils.js').then(m => m.checkAuthState())
 */
export const checkAuthState = (): void => {
    console.log('🔐 Authentication State:');
    console.log(
        `Cookie session exists: ${document.cookie.includes('session')}`,
    );
    console.log(`Session storage: ${sessionStorage.getItem('hasSession')}`);
    console.log(
        `Local storage logged in before: ${localStorage.getItem(
            'hasLoggedInBefore',
        )}`,
    );
};

/**
 * Clear all authentication state
 * Call this from the browser console to clear all auth state:
 * import('/src/utils/debugUtils.js').then(m => m.clearAuthState())
 */
export const clearAuthState = (): void => {
    sessionStorage.removeItem('hasSession');
    localStorage.removeItem('hasLoggedInBefore');
    console.log('🧹 All authentication state cleared');
    console.log('You will need to log in again');
};
