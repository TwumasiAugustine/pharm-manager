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
        return response.data.data;
    },
};

export default customerApi;
