import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

export const useURLParams = () => {
    const [searchParams, setSearchParams] = useSearchParams();

    const getAllParams = useCallback((): Record<string, string> => {
        const params: Record<string, string> = {};
        for (const [key, value] of searchParams.entries()) {
            params[key] = value;
        }
        return params;
    }, [searchParams]);

    const getParam = useCallback(
        (key: string): string | null => {
            return searchParams.get(key);
        },
        [searchParams],
    );

    const setParam = useCallback(
        (
            key: string,
            value: string | number | boolean | null,
            options: { replace?: boolean } = {},
        ) => {
            const { replace = true } = options;

            setSearchParams(
                (prev) => {
                    const newSearchParams = new URLSearchParams(prev);

                    if (value === null || value === undefined) {
                        newSearchParams.delete(key);
                    } else {
                        newSearchParams.set(key, String(value));
                    }

                    return newSearchParams;
                },
                { replace },
            );
        },
        [setSearchParams],
    );

    const setParams = useCallback(
        (
            params: Record<string, string | number | boolean | null>,
            options: { replace?: boolean; merge?: boolean } = {},
        ) => {
            const { replace = true, merge = true } = options;

            setSearchParams(
                (prev) => {
                    const newSearchParams = merge
                        ? new URLSearchParams(prev)
                        : new URLSearchParams();

                    Object.entries(params).forEach(([key, value]) => {
                        if (value === null || value === undefined) {
                            newSearchParams.delete(key);
                        } else {
                            newSearchParams.set(key, String(value));
                        }
                    });

                    return newSearchParams;
                },
                { replace },
            );
        },
        [setSearchParams],
    );

    const removeParam = useCallback(
        (key: string, options: { replace?: boolean } = {}) => {
            const { replace = true } = options;

            setSearchParams(
                (prev) => {
                    const newSearchParams = new URLSearchParams(prev);
                    newSearchParams.delete(key);
                    return newSearchParams;
                },
                { replace },
            );
        },
        [setSearchParams],
    );

    const clearAllParams = useCallback(
        (options: { replace?: boolean } = {}) => {
            const { replace = true } = options;
            setSearchParams(new URLSearchParams(), { replace });
        },
        [setSearchParams],
    );

    return {
        getAllParams,
        getParam,
        setParam,
        setParams,
        removeParam,
        clearAllParams,
        searchParams,
    };
};

export const usePaginationURL = (defaultPage = 1, defaultLimit = 10) => {
    const { getParam, setParams } = useURLParams();

    const getParamNumber = (key: string): number | null => {
        const value = getParam(key);
        if (!value) return null;
        const num = parseFloat(value);
        return isNaN(num) ? null : num;
    };

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

export default useURLParams;
