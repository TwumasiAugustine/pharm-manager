export enum UserRole {
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
    isFirstSetup: boolean;
    refreshToken?: string;
    createdAt: Date;
    updatedAt: Date;
    permissions?: string[];
    comparePassword(enteredPassword: string): Promise<boolean>;
}

export interface ITokenPayload {
    id: string;
    email: string;
    role: UserRole;
    isFirstSetup: boolean;
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
        isFirstSetup: boolean;
    };
    tokens?: IAuthTokens;
}
