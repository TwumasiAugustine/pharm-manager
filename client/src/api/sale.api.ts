import api from './api';
import type {
    Sale,
    CreateSaleRequest,
    SaleSearchParams,
    SalesListResponse,
} from '../types/sale.types';

const saleApi = {
    async getSales(params: SaleSearchParams): Promise<SalesListResponse> {
        const res = await api.get('/sales', { params });
        return res.data.data;
    },

    async getSaleById(id: string): Promise<Sale> {
        const res = await api.get(`/sales/${id}`);
        return res.data.data;
    },

    async createSale(data: CreateSaleRequest): Promise<Sale> {
        const res = await api.post('/sales', data);
        return res.data.data;
    },
};

export default saleApi;
