import api from './api';
import type {
    CreateCustomerRequest,
    PaginatedCustomersResponse,
    Customer,
} from '../types/customer.types';

const customerApi = {
    async getCustomers(params: {
        page?: number;
        limit?: number;
        search?: string;
    }): Promise<PaginatedCustomersResponse> {
        const response = await api.get('/customers', { params });
        return response.data.data;
    },
    async getCustomerById(id: string): Promise<Customer> {
        const response = await api.get(`/customers/${id}`);
        return response.data.data;
    },
    async createCustomer(data: CreateCustomerRequest): Promise<Customer> {
        const response = await api.post('/customers', data);
        const rawCustomer = response.data.data;

        // Transform the response to ensure id field is present
        return {
            id: rawCustomer.id || rawCustomer._id || '',
            name: rawCustomer.name || '',
            phone: rawCustomer.phone || '',
            email: rawCustomer.email || '',
            address: rawCustomer.address || '',
            purchases: Array.isArray(rawCustomer.purchases)
                ? rawCustomer.purchases
                : [],
            createdAt: rawCustomer.createdAt || '',
            updatedAt: rawCustomer.updatedAt || '',
        };
    },
};

export default customerApi;
