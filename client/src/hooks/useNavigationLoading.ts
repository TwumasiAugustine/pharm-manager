import { useEffect, useState, useRef } from 'react';
import {
    LOADING_CONFIG,
    hasAppLoadedBefore,
    markAppAsLoaded,
} from '../config/loading.config';

/**
 * Hook to manage initial app loading state
 * Only shows loading on first app load, not on subsequent navigation
 */
export const useInitialAppLoading = () => {
    const [isInitialLoading, setIsInitialLoading] = useState(false);
    const hasCheckedLoading = useRef(false);

    // Safety max timeout to ensure loader doesn't hang indefinitely
    const safetyTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        // Only check once when component mounts
        if (!hasCheckedLoading.current) {
            hasCheckedLoading.current = true;

            if (LOADING_CONFIG.SHOW_INITIAL_LOAD_ONLY) {
                // Check if app has been loaded before
                try {
                    if (!hasAppLoadedBefore()) {
                        setIsInitialLoading(true);

                        // Mark app as loaded after a short delay
                        const timer = setTimeout(() => {
                            try {
                                markAppAsLoaded();
                            } catch (e) {
                                // Ignore storage errors
                                console.error(e);
                            }
                            setIsInitialLoading(false);
                        }, 2000); // Show for 2 seconds on initial load

                        // Safety fallback: ensure we clear loading after 8s
                        safetyTimeoutRef.current = setTimeout(() => {
                            setIsInitialLoading(false);
                        }, 8000);

                        return () => {
                            clearTimeout(timer);
                            if (safetyTimeoutRef.current)
                                clearTimeout(safetyTimeoutRef.current);
                        };
                    }
                } catch (e) {
                    // If storage check throws, avoid blocking the app
                    console.warn('Error checking initial load state:', e);
                    setIsInitialLoading(false);
                }
            }
        }
    }, []);

    return isInitialLoading;
};

/**
 * Optimized hook for showing data loading screens during API calls
 * Only shows for significant loading operations
 */
export const useDataLoading = (
    isLoading: boolean,
    showLoadingScreen = false,
) => {
    const [showDataLoadingScreen, setShowDataLoadingScreen] = useState(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (showLoadingScreen && isLoading) {
            // Only show loading screen if operation takes longer than configured delay
            if (LOADING_CONFIG.PREVENT_LOADING_FLASH) {
                timeoutRef.current = setTimeout(() => {
                    setShowDataLoadingScreen(true);
                }, LOADING_CONFIG.DATA_DELAY);
            } else {
                setShowDataLoadingScreen(true);
            }
        } else {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            setShowDataLoadingScreen(false);
        }

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [isLoading, showLoadingScreen]);

    return showDataLoadingScreen;
};
