// Interface for a sale item in a response
export interface SaleItem {
    drug:
        | {
              id?: string;
              _id?: string;
              name?: string;
              brand?: string;
          }
        | string; // Could be just the drug ID as a string
    quantity: number;
    priceAtSale: number;
}

// Interface for a full sale response
export interface Sale {
    id?: string;
    _id?: string; // MongoDB ObjectId format
    items: SaleItem[];
    totalAmount: number;
    soldBy:
        | {
              id?: string;
              _id?: string;
              name?: string;
          }
        | string; // Could be just the user ID as a string
    // customer removed
    paymentMethod?: string;
    transactionId?: string;
    notes?: string;
    // customerNotes removed
    date?: string;
    createdAt: string;
    updatedAt?: string;
}

// Interface for creating a new sale
export interface CreateSaleRequest {
    items: {
        drugId: string;
        quantity: number;
    }[];
    totalAmount: number;
    paymentMethod?: string;
    transactionId?: string;
    notes?: string;
}

// Interface for sale search parameters
export interface SaleSearchParams {
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
    userId?: string;
    sortBy?: 'date' | 'total';
    sortOrder?: 'asc' | 'desc';
    groupByDate?: boolean;
}

// Interface for grouped sales by date
export interface GroupedSales {
    id?: string | number; // Add this to satisfy Table component requirements
    date: string;
    sales: Sale[];
    totalAmount: number;
    totalItems: number;
    saleCount: number;
}
