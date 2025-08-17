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
