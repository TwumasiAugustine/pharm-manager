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
