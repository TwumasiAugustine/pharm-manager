import api from './api';
import type {
    CreateDrugRequest,
    DrugSearchParams,
    UpdateDrugRequest,
} from '../types/drug.types';

const drugApi = {
    async createDrug(drugData: CreateDrugRequest) {
        const res = await api.post('/drugs', drugData);
        // Extract the drug from the nested response structure
        return res.data.data.drug;
    },
    async getDrug(id: string) {
        const res = await api.get(`/drugs/${id}`);
        // Extract the drug from the nested response structure
        return res.data.data.drug;
    },
    async updateDrug(id: string, updateData: UpdateDrugRequest) {
        const res = await api.put(`/drugs/${id}`, updateData);
        // Extract the drug from the nested response structure
        return res.data.data.drug;
    },
    async deleteDrug(id: string) {
        const res = await api.delete(`/drugs/${id}`);
        return res.data.data;
    },
    async getDrugs(params: DrugSearchParams = {}) {
        const res = await api.get('/drugs', { params });
        return res.data.data;
    },
    async getCategories() {
        const res = await api.get('/drugs/categories');
        // Extract the categories from the nested response structure
        return res.data.data.categories;
    },
    async getExpiringDrugs(days: number = 30) {
        const res = await api.get(`/drugs/expiring?days=${days}`);
        // Return the full expiring drugs response structure
        return res.data.data;
    },
};

export default drugApi;
