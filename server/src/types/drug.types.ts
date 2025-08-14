/**
 * Types for drug-related API requests and responses
 */

/**
 * Interface for creating a new drug
 * Includes all fields required for drug creation, matching the backend model.
 */
export interface ICreateDrugRequest {
    /** Drug name */
    name: string;
    /** Brand name */
    brand: string;
    /** Drug category */
    category: string;
    /** Dosage form (e.g., tablet, syrup) */
    dosageForm: string;
    /** Whether the drug is available for sale */
    ableToSell: boolean;
    /** Number of drugs in a carton */
    drugsInCarton: number;
    /** Number of units per carton */
    unitsPerCarton: number;
    /** Number of packs per carton */
    packsPerCarton: number;
    /** Quantity in stock */
    quantity: number;
    /** Price per unit */
    pricePerUnit: number;
    /** Price per pack */
    pricePerPack: number;
    /** Price per carton */
    pricePerCarton: number;
    /** Expiry date */
    expiryDate: Date | string;
    /** Batch number */
    batchNumber: string;
    /** Whether prescription is required */
    requiresPrescription: boolean;
    /** Supplier name */
    supplier?: string;
    /** Storage location */
    location?: string;
}

/**
 * Interface for updating an existing drug
 */
export interface IUpdateDrugRequest extends Partial<ICreateDrugRequest> {}

/**
 * Interface for drug data returned in responses
 * Includes all fields from the backend drug model.
 */
export interface IDrugResponse {
    /** Unique identifier */
    id: string;
    /** MongoDB _id (optional, for internal use) */
    _id?: string;
    /** Drug name */
    name: string;
    /** Brand name */
    brand: string;
    /** Drug category */
    category: string;
    /** Dosage form (e.g., tablet, syrup) */
    dosageForm: string;
    /** Whether the drug is available for sale */
    ableToSell: boolean;
    /** Number of drugs in a carton */
    drugsInCarton: number;
    /** Number of units per carton */
    unitsPerCarton: number;
    /** Number of packs per carton */
    packsPerCarton: number;
    /** Quantity in stock */
    quantity: number;
    /** Price per unit */
    pricePerUnit: number;
    /** Price per pack */
    pricePerPack: number;
    /** Price per carton */
    pricePerCarton: number;
    /** Expiry date */
    expiryDate: Date | string;
    /** Batch number */
    batchNumber: string;
    /** Whether prescription is required */
    requiresPrescription: boolean;
    /** Supplier name */
    supplier?: string;
    /** Storage location */
    location?: string;
    /** Creation timestamp */
    createdAt: Date | string;
    /** Last update timestamp */
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
