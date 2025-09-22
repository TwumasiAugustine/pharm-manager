import React, { memo } from 'react';
import { PageLoadingScreen } from '../atoms/LoadingScreen';
import { useInitialAppLoading } from '../../hooks/useNavigationLoading';

/**
 * NavigationLoader component
 * Only shows loading screen on initial app load, not on subsequent navigation
 * Uses sessionStorage to track if app has been loaded before
 */
const NavigationLoader: React.FC = memo(() => {
    const isInitialLoading = useInitialAppLoading();

    // Early return to minimize DOM impact
    if (!isInitialLoading) {
        return null;
    }

    return (
        <div
            className="fixed inset-0 z-[9999] bg-white"
            style={{
                // Use transform for better performance
                transform: 'translateZ(0)',
                willChange: 'opacity',
            }}
        >
            <PageLoadingScreen />
        </div>
    );
});

NavigationLoader.displayName = 'NavigationLoader';

export default NavigationLoader;
