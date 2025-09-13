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
    password: string;
    role: UserRole;
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
        branchId?: string; // Include branch information in auth response
        isFirstSetup: boolean;
        permissions?: string[];
    };
    tokens?: IAuthTokens;
}
