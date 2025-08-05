/**
 * Ghana Cedis Currency Utilities
 * Provides formatting functions for displaying currency amounts in Ghana Cedis (GHS)
 */

export const GHS_SYMBOL = '₵';
export const CURRENCY_CODE = 'GHS';

/**
 * Format amount as Ghana Cedis with full currency formatting
 * Example: formatGHSCurrency(1234.56) -> "₵1,234.56"
 */
export const formatGHSCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-GH', {
        style: 'currency',
        currency: 'GHS',
        currencyDisplay: 'symbol',
    }).format(amount);
};

/**
 * Format amount as Ghana Cedis for display with symbol
 * Example: formatGHSDisplayAmount(1234.56) -> "₵1,234.56"
 */
export const formatGHSDisplayAmount = (amount: number): string => {
    return `${GHS_SYMBOL}${new Intl.NumberFormat('en-GH', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount)}`;
};

/**
 * Format amount as Ghana Cedis for whole numbers
 * Example: formatGHSWholeAmount(1234) -> "₵1,234"
 */
export const formatGHSWholeAmount = (amount: number): string => {
    return `${GHS_SYMBOL}${new Intl.NumberFormat('en-GH', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount)}`;
};

/**
 * Format amount as simple number string for Ghana Cedis
 * Example: formatGHSAmount(1234.56) -> "1,234.56"
 */
export const formatGHSAmount = (amount: number): string => {
    return new Intl.NumberFormat('en-GH', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
};

/**
 * Parse currency string to number
 * Example: parseGHSAmount("₵1,234.56") -> 1234.56
 */
export const parseGHSAmount = (currencyString: string): number => {
    const numericString = currencyString
        .replace(GHS_SYMBOL, '')
        .replace(/,/g, '')
        .trim();
    return parseFloat(numericString) || 0;
};

/**
 * Validate if amount is a valid currency value
 */
export const isValidCurrencyAmount = (amount: number): boolean => {
    return !isNaN(amount) && isFinite(amount) && amount >= 0;
};

/**
 * Format large numbers with K/M suffixes for display (numbers > 5 digits)
 * Example: formatCompactNumber(123456) -> "123.5K"
 * Example: formatCompactNumber(1234567) -> "1.2M"
 * Example: formatCompactNumber(12345) -> "12,345" (no formatting, less than 5 digits)
 */
export const formatCompactNumber = (amount: number): string => {
    const absAmount = Math.abs(amount);
    const sign = amount < 0 ? '-' : '';

    // If number has 5 digits or less, format normally
    if (absAmount < 100000) {
        return `${sign}${new Intl.NumberFormat('en-GH').format(absAmount)}`;
    }

    // Format millions (7+ digits)
    if (absAmount >= 1000000) {
        const millions = absAmount / 1000000;
        return `${sign}${millions.toFixed(1)}M`;
    }

    // Format thousands (6+ digits)
    if (absAmount >= 100000) {
        const thousands = absAmount / 1000;
        return `${sign}${thousands.toFixed(1)}K`;
    }

    return `${sign}${new Intl.NumberFormat('en-GH').format(absAmount)}`;
};

/**
 * Format currency amounts with K/M suffixes for display
 * Example: formatCompactCurrency(123456) -> "₵123.5K"
 * Example: formatCompactCurrency(1234567) -> "₵1.2M"
 * Example: formatCompactCurrency(12345) -> "₵12,345"
 */
export const formatCompactCurrency = (amount: number): string => {
    return `${GHS_SYMBOL}${formatCompactNumber(amount).replace(/^-/, '')}${
        amount < 0 ? '' : ''
    }`;
};
