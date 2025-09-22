/**
 * Loading Screen Configuration
 * Centralized configuration for all loading behaviors
 */

export const LOADING_CONFIG = {
    // Performance settings
    SHOW_INITIAL_LOAD_ONLY: true, // Only show loading on first app load, not on navigation
    USE_MINIMAL_LOADING: true, // Use lightweight loading for better performance

    // Data loading delays (for API calls)
    DATA_DELAY: 300, // Only show loading if data fetch takes longer than this

    // UX settings
    PREVENT_LOADING_FLASH: true, // Prevent quick loading flashes

    // Routes that should always show data loading (heavy data routes)
    HEAVY_DATA_ROUTES: [
        '/reports',
        '/audit-logs',
        '/user-activity',
    ] as string[],
};

/**
 * Check if route should always show data loading
 */
export const shouldForceDataLoading = (pathname: string): boolean => {
    return LOADING_CONFIG.HEAVY_DATA_ROUTES.includes(pathname);
};

/**
 * Check if app has been loaded before (for preventing repeated loading screens)
 */
export const hasAppLoadedBefore = (): boolean => {
    return sessionStorage.getItem('pharm-care-app-loaded') === 'true';
};

/**
 * Mark app as loaded (to prevent showing loading screen again)
 */
export const markAppAsLoaded = (): void => {
    sessionStorage.setItem('pharm-care-app-loaded', 'true');
};
