import React, { memo, useEffect, useState } from 'react';
import { PageLoadingScreen } from '../atoms/LoadingScreen';
import { useInitialAppLoading } from '../../hooks/useNavigationLoading';

/**
 * NavigationLoader component
 * Only shows loading screen on initial app load, not on subsequent navigation
 * Uses sessionStorage to track if app has been loaded before
 * This component is defensive: it will auto-hide if the document is already
 * loaded or after a safety timeout to avoid permanently blocking the UI.
 */
const NavigationLoader: React.FC = memo(() => {
    const isInitialLoading = useInitialAppLoading();
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        // If the document is already fully loaded, don't show the loader
        if (
            typeof document !== 'undefined' &&
            document.readyState === 'complete'
        ) {
            setVisible(false);
            return;
        }

        if (isInitialLoading) {
            setVisible(true);
            // Safety timeout to ensure loader hides even if something blocks the
            // normal hide path (8s to match other safety timeouts)
            const safety = window.setTimeout(() => {
                setVisible(false);
            }, 8000);

            return () => {
                clearTimeout(safety);
            };
        }

        setVisible(false);
    }, [isInitialLoading]);

    // Early return to minimize DOM impact
    if (!visible) return null;

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
