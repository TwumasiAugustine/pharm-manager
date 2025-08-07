/**
 * Types for drug-related features in the frontend
 */

/**
 * Interface for a drug
 */
export interface Drug {
    id: string;
    _id?: string; // Add optional _id property for MongoDB compatibility
    name: string;
    generic: string;
    brand: string;
    category: string;
    type: string;
    dosageForm: string;
    quantity: number;
    price: number;
    packageInfo?: {
        isPackaged: boolean;
        unitsPerPack?: number;
        packsPerCarton?: number;
        packPrice?: number;
        cartonPrice?: number;
    };
    expiryDate: string;
    batchNumber: string;
    requiresPrescription: boolean;
    createdAt: string;
    updatedAt: string;
}

/**
 * Interface for creating a new drug
 */
export interface CreateDrugRequest {
    name: string;
    generic: string;
    brand: string;
    category: string;
    type: string;
    dosageForm: string;
    quantity: number;
    price: number;
    packageInfo?: {
        isPackaged: boolean;
        unitsPerPack?: number;
        packsPerCarton?: number;
        packPrice?: number;
        cartonPrice?: number;
    };
    expiryDate: string;
    batchNumber: string;
    requiresPrescription: boolean;
}

/**
 * Type for updating an existing drug
 */
export type UpdateDrugRequest = Partial<CreateDrugRequest>;

/**
 * Interface for drug search parameters
 */
export interface DrugSearchParams {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    type?: string;
    dosageForm?: string;
    requiresPrescription?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    expiryBefore?: string;
    expiryAfter?: string;
    isPackaged?: boolean;
}

/**
 * Interface for paginated drug list response
 */
export interface PaginatedDrugsResponse {
    drugs: Drug[];
    totalCount: number;
    page: number;
    limit: number;
    totalPages: number;
}

/**
 * Interface for drug availability check
 */
export interface DrugAvailability {
    id: string;
    name: string;
    available: boolean;
    quantity: number;
    requestedQuantity: number;
    isExpired: boolean;
}

/**
 * Interface for package pricing calculation
 */
export interface PackagePricing {
    individualPrice: number;
    packPrice?: number;
    cartonPrice?: number;
    packSavings?: number;
    cartonSavings?: number;
}
