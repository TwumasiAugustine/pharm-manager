export type UserRole = 'super_admin' | 'admin' | 'pharmacist' | 'cashier';

export const UserRole = {
    SUPER_ADMIN: 'super_admin' as UserRole,
    ADMIN: 'admin' as UserRole,
    PHARMACIST: 'pharmacist' as UserRole,
    CASHIER: 'cashier' as UserRole,
};

export interface User {
    id: string;
    _id?: string;
    name?: string;
    email: string;
    role: UserRole;
    permissions?: string[];
    branch?: {
        id: string;
        name: string;
    } | null;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    name: string;
    email: string;
    password: string;
    role?: UserRole;
}

export interface AuthResponse {
    user: User;
    message: string;
}

export interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    isPharmacyConfigured: boolean;
}
