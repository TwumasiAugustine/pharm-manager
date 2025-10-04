// Permission-related types for the frontend
export interface Permission {
    key: string;
    name: string;
    description: string;
    source?: 'role' | 'custom';
}

export interface PermissionCategory {
    categoryKey: string;
    name: string;
    description: string;
    icon: string;
    permissions: Permission[];
}

export interface UserPermissions {
    user: {
        id: string;
        name: string;
        email: string;
        role: string;
    };
    permissions: {
        all: Permission[];
        roleDefaults: string[];
        custom: string[];
    };
}

export interface PermissionCheckResult {
    permission: string;
    hasPermission: boolean;
    user: {
        id: string;
        name: string;
        role: string;
    };
}

// Common permission constants that match the backend
export const PERMISSION_KEYS = {
    // User Management
    CREATE_USER: 'CREATE_USER',
    UPDATE_USER: 'UPDATE_USER',
    DELETE_USER: 'DELETE_USER',
    VIEW_USERS: 'VIEW_USERS',
    MANAGE_PERMISSIONS: 'MANAGE_PERMISSIONS',
    VIEW_USER_ACTIVITY: 'VIEW_USER_ACTIVITY',

    // Pharmacy Management
    MANAGE_PHARMACY: 'MANAGE_PHARMACY',
    VIEW_PHARMACY_INFO: 'VIEW_PHARMACY_INFO',
    UPDATE_PHARMACY_SETTINGS: 'UPDATE_PHARMACY_SETTINGS',

    // Branch Management
    CREATE_BRANCH: 'CREATE_BRANCH',
    UPDATE_BRANCH: 'UPDATE_BRANCH',
    DELETE_BRANCH: 'DELETE_BRANCH',
    VIEW_BRANCHES: 'VIEW_BRANCHES',
    MANAGE_BRANCHES: 'MANAGE_BRANCHES',

    // Drug/Inventory Management
    CREATE_DRUG: 'CREATE_DRUG',
    UPDATE_DRUG: 'UPDATE_DRUG',
    DELETE_DRUG: 'DELETE_DRUG',
    VIEW_DRUGS: 'VIEW_DRUGS',
    MANAGE_DRUGS: 'MANAGE_DRUGS',
    MANAGE_INVENTORY: 'MANAGE_INVENTORY',
    VIEW_LOW_STOCK: 'VIEW_LOW_STOCK',
    TRANSFER_STOCK: 'TRANSFER_STOCK',

    // Sales Management
    CREATE_SALE: 'CREATE_SALE',
    UPDATE_SALE: 'UPDATE_SALE',
    DELETE_SALE: 'DELETE_SALE',
    VIEW_SALES: 'VIEW_SALES',
    FINALIZE_SALE: 'FINALIZE_SALE',
    VOID_SALE: 'VOID_SALE',
    REFUND_SALE: 'REFUND_SALE',
    VIEW_SALE_HISTORY: 'VIEW_SALE_HISTORY',

    // Customer Management
    CREATE_CUSTOMER: 'CREATE_CUSTOMER',
    UPDATE_CUSTOMER: 'UPDATE_CUSTOMER',
    DELETE_CUSTOMER: 'DELETE_CUSTOMER',
    VIEW_CUSTOMERS: 'VIEW_CUSTOMERS',
    MANAGE_CUSTOMERS: 'MANAGE_CUSTOMERS',
    VIEW_CUSTOMER_HISTORY: 'VIEW_CUSTOMER_HISTORY',

    // Reports and Analytics
    VIEW_REPORTS: 'VIEW_REPORTS',
    GENERATE_REPORTS: 'GENERATE_REPORTS',
    VIEW_ANALYTICS: 'VIEW_ANALYTICS',
    EXPORT_DATA: 'EXPORT_DATA',
    VIEW_FINANCIAL_REPORTS: 'VIEW_FINANCIAL_REPORTS',
    VIEW_INVENTORY_REPORTS: 'VIEW_INVENTORY_REPORTS',
    VIEW_SALES_REPORTS: 'VIEW_SALES_REPORTS',

    // System Administration
    MANAGE_SYSTEM_SETTINGS: 'MANAGE_SYSTEM_SETTINGS',
    VIEW_AUDIT_LOGS: 'VIEW_AUDIT_LOGS',
    MANAGE_CRON_JOBS: 'MANAGE_CRON_JOBS',
    BACKUP_RESTORE: 'BACKUP_RESTORE',
    SYSTEM_MONITORING: 'SYSTEM_MONITORING',

    // Expiry Management
    VIEW_EXPIRY_ALERTS: 'VIEW_EXPIRY_ALERTS',
    MANAGE_EXPIRY_SETTINGS: 'MANAGE_EXPIRY_SETTINGS',
    DISPOSE_EXPIRED_DRUGS: 'DISPOSE_EXPIRED_DRUGS',

    // Manager Privileges
    MANAGE_BRANCH_STAFF: 'MANAGE_BRANCH_STAFF',
    VIEW_BRANCH_ANALYTICS: 'VIEW_BRANCH_ANALYTICS',
    APPROVE_DISCOUNTS: 'APPROVE_DISCOUNTS',
    MANAGE_BRANCH_INVENTORY: 'MANAGE_BRANCH_INVENTORY',
    OVERRIDE_PRICES: 'OVERRIDE_PRICES',
    APPROVE_REFUNDS: 'APPROVE_REFUNDS',
    MANAGE_SHIFT_SCHEDULES: 'MANAGE_SHIFT_SCHEDULES',
    VIEW_STAFF_PERFORMANCE: 'VIEW_STAFF_PERFORMANCE',
} as const;

export type PermissionKey =
    (typeof PERMISSION_KEYS)[keyof typeof PERMISSION_KEYS];

export default {
    PERMISSION_KEYS,
    type: {} as {
        Permission: Permission;
        PermissionCategory: PermissionCategory;
        UserPermissions: UserPermissions;
        PermissionCheckResult: PermissionCheckResult;
        PermissionKey: PermissionKey;
    },
};
