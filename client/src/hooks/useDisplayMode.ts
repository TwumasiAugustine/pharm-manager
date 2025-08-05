import { useContext } from 'react';
import { DisplayContext } from '../context/DisplayContext';
import {
    formatGHSDisplayAmount,
    formatCompactNumber,
    formatCompactCurrency,
} from '../utils/currency';

export const useDisplayMode = () => {
    const context = useContext(DisplayContext);
    if (context === undefined) {
        throw new Error('useDisplayMode must be used within a DisplayProvider');
    }
    return context;
};

// Hook to get the appropriate formatter based on display mode
export const useNumberFormatter = () => {
    const { isExportMode } = useDisplayMode();

    return {
        formatNumber: (amount: number) => {
            if (isExportMode) {
                // Full number for exports
                return new Intl.NumberFormat('en-GH', {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 2,
                }).format(amount);
            } else {
                // Compact format for display
                return formatCompactNumber(amount);
            }
        },
        formatCurrency: (amount: number) => {
            if (isExportMode) {
                // Full currency for exports
                return formatGHSDisplayAmount(amount);
            } else {
                // Compact currency for display
                return formatCompactCurrency(amount);
            }
        },
    };
};
