// Type definition for the pagination control object
export interface PaginationControls {
    page: number;
    setPage: (page: number) => void;
    limit: number;
    setLimit: (limit: number) => void;
    totalPages: number;
}

// Type definition for the enhanced useQuery result with pagination
export interface QueryResultWithPagination<TData, TError> {
    data?: TData;
    isLoading: boolean;
    isError: boolean;
    error: TError | null;
    refetch: () => Promise<any>;
    pagination: PaginationControls;
    [key: string]: any; // Allow for additional properties from useQuery
}
