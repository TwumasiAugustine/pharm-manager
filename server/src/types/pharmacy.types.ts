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
    requireSaleShortCode?: boolean;
    shortCodeExpiryMinutes?: number;
    isActive: boolean;
    createdBy?: string; // Super Admin who created this pharmacy
    admins?: string[]; // Admin IDs assigned to this pharmacy
    branchCount?: number;
    userCount?: number;
    createdAt: Date;
    updatedAt: Date;
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
    adminId?: string; // Admin to assign to this pharmacy
}

export interface IPharmacyFilters {
    search?: string;
    isActive?: boolean;
    createdBy?: string;
    hasAdmin?: boolean;
}

export interface IPharmacyStats {
    totalPharmacies: number;
    activePharmacies: number;
    pharmaciesWithAdmins: number;
    totalBranches: number;
    totalUsers: number;
}

export interface IAssignAdminRequest {
    pharmacyId: string;
    adminId: string;
    permissions?: string[];
}
