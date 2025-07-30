export type UserRole = 'admin' | 'pharmacist' | 'cashier';

export const UserRole = {
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
