import api from './api';
import type {
    CreateDrugRequest,
    Drug,
    DrugSearchParams,
    PaginatedDrugsResponse,
    UpdateDrugRequest,
} from '../types/drug.types';

interface ApiResponseData<T> {
    success: boolean;
    message: string;
    data: T;
}

/**
 * API client for drug-related endpoints
 */
export const drugApi = {
    /**
     * Create a new drug
     * @param drugData Drug data to create
     * @returns Created drug
     */
    createDrug: async (drugData: CreateDrugRequest): Promise<Drug> => {
        const response = await api.post<ApiResponseData<{ drug: Drug }>>(
            '/drugs',
            drugData,
        );
        return response.data.data.drug;
    },

    /**
     * Get a drug by ID
     * @param id Drug ID
     * @returns Drug data
     */
    getDrug: async (id: string): Promise<Drug> => {
        const response = await api.get<ApiResponseData<{ drug: Drug }>>(
            `/drugs/${id}`,
        );
        return response.data.data.drug;
    },

    /**
     * Update a drug
     * @param id Drug ID
     * @param updateData Data to update
     * @returns Updated drug
     */
    updateDrug: async (
        id: string,
        updateData: UpdateDrugRequest,
    ): Promise<Drug> => {
        const response = await api.put<ApiResponseData<{ drug: Drug }>>(
            `/drugs/${id}`,
            updateData,
        );
        return response.data.data.drug;
    },

    /**
     * Delete a drug
     * @param id Drug ID
     */
    deleteDrug: async (id: string): Promise<void> => {
        await api.delete<ApiResponseData<null>>(`/drugs/${id}`);
    },

    /**
     * Get a paginated list of drugs with filtering
     * @param params Search parameters
     * @returns Paginated drug list
     */
    getDrugs: async (
        params: DrugSearchParams = {},
    ): Promise<PaginatedDrugsResponse> => {
        // Build query string from params
        const queryParams = new URLSearchParams();

        if (params.page) queryParams.append('page', params.page.toString());
        if (params.limit) queryParams.append('limit', params.limit.toString());
        if (params.search) queryParams.append('search', params.search);
        if (params.category) queryParams.append('category', params.category);
        if (params.requiresPrescription !== undefined)
            queryParams.append(
                'requiresPrescription',
                params.requiresPrescription.toString(),
            );
        if (params.sortBy) queryParams.append('sortBy', params.sortBy);
        if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
        if (params.expiryBefore)
            queryParams.append('expiryBefore', params.expiryBefore);
        if (params.expiryAfter)
            queryParams.append('expiryAfter', params.expiryAfter);

        const queryString = queryParams.toString();
        const url = queryString ? `/drugs?${queryString}` : '/drugs';

        const response = await api.get<ApiResponseData<PaginatedDrugsResponse>>(
            url,
        );
        return response.data.data;
    },

    /**
     * Get list of unique drug categories
     * @returns Array of category names
     */
    getCategories: async (): Promise<string[]> => {
        const response = await api.get<
            ApiResponseData<{ categories: string[] }>
        >('/drugs/categories');
        return response.data.data.categories;
    },

    /**
     * Get list of drugs expiring soon
     * @param days Number of days to check (default 30)
     * @returns List of expiring drugs
     */
    getExpiringDrugs: async (days: number = 30): Promise<Drug[]> => {
        const response = await api.get<
            ApiResponseData<{ drugs: Drug[]; count: number; days: number }>
        >(`/drugs/expiring?days=${days}`);
        return response.data.data.drugs;
    },
};
