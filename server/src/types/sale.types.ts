import { Types } from 'mongoose';


// Interface for creating a new sale
export interface CreateSaleRequest {
    items: {
        drugId: string;
        quantity: number;
    }[];
    totalAmount: number;
    paymentMethod: 'cash' | 'card' | 'mobile';
    transactionId?: string;
    notes?: string;
}

// Interface for a sale item in a response
export interface SaleItemResponse {
    drugId: string;
    name: string;
    brand: string;
    quantity: number;
    priceAtSale: number;
}

// Interface for a full sale response
export interface SaleResponse {
    id: string;
    items: SaleItemResponse[];
    totalAmount: number;
    soldBy: {
        id: string;
        name: string;
    };
    paymentMethod: 'cash' | 'card' | 'mobile';
    transactionId?: string;
    notes?: string;
    createdAt: string;
}

// Interface for sale search parameters
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
