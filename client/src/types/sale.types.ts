// Drug details as returned from backend
export interface DrugDetails {
    _id?: string;
    id?: string;
    name: string;
    generic: string;
    brand: string;
    category?: string;
    type?: string;
    dosageForm?: string;
    quantity?: number;
    price?: number;
    packageInfo?: {
        isPackaged: boolean;
        unitsPerPack?: number;
        packsPerCarton?: number;
        packPrice?: number;
        cartonPrice?: number;
    };
    expiryDate?: string;
    batchNumber?: string;
    requiresPrescription?: boolean;
    createdAt?: string;
    updatedAt?: string;
}

// Sale item as returned from the backend
export interface SaleItem {
    drugId: string;
    name: string;
    generic: string;
    brand: string;
    quantity: number;
    priceAtSale: number;
    packageType?: 'individual' | 'pack' | 'carton';
    unitsSold?: number;
    packsSold?: number;
    cartonsSold?: number;
    id?: string;
    _id?: string;
    drug?: DrugDetails; // Add the nested drug object
}

// Sale as returned from the backend
export interface Sale {
    id?: string;
    _id?: string;
    items: SaleItem[];
    totalAmount: number;
    soldBy: {
        id?: string;
        _id?: string;
        name: string;
    };
    customer?: {
        id?: string;
        _id?: string;
        name: string;
        phone: string;
    };
    paymentMethod: 'cash' | 'card' | 'mobile';
    transactionId?: string;
    notes?: string;
    createdAt: string;
    date?: string; // for grouping
}

// For creating a new sale
export interface CreateSaleRequest {
    items: { 
        drugId: string; 
        quantity: number;
        packageType?: 'individual' | 'pack' | 'carton';
    }[];
    totalAmount: number;
    paymentMethod: 'cash' | 'card' | 'mobile';
    customerId?: string;
    transactionId?: string;
    notes?: string;
}

// For react-hook-form (frontend only)
export interface SaleFormItem {
    drug: string; // drugId
    quantity: number;
    packageType?: 'individual' | 'pack' | 'carton';
}
export interface SaleFormInput {
    items: SaleFormItem[];
    paymentMethod: 'cash' | 'card' | 'mobile';
    customerId?: string;
    transactionId?: string;
    notes?: string;
}

// For searching sales
export interface SaleSearchParams {
    groupByDate?: boolean;
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
    userId?: string;
    sortBy?: 'date' | 'total';
    sortOrder?: 'asc' | 'desc';
}

// For grouped sales (by date)
export interface GroupedSales {
    id: string; // date string
    date: string;
    sales: Sale[];
    totalAmount: number;
    totalItems: number;
    saleCount: number;
}

export interface SalesListResponse {
    data: Sale[] | GroupedSales[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

// Package pricing information for sale calculations
export interface SalePackagePricing {
    individualPrice: number;
    packPrice?: number;
    cartonPrice?: number;
    packSavings?: number;
    cartonSavings?: number;
    bestOption: {
        type: 'individual' | 'pack' | 'carton';
        totalCost: number;
        savings: number;
        units: number;
        packs: number;
        cartons: number;
    };
}
