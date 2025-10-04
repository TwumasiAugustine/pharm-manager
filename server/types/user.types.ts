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
    isFirstSetup: boolean;
    refreshToken?: string;
    pharmacyId?: string; // Primary pharmacy for Admin/Pharmacist/Cashier
    assignedPharmacies?: IPharmacyAssignment[]; // For Super Admin: pharmacies they can manage
    branchId?: string; // For pharmacists/cashiers: specific branch
    isManager?: boolean; // Indicates if user is a manager of their assigned branch
    createdBy?: string; // Who created this user (Super Admin or Admin ID)
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    permissions?: string[];
    canManagePharmacies?: boolean; // Super Admin only
    canManageUsers?: boolean; // Super Admin and Admin
    comparePassword(enteredPassword: string): Promise<boolean>;
}

export interface IPharmacyAssignment {
    pharmacyId: string;
    pharmacyName?: string;
    assignedAt: Date;
    assignedBy: string;
    isActive: boolean;
    permissions?: string[]; // Specific permissions for this pharmacy
}

export interface IUserHierarchy {
    canCreateUsers: UserRole[];
    canAssignRoles: UserRole[];
    canManagePharmacies: boolean;
    canManageBranches: boolean;
    scopeLevel: 'global' | 'pharmacy' | 'branch';
}

export interface ICreateUserRequest {
    name: string;
    email: string;
    password: string;
    role: UserRole;
    pharmacyId?: string;
    branchId?: string;
    isManager?: boolean;
    permissions?: string[];
}

export interface IUserFilters {
    role?: UserRole;
    pharmacyId?: string;
    branchId?: string;
    isActive?: boolean;
    createdBy?: string;
}
