/**
 * Types for drug-related API requests and responses
 */

/**
 * Interface for creating a new drug
 */
export interface ICreateDrugRequest {
    name: string;
    brand: string;
    category: string;
    quantity: number;
    price: number;
    expiryDate: Date | string;
    batchNumber: string;
    requiresPrescription: boolean;
    supplier?: string;
    location?: string;
}

/**
 * Interface for updating an existing drug
 */
export interface IUpdateDrugRequest extends Partial<ICreateDrugRequest> {}

/**
 * Interface for drug data returned in responses
 */
export interface IDrugResponse {
    id: string;
    name: string;
    brand: string;
    category: string;
    quantity: number;
    price: number;
    expiryDate: Date | string;
    batchNumber: string;
    requiresPrescription: boolean;
    supplier?: string;
    location?: string;
    createdAt: Date | string;
    updatedAt: Date | string;
}

/**
 * Interface for paginated drug list response
 */
export interface IPaginatedDrugsResponse {
    drugs: IDrugResponse[];
    totalCount: number;
    page: number;
    limit: number;
    totalPages: number;
}

/**
 * Interface for drug search query parameters
 */
export interface IDrugSearchParams {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    requiresPrescription?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    expiryBefore?: Date | string;
    expiryAfter?: Date | string;
}

/**
 * Interface for drug availability check
 */
export interface IDrugAvailabilityResponse {
    id: string;
    name: string;
    available: boolean;
    quantity: number;
    requestedQuantity: number;
    isExpired: boolean;
}
