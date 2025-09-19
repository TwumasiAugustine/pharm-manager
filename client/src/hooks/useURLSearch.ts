import { useCallback } from 'react';
import { useURLParams } from './useURLParams';
import { useDebounceFunction } from './useDebounceFunction';

interface UseURLSearchOptions {
    paramName?: string;
    debounceMs?: number;
    minLength?: number;
    onSearchChange?: (query: string) => void;
}

/**
 * Hook for managing search queries in URL parameters
 *
 * This hook synchronizes search input with URL parameters, allowing users to:
 * - See search queries in the browser address bar
 * - Bookmark searches
 * - Share search URLs
 * - Navigate back/forward through search history
 */
export const useURLSearch = (options: UseURLSearchOptions = {}) => {
    const {
        paramName = 'search',
        debounceMs = 500,
        minLength = 0,
        onSearchChange,
    } = options;

    const { getParam, setParam, removeParam } = useURLParams();

    // Get current search query from URL
    const searchQuery = getParam(paramName) || '';

    // Debounced function to update URL
    const debouncedSetURL = useDebounceFunction((query: string) => {
        if (query.length >= minLength && query.trim()) {
            setParam(paramName, query.trim(), { replace: true });
        } else {
            removeParam(paramName, { replace: true });
        }
    }, debounceMs);

    // Function to update search query
    const setSearchQuery = useCallback(
        (query: string) => {
            debouncedSetURL(query);
            onSearchChange?.(query);
        },
        [debouncedSetURL, onSearchChange],
    );

    // Clear search query
    const clearSearch = useCallback(() => {
        removeParam(paramName, { replace: true });
        onSearchChange?.('');
    }, [removeParam, paramName, onSearchChange]);

    return {
        searchQuery,
        setSearchQuery,
        clearSearch,
        hasSearch: searchQuery.length > 0,
    };
};

/**
 * Hook for managing multiple search/filter parameters in URL
 */
export const useURLFilters = <T extends Record<string, unknown>>(
    defaultFilters: T,
    options: {
        debounceMs?: number;
        onFiltersChange?: (filters: T) => void;
    } = {},
) => {
    const { debounceMs = 500, onFiltersChange } = options;
    const { getAllParams, setParams, clearAllParams } = useURLParams();

    // Parse current filters from URL
    const parseFiltersFromURL = useCallback((): T => {
        const urlParams = getAllParams();
        const result = { ...defaultFilters };

        Object.keys(defaultFilters).forEach((key) => {
            const urlValue = urlParams[key];
            if (
                urlValue !== undefined &&
                urlValue !== null &&
                urlValue !== ''
            ) {
                const defaultValue = defaultFilters[key];

                try {
                    // Type conversion based on default value type
                    if (typeof defaultValue === 'number') {
                        const num = parseFloat(urlValue);
                        if (!isNaN(num)) {
                            (result as Record<string, unknown>)[key] = num;
                        }
                    } else if (typeof defaultValue === 'boolean') {
                        (result as Record<string, unknown>)[key] =
                            urlValue === 'true' || urlValue === '1';
                    } else if (Array.isArray(defaultValue)) {
                        // Handle comma-separated values for arrays
                        if (urlValue.startsWith('[')) {
                            (result as Record<string, unknown>)[key] =
                                JSON.parse(decodeURIComponent(urlValue));
                        } else {
                            (result as Record<string, unknown>)[key] = urlValue
                                .split(',')
                                .filter(Boolean);
                        }
                    } else if (
                        typeof defaultValue === 'object' &&
                        defaultValue !== null
                    ) {
                        (result as Record<string, unknown>)[key] = JSON.parse(
                            decodeURIComponent(urlValue),
                        );
                    } else {
                        (result as Record<string, unknown>)[key] = urlValue;
                    }
                } catch (error) {
                    console.warn(
                        `Failed to parse URL parameter "${key}":`,
                        error,
                    );
                    // Keep default value on parse error
                }
            }
        });

        return result;
    }, [getAllParams, defaultFilters]);

    const currentFilters = parseFiltersFromURL();

    // Debounced function to update URL with filters
    const debouncedSetFilters = useDebounceFunction((filters: Partial<T>) => {
        const paramsToSet: Record<string, string | null> = {};

        Object.entries(filters).forEach(([key, value]) => {
            const defaultValue = defaultFilters[key as keyof T];

            // Only add to URL if different from default
            if (
                value === null ||
                value === undefined ||
                value === defaultValue
            ) {
                paramsToSet[key] = null; // Will be removed
            } else if (Array.isArray(value)) {
                if (value.length === 0) {
                    paramsToSet[key] = null;
                } else {
                    // Use comma-separated for simple arrays, JSON for complex
                    const isSimpleArray = value.every(
                        (v) => typeof v === 'string' || typeof v === 'number',
                    );
                    paramsToSet[key] = isSimpleArray
                        ? value.join(',')
                        : encodeURIComponent(JSON.stringify(value));
                }
            } else if (typeof value === 'object' && value !== null) {
                paramsToSet[key] = encodeURIComponent(JSON.stringify(value));
            } else {
                paramsToSet[key] = value;
            }
        });

        setParams(paramsToSet, { replace: true });
        onFiltersChange?.(currentFilters);
    }, debounceMs);

    // Update specific filter
    const setFilter = useCallback(
        <K extends keyof T>(key: K, value: T[K]) => {
            debouncedSetFilters({ [key]: value } as unknown as Partial<T>);
        },
        [debouncedSetFilters],
    );

    // Update multiple filters
    const setFilters = useCallback(
        (filters: Partial<T>) => {
            debouncedSetFilters(filters);
        },
        [debouncedSetFilters],
    );

    // Reset all filters
    const resetFilters = useCallback(() => {
        clearAllParams({ replace: true });
        onFiltersChange?.(defaultFilters);
    }, [clearAllParams, defaultFilters, onFiltersChange]);

    // Reset specific filter to default
    const resetFilter = useCallback(
        <K extends keyof T>(key: K) => {
            setFilter(key, defaultFilters[key]);
        },
        [setFilter, defaultFilters],
    );

    return {
        filters: currentFilters,
        setFilter,
        setFilters,
        resetFilter,
        resetFilters,
        hasActiveFilters: Object.keys(currentFilters).some(
            (key) => currentFilters[key] !== defaultFilters[key as keyof T],
        ),
    };
};

/**
 * Hook for managing sorting state in URL
 */
export const useURLSorting = (
    defaultSort: { field: string; direction: 'asc' | 'desc' } = {
        field: 'createdAt',
        direction: 'desc',
    },
) => {
    const { getParam, setParams } = useURLParams();

    const sortField = getParam('sortBy') || defaultSort.field;
    const sortDirection =
        (getParam('sortDir') as 'asc' | 'desc') || defaultSort.direction;

    const setSorting = useCallback(
        (field: string, direction: 'asc' | 'desc') => {
            setParams(
                {
                    sortBy: field === defaultSort.field ? null : field,
                    sortDir:
                        direction === defaultSort.direction ? null : direction,
                },
                { replace: true },
            );
        },
        [setParams, defaultSort],
    );

    const toggleSort = useCallback(
        (field: string) => {
            if (sortField === field) {
                // Toggle direction
                const newDirection = sortDirection === 'asc' ? 'desc' : 'asc';
                setSorting(field, newDirection);
            } else {
                // New field, use default direction
                setSorting(field, 'asc');
            }
        },
        [sortField, sortDirection, setSorting],
    );

    return {
        sortField,
        sortDirection,
        setSorting,
        toggleSort,
        sortQuery: `${sortField}:${sortDirection}`,
    };
};

export { useURLParams } from './useURLParams';
export { usePaginationURL } from './useURLParams';
