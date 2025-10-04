import { UserRole } from './user.types';

// Re-export UserRole for convenience
export { UserRole } from './user.types';

export interface User {
    id: string;
    _id?: string;
    name?: string;
    email: string;
    role: UserRole;
    permissions?: string[];
    branchId?: string; // Branch assignment ID
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
    branchId?: string;
    pharmacyId?: string; // For initial setup or admin-created users without branch
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
