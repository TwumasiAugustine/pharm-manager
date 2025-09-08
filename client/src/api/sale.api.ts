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
        console.log('Sale fetched:', res.data.data);
        return res.data.data;
    },

    async createSale(data: CreateSaleRequest): Promise<Sale> {
        const payload: any = { ...data };
        if ((payload as any).branchId) {
            payload.branch = (payload as any).branchId;
            delete payload.branchId;
        }
        const res = await api.post('/sales', payload);
        return res.data.data;
    },

    // Get sale by short code
    async getSaleByShortCode(code: string) {
        const res = await api.get(`/sales/shortcode/${code}`);
        return res.data.data;
    },

    // Finalize sale by short code
    async finalizeSaleByShortCode(code: string) {
        const res = await api.post('/sales/finalize', { code });
        return res.data.data;
    },
};

export default saleApi;
