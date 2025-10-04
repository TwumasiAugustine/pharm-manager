import { Types } from 'mongoose';

// Interface for creating a new sale
export interface CreateSaleRequest {
    items: {
        drugId: string;
        quantity: number;
        saleType: 'unit' | 'pack' | 'carton'; // New: type of sale
    }[];
    totalAmount: number;
    paymentMethod: 'cash' | 'card' | 'mobile';
    customerId?: string;
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
    saleType: 'unit' | 'pack' | 'carton'; // New
    profit: number; // New
}

// Interface for a full sale response
export interface SaleResponse {
    id: string;
    items: SaleItemResponse[];
    totalAmount: number;
    totalProfit: number; // New
    soldBy: {
        id: string;
        name: string;
    };
    customer?: {
        id: string;
        name: string;
        phone: string;
    };
    paymentMethod: 'cash' | 'card' | 'mobile';
    transactionId?: string;
    notes?: string;
    shortCode?: string;
    finalized?: boolean;
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
