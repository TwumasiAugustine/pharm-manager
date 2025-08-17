export enum UserRole {
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
    isFirstSetup?: boolean;
    refreshToken?: string;
    createdAt?: string;
    updatedAt?: string;
    permissions?: string[];
}
