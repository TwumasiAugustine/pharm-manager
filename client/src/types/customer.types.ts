export interface Customer {
    id: string;
    name: string;
    phone: string;
    email?: string;
    address?: string;
    purchases: string[];
    branchId?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateCustomerRequest {
    name: string;
    phone: string;
    email?: string;
    address?: string;
    branchId?: string;
}

export interface PaginatedCustomersResponse {
    customers: Customer[];
    totalCount: number;
    page: number;
    limit: number;
    totalPages: number;
}
