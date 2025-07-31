// Sale item as returned from the backend
export interface SaleItem {
    drugId: string;
    name: string;
    brand: string;
    quantity: number;
    priceAtSale: number;
    id?: string;
    _id?: string;
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
    paymentMethod: 'cash' | 'card' | 'mobile';
    transactionId?: string;
    notes?: string;
    createdAt: string;
    date?: string; // for grouping
}

// For creating a new sale
export interface CreateSaleRequest {
    items: { drugId: string; quantity: number }[];
    totalAmount: number;
    paymentMethod: 'cash' | 'card' | 'mobile';
    transactionId?: string;
    notes?: string;
}

// For react-hook-form (frontend only)
export interface SaleFormItem {
    drug: string; // drugId
    quantity: number;
}
export interface SaleFormInput {
    items: SaleFormItem[];
    paymentMethod: 'cash' | 'card' | 'mobile';
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
