export enum UserRole {
    SUPER_ADMIN = 'super_admin',
    ADMIN = 'admin',
    PHARMACIST = 'pharmacist',
    CASHIER = 'cashier',
}

export interface IUser {
    _id: string;
    name: string;
    email: string;
    password?: string;
    role: UserRole;
    branchId?: string; // Branch assignment
    branch?: {
        _id?: string;
        id: string;
        name: string;
        address?: {
            street: string;
            city: string;
            state: string;
            postalCode: string;
            country: string;
        };
    }; // Populated branch data
    isFirstSetup?: boolean;
    refreshToken?: string;
    createdAt?: string;
    updatedAt?: string;
    permissions?: string[];
}
