import { useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

/**
 * Custom hook for managing URL query parameters
 *
 * This hook provides a clean interface for reading and writing URL query parameters,
 * allowing users to see all active filters and queries in the browser address bar.
 *
 * Features:
 * - Read/write URL search parameters
 * - Type-safe parameter handling
 * - Automatic URL updates without page refresh
 * - Support for arrays, objects, and primitive values
 * - History management (replace vs push)
 */
export const useURLParams = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // Parse current URL parameters
    const searchParams = useMemo(() => {
        return new URLSearchParams(location.search);
    }, [location.search]);

    // Get all parameters as an object
    const getAllParams = useCallback((): Record<string, string> => {
        const params: Record<string, string> = {};
        searchParams.forEach((value, key) => {
            params[key] = value;
        });
        return params;
    }, [searchParams]);

    // Get a specific parameter
    const getParam = useCallback(
        (key: string): string | null => {
            return searchParams.get(key);
        },
        [searchParams],
    );

    // Get parameter as array (for multi-value parameters)
    const getParamArray = useCallback(
        (key: string): string[] => {
            return searchParams.getAll(key);
        },
        [searchParams],
    );

    // Get parameter as number
    const getParamNumber = useCallback(
        (key: string): number | null => {
            const value = searchParams.get(key);
            return value ? parseFloat(value) : null;
        },
        [searchParams],
    );

    // Get parameter as boolean
    const getParamBoolean = useCallback(
        (key: string): boolean | null => {
            const value = searchParams.get(key);
            if (value === null) return null;
            return value === 'true' || value === '1';
        },
        [searchParams],
    );

    // Get parameter as parsed JSON object
    const getParamObject = useCallback(
        <T>(key: string): T | null => {
            const value = searchParams.get(key);
            if (!value) return null;
            try {
                return JSON.parse(decodeURIComponent(value)) as T;
            } catch {
                return null;
            }
        },
        [searchParams],
    );

    // Set a single parameter
    const setParam = useCallback(
        (
            key: string,
            value: string | number | boolean | null,
            options: { replace?: boolean; removeIfEmpty?: boolean } = {},
        ) => {
            const { replace = true, removeIfEmpty = true } = options;
            const newSearchParams = new URLSearchParams(searchParams);

            if (value === null || value === '' || value === undefined) {
                if (removeIfEmpty) {
                    newSearchParams.delete(key);
                }
            } else {
                newSearchParams.set(key, String(value));
            }

            navigate(
                {
                    pathname: location.pathname,
                    search: newSearchParams.toString(),
                },
                { replace },
            );
        },
        [searchParams, navigate, location.pathname],
    );

    // Set multiple parameters at once
    const setParams = useCallback(
        (
            params: Record<
                string,
                string | number | boolean | null | undefined
            >,
            options: {
                replace?: boolean;
                removeIfEmpty?: boolean;
                merge?: boolean;
            } = {},
        ) => {
            const {
                replace = true,
                removeIfEmpty = true,
                merge = true,
            } = options;
            const newSearchParams = merge
                ? new URLSearchParams(searchParams)
                : new URLSearchParams();

            Object.entries(params).forEach(([key, value]) => {
                if (value === null || value === '' || value === undefined) {
                    if (removeIfEmpty) {
                        newSearchParams.delete(key);
                    }
                } else {
                    newSearchParams.set(key, String(value));
                }
            });

            navigate(
                {
                    pathname: location.pathname,
                    search: newSearchParams.toString(),
                },
                { replace },
            );
        },
        [searchParams, navigate, location.pathname],
    );

    // Set parameter as array
    const setParamArray = useCallback(
        (
            key: string,
            values: string[],
            options: { replace?: boolean } = {},
        ) => {
            const { replace = true } = options;
            const newSearchParams = new URLSearchParams(searchParams);

            // Remove existing entries for this key
            newSearchParams.delete(key);

            // Add all values
            values.forEach((value) => {
                if (value) {
                    newSearchParams.append(key, value);
                }
            });

            navigate(
                {
                    pathname: location.pathname,
                    search: newSearchParams.toString(),
                },
                { replace },
            );
        },
        [searchParams, navigate, location.pathname],
    );

    // Set parameter as JSON object
    const setParamObject = useCallback(
        (
            key: string,
            value: object | null,
            options: { replace?: boolean } = {},
        ) => {
            const { replace = true } = options;
            const newSearchParams = new URLSearchParams(searchParams);

            if (value === null) {
                newSearchParams.delete(key);
            } else {
                newSearchParams.set(
                    key,
                    encodeURIComponent(JSON.stringify(value)),
                );
            }

            navigate(
                {
                    pathname: location.pathname,
                    search: newSearchParams.toString(),
                },
                { replace },
            );
        },
        [searchParams, navigate, location.pathname],
    );

    // Remove a parameter
    const removeParam = useCallback(
        (key: string, options: { replace?: boolean } = {}) => {
            const { replace = true } = options;
            const newSearchParams = new URLSearchParams(searchParams);
            newSearchParams.delete(key);

            navigate(
                {
                    pathname: location.pathname,
                    search: newSearchParams.toString(),
                },
                { replace },
            );
        },
        [searchParams, navigate, location.pathname],
    );

    // Clear all parameters
    const clearAllParams = useCallback(
        (options: { replace?: boolean } = {}) => {
            const { replace = true } = options;
            navigate(
                {
                    pathname: location.pathname,
                    search: '',
                },
                { replace },
            );
        },
        [navigate, location.pathname],
    );

    // Check if a parameter exists
    const hasParam = useCallback(
        (key: string): boolean => {
            return searchParams.has(key);
        },
        [searchParams],
    );

    // Get current search string
    const searchString = useMemo(() => {
        return location.search;
    }, [location.search]);

    return {
        // Getters
        getAllParams,
        getParam,
        getParamArray,
        getParamNumber,
        getParamBoolean,
        getParamObject,

        // Setters
        setParam,
        setParams,
        setParamArray,
        setParamObject,

        // Utilities
        removeParam,
        clearAllParams,
        hasParam,
        searchString,

        // Raw access
        searchParams: searchParams,
    };
};

/**
 * Hook for managing pagination state in URL
 */
export const usePaginationURL = (defaultPage = 1, defaultLimit = 10) => {
    const { getParamNumber, setParams } = useURLParams();

    const page = getParamNumber('page') ?? defaultPage;
    const limit = getParamNumber('limit') ?? defaultLimit;

    const setPage = useCallback(
        (newPage: number) => {
            setParams({ page: newPage }, { replace: true });
        },
        [setParams],
    );

    const setLimit = useCallback(
        (newLimit: number) => {
            setParams({ limit: newLimit, page: 1 }, { replace: true });
        },
        [setParams],
    );

    const setPagination = useCallback(
        (newPage: number, newLimit: number) => {
            setParams({ page: newPage, limit: newLimit }, { replace: true });
        },
        [setParams],
    );

    return {
        page,
        limit,
        setPage,
        setLimit,
        setPagination,
        offset: (page - 1) * limit,
    };
};

/**
 * Hook for managing search/filter state in URL
 */
export const useFiltersURL = <T extends Record<string, any>>(
    defaultFilters: T,
) => {
    const { getAllParams, setParams, clearAllParams } = useURLParams();

    // Get current filters from URL, merged with defaults
    const filters = useMemo(() => {
        const urlParams = getAllParams();
        const result = { ...defaultFilters };

        // Parse URL parameters into filter object
        Object.keys(defaultFilters).forEach((key) => {
            const urlValue = urlParams[key];
            if (urlValue !== undefined && urlValue !== null) {
                const defaultValue = defaultFilters[key];

                // Type conversion based on default value type
                if (typeof defaultValue === 'number') {
                    const num = parseFloat(urlValue);
                    if (!isNaN(num)) {
                        (result as any)[key] = num;
                    }
                } else if (typeof defaultValue === 'boolean') {
                    (result as any)[key] =
                        urlValue === 'true' || urlValue === '1';
                } else if (Array.isArray(defaultValue)) {
                    try {
                        (result as any)[key] = JSON.parse(
                            decodeURIComponent(urlValue),
                        );
                    } catch {
                        (result as any)[key] = defaultValue;
                    }
                } else if (
                    typeof defaultValue === 'object' &&
                    defaultValue !== null
                ) {
                    try {
                        (result as any)[key] = JSON.parse(
                            decodeURIComponent(urlValue),
                        );
                    } catch {
                        (result as any)[key] = defaultValue;
                    }
                } else {
                    (result as any)[key] = urlValue;
                }
            }
        });

        return result;
    }, [getAllParams, defaultFilters]);

    // Update filters in URL
    const setFilters = useCallback(
        (newFilters: Partial<T>) => {
            const paramsToSet: Record<string, any> = {};

            Object.entries(newFilters).forEach(([key, value]) => {
                if (value === null || value === undefined) {
                    paramsToSet[key] = null; // Will be removed
                } else if (
                    Array.isArray(value) ||
                    (typeof value === 'object' && value !== null)
                ) {
                    paramsToSet[key] = encodeURIComponent(
                        JSON.stringify(value),
                    );
                } else {
                    paramsToSet[key] = value;
                }
            });

            setParams(paramsToSet, { replace: true });
        },
        [setParams],
    );

    // Reset filters to defaults
    const resetFilters = useCallback(() => {
        clearAllParams();
    }, [clearAllParams]);

    return {
        filters,
        setFilters,
        resetFilters,
    };
};

export default useURLParams;
