import api from './api';
import type {
    CreateDrugRequest,
    DrugSearchParams,
    UpdateDrugRequest,
} from '../types/drug.types';

const drugApi = {
    async createDrug(drugData: CreateDrugRequest) {
        // Handle both legacy single branch and new multi-branch approach
        const payload = {
            ...drugData,
        };

        // If selectedBranches is provided, use it (new approach)
        if (drugData.selectedBranches && drugData.selectedBranches.length > 0) {
            payload.selectedBranches = drugData.selectedBranches;
            // Remove legacy branchId if present
            delete (payload as CreateDrugRequest & { branchId?: string })
                .branchId;
        } else if (drugData.branchId) {
            // Legacy single branch approach - map branchId -> branch
            (payload as CreateDrugRequest & { branch?: string }).branch =
                drugData.branchId;
            delete (payload as CreateDrugRequest & { branchId?: string })
                .branchId;
        }

        const res = await api.post('/drugs', payload);
        // Extract the drug from the nested response structure
        return res.data.data.drug || res.data.data;
    },
    async getDrug(id: string) {
        const res = await api.get(`/drugs/${id}`);
        // Extract the drug from the nested response structure
        return res.data.data.drug;
    },
    async updateDrug(id: string, updateData: UpdateDrugRequest) {
        // Map branchId -> branch for updates too
        const payload: UpdateDrugRequest & {
            branch?: string;
            branchId?: string;
        } = { ...updateData };
        if (payload.branchId) {
            payload.branch = payload.branchId;
            delete payload.branchId;
        }
        const res = await api.put(`/drugs/${id}`, payload);
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
