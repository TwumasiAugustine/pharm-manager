import { UserRole } from './user.types';

export interface IUser {
    _id: string;
    name: string;
    email: string;
    password: string;
    role: UserRole;
    pharmacyId: string; // Pharmacy association
    branchId?: string; // Branch assignment
    isFirstSetup: boolean;
    refreshToken?: string;
    createdAt: Date;
    updatedAt: Date;
    permissions?: string[];
    comparePassword(enteredPassword: string): Promise<boolean>;
}

export interface ITokenPayload {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    pharmacyId: string; // Pharmacy association
    branchId?: string; // Branch assignment for branch-based access control
    isFirstSetup: boolean;
    permissions?: string[];
}

export interface IAuthTokens {
    accessToken: string;
    refreshToken: string;
}

// Request types
export interface ISignupRequest {
    name: string;
    email: string;
    password: string;
    role?: UserRole;
    branchId?: string;
    pharmacyId?: string; // For initial setup or admin-created users without branch
}

export interface ILoginRequest {
    email: string;
    password: string;
}

// Response types
export interface IAuthResponse {
    user: {
        id: string;
        name: string;
        email: string;
        role: UserRole;
        pharmacyId: string; // Pharmacy association
        branchId?: string; // Include branch information in auth response
        isFirstSetup: boolean;
        permissions?: string[];
    };
    tokens?: IAuthTokens;
}
