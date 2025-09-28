import api from './api';

export interface IPharmacy {
    _id: string;
    name: string;
    address: {
        street: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
    };
    contact: {
        phone: string;
        email: string;
        website?: string;
    };
    registrationNumber: string;
    taxId: string;
    operatingHours: string;
    slogan: string;
    isActive: boolean;
    createdBy?: string;
    admins?: string[];
    branchCount?: number;
    userCount?: number;
    createdAt: string;
    updatedAt: string;
}

export interface ICreatePharmacyRequest {
    name: string;
    address: {
        street: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
    };
    contact: {
        phone: string;
        email: string;
        website?: string;
    };
    registrationNumber: string;
    taxId: string;
    operatingHours: string;
    slogan: string;
    adminId?: string;
}

export interface IPharmacyListResponse {
    pharmacies: IPharmacy[];
    pagination: {
        current: number;
        pages: number;
        total: number;
        limit: number;
    };
}

export interface ICreateAdminRequest {
    name: string;
    email: string;
    password: string;
    assignToPharmacy?: string;
    permissions?: string[];
}

export const superAdminApi = {
    // Pharmacy Management
    createPharmacy: async (
        data: ICreatePharmacyRequest,
    ): Promise<IPharmacy> => {
        const response = await api.post('/pharmacy/create', data);
        return response.data.data;
    },

    getAllPharmacies: async (params?: {
        page?: number;
        limit?: number;
        search?: string;
        isActive?: boolean;
    }): Promise<IPharmacyListResponse> => {
        const response = await api.get('/pharmacy/all', { params });
        return response.data.data;
    },

    deletePharmacy: async (pharmacyId: string): Promise<void> => {
        await api.delete(`/pharmacy/${pharmacyId}`);
    },

    assignAdminToPharmacy: async (
        pharmacyId: string,
        adminId: string,
        permissions?: string[],
    ): Promise<void> => {
        await api.post(`/pharmacy/${pharmacyId}/assign-admin`, {
            adminId,
            permissions,
        });
    },

    // Admin Management
    getAllAdmins: async (): Promise<unknown[]> => {
        const response = await api.get('/pharmacy/admins/all');
        return response.data.data;
    },

    createAdminUser: async (data: ICreateAdminRequest): Promise<unknown> => {
        const response = await api.post('/pharmacy/admins/create', data);
        return response.data.data;
    },
};
