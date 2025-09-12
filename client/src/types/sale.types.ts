// Drug details as returned from backend
export interface DrugDetails {
    _id?: string;
    id?: string;
    name: string;
    brand: string;
    category?: string;
    quantity?: number;
    price?: number;
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
    brand: string;
    quantity: number;
    priceAtSale: number;
    saleType: 'unit' | 'pack' | 'carton'; // New
    profit: number; // New
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
    totalProfit: number;
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
    date?: string;
    finalized?: boolean;
    shortCode?: string;
}

// For creating a new sale
export interface CreateSaleRequest {
    items: {
        drugId: string;
        quantity: number;
        saleType: 'unit' | 'pack' | 'carton';
    }[];
    totalAmount: number;
    paymentMethod: 'cash' | 'card' | 'mobile';
    customerId?: string;
    transactionId?: string;
    notes?: string;
    branchId?: string;
}

// For react-hook-form (frontend only)
export interface SaleFormItem {
    drug: string; // drugId
    quantity: number;
    saleType: 'unit' | 'pack' | 'carton';
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
    branchId?: string;
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
