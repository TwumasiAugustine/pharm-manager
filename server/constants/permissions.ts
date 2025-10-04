/**
 * Application Permissions System
 *
 * This file defines all available permissions in the pharmacy management system.
 * Permissions are organized by feature/module for better maintainability.
 */

import { UserRole } from '../types/user.types';

// User Management Permissions
export const USER_PERMISSIONS = {
    CREATE_USER: 'CREATE_USER',
    UPDATE_USER: 'UPDATE_USER',
    DELETE_USER: 'DELETE_USER',
    VIEW_USERS: 'VIEW_USERS',
    MANAGE_USERS: 'MANAGE_USERS',
    MANAGE_PERMISSIONS: 'MANAGE_PERMISSIONS',
    VIEW_USER_ACTIVITY: 'VIEW_USER_ACTIVITY',
} as const;

// Pharmacy Management Permissions
export const PHARMACY_PERMISSIONS = {
    MANAGE_PHARMACY: 'MANAGE_PHARMACY',
    VIEW_PHARMACY_INFO: 'VIEW_PHARMACY_INFO',
    UPDATE_PHARMACY_SETTINGS: 'UPDATE_PHARMACY_SETTINGS',
} as const;

// Branch Management Permissions
export const BRANCH_PERMISSIONS = {
    CREATE_BRANCH: 'CREATE_BRANCH',
    UPDATE_BRANCH: 'UPDATE_BRANCH',
    DELETE_BRANCH: 'DELETE_BRANCH',
    VIEW_BRANCHES: 'VIEW_BRANCHES',
    MANAGE_BRANCHES: 'MANAGE_BRANCHES',
} as const;

// Drug/Inventory Management Permissions
export const DRUG_PERMISSIONS = {
    CREATE_DRUG: 'CREATE_DRUG',
    UPDATE_DRUG: 'UPDATE_DRUG',
    DELETE_DRUG: 'DELETE_DRUG',
    VIEW_DRUGS: 'VIEW_DRUGS',
    MANAGE_DRUGS: 'MANAGE_DRUGS',
    MANAGE_INVENTORY: 'MANAGE_INVENTORY',
    VIEW_LOW_STOCK: 'VIEW_LOW_STOCK',
    TRANSFER_STOCK: 'TRANSFER_STOCK',
} as const;

// Sales Management Permissions
export const SALES_PERMISSIONS = {
    CREATE_SALE: 'CREATE_SALE',
    UPDATE_SALE: 'UPDATE_SALE',
    DELETE_SALE: 'DELETE_SALE',
    VIEW_SALES: 'VIEW_SALES',
    MANAGE_SALES: 'MANAGE_SALES',
    FINALIZE_SALE: 'FINALIZE_SALE',
    VOID_SALE: 'VOID_SALE',
    REFUND_SALE: 'REFUND_SALE',
    VIEW_SALE_HISTORY: 'VIEW_SALE_HISTORY',
} as const;

// Customer Management Permissions
export const CUSTOMER_PERMISSIONS = {
    CREATE_CUSTOMER: 'CREATE_CUSTOMER',
    UPDATE_CUSTOMER: 'UPDATE_CUSTOMER',
    DELETE_CUSTOMER: 'DELETE_CUSTOMER',
    VIEW_CUSTOMERS: 'VIEW_CUSTOMERS',
    MANAGE_CUSTOMERS: 'MANAGE_CUSTOMERS',
    VIEW_CUSTOMER_HISTORY: 'VIEW_CUSTOMER_HISTORY',
} as const;

// Reports and Analytics Permissions
export const REPORT_PERMISSIONS = {
    VIEW_REPORTS: 'VIEW_REPORTS',
    GENERATE_REPORTS: 'GENERATE_REPORTS',
    VIEW_ANALYTICS: 'VIEW_ANALYTICS',
    EXPORT_DATA: 'EXPORT_DATA',
    VIEW_FINANCIAL_REPORTS: 'VIEW_FINANCIAL_REPORTS',
    VIEW_INVENTORY_REPORTS: 'VIEW_INVENTORY_REPORTS',
    VIEW_SALES_REPORTS: 'VIEW_SALES_REPORTS',
} as const;

// System Administration Permissions
export const SYSTEM_PERMISSIONS = {
    MANAGE_SYSTEM_SETTINGS: 'MANAGE_SYSTEM_SETTINGS',
    MANAGE_SYSTEM: 'MANAGE_SYSTEM',
    VIEW_AUDIT_LOGS: 'VIEW_AUDIT_LOGS',
    MANAGE_CRON_JOBS: 'MANAGE_CRON_JOBS',
    BACKUP_RESTORE: 'BACKUP_RESTORE',
    SYSTEM_MONITORING: 'SYSTEM_MONITORING',
} as const;

// Audit Management Permissions
export const AUDIT_PERMISSIONS = {
    VIEW_AUDIT_LOGS: 'VIEW_AUDIT_LOGS',
    MANAGE_AUDIT_LOGS: 'MANAGE_AUDIT_LOGS',
    EXPORT_AUDIT_LOGS: 'EXPORT_AUDIT_LOGS',
} as const;

// Expiry Management Permissions
export const EXPIRY_PERMISSIONS = {
    VIEW_EXPIRY_ALERTS: 'VIEW_EXPIRY_ALERTS',
    MANAGE_EXPIRY_SETTINGS: 'MANAGE_EXPIRY_SETTINGS',
    DISPOSE_EXPIRED_DRUGS: 'DISPOSE_EXPIRED_DRUGS',
} as const;

// Manager-Specific Permissions
export const MANAGER_PERMISSIONS = {
    MANAGE_BRANCH_STAFF: 'MANAGE_BRANCH_STAFF',
    VIEW_BRANCH_ANALYTICS: 'VIEW_BRANCH_ANALYTICS',
    APPROVE_DISCOUNTS: 'APPROVE_DISCOUNTS',
    MANAGE_BRANCH_INVENTORY: 'MANAGE_BRANCH_INVENTORY',
    OVERRIDE_PRICES: 'OVERRIDE_PRICES',
    APPROVE_REFUNDS: 'APPROVE_REFUNDS',
    MANAGE_SHIFT_SCHEDULES: 'MANAGE_SHIFT_SCHEDULES',
    VIEW_STAFF_PERFORMANCE: 'VIEW_STAFF_PERFORMANCE',
} as const;

// All permissions combined
export const ALL_PERMISSIONS = {
    ...USER_PERMISSIONS,
    ...PHARMACY_PERMISSIONS,
    ...BRANCH_PERMISSIONS,
    ...DRUG_PERMISSIONS,
    ...SALES_PERMISSIONS,
    ...CUSTOMER_PERMISSIONS,
    ...REPORT_PERMISSIONS,
    ...SYSTEM_PERMISSIONS,
    ...AUDIT_PERMISSIONS,
    ...EXPIRY_PERMISSIONS,
    ...MANAGER_PERMISSIONS,
} as const;

// Permission types
export type Permission = (typeof ALL_PERMISSIONS)[keyof typeof ALL_PERMISSIONS];

// Permission categories for UI organization
export const PERMISSION_CATEGORIES = {
    USER_MANAGEMENT: {
        name: 'User Management',
        description: 'Manage users, roles, and permissions',
        permissions: Object.values(USER_PERMISSIONS),
        icon: 'FaUsers',
    },
    PHARMACY_MANAGEMENT: {
        name: 'Pharmacy Management',
        description: 'Manage pharmacy information and settings',
        permissions: Object.values(PHARMACY_PERMISSIONS),
        icon: 'FaHospital',
    },
    BRANCH_MANAGEMENT: {
        name: 'Branch Management',
        description: 'Manage pharmacy branches',
        permissions: Object.values(BRANCH_PERMISSIONS),
        icon: 'FaBuilding',
    },
    INVENTORY_MANAGEMENT: {
        name: 'Inventory Management',
        description: 'Manage drugs and inventory',
        permissions: Object.values(DRUG_PERMISSIONS),
        icon: 'FaPills',
    },
    SALES_MANAGEMENT: {
        name: 'Sales Management',
        description: 'Manage sales and transactions',
        permissions: Object.values(SALES_PERMISSIONS),
        icon: 'FaCashRegister',
    },
    CUSTOMER_MANAGEMENT: {
        name: 'Customer Management',
        description: 'Manage customer information',
        permissions: Object.values(CUSTOMER_PERMISSIONS),
        icon: 'FaUserFriends',
    },
    REPORTS_ANALYTICS: {
        name: 'Reports & Analytics',
        description: 'View reports and analytics',
        permissions: Object.values(REPORT_PERMISSIONS),
        icon: 'FaChartBar',
    },
    SYSTEM_ADMINISTRATION: {
        name: 'System Administration',
        description: 'System-level administration',
        permissions: Object.values(SYSTEM_PERMISSIONS),
        icon: 'FaCogs',
    },
    EXPIRY_MANAGEMENT: {
        name: 'Expiry Management',
        description: 'Manage drug expiry alerts and disposal',
        permissions: Object.values(EXPIRY_PERMISSIONS),
        icon: 'FaExclamationTriangle',
    },
    MANAGER_PRIVILEGES: {
        name: 'Manager Privileges',
        description: 'Special permissions for branch managers',
        permissions: Object.values(MANAGER_PERMISSIONS),
        icon: 'FaUserTie',
    },
} as const;

// System-level permissions (SUPER_ADMIN only)
export const SYSTEM_LEVEL_PERMISSIONS = [
    // Pharmacy Management (system-wide)
    PHARMACY_PERMISSIONS.MANAGE_PHARMACY,
    PHARMACY_PERMISSIONS.UPDATE_PHARMACY_SETTINGS,

    // System Administration
    ...Object.values(SYSTEM_PERMISSIONS),

    // User Management (creating admins)
    USER_PERMISSIONS.CREATE_USER, // Only for creating admins
] as const;

// Operational permissions (excluded from SUPER_ADMIN by default)
export const OPERATIONAL_PERMISSIONS = [
    // Branch Operations
    ...Object.values(BRANCH_PERMISSIONS).filter(
        (p) => p !== BRANCH_PERMISSIONS.VIEW_BRANCHES,
    ),

    // Daily Operations
    ...Object.values(DRUG_PERMISSIONS),
    ...Object.values(SALES_PERMISSIONS),
    ...Object.values(CUSTOMER_PERMISSIONS),
    ...Object.values(EXPIRY_PERMISSIONS),

    // Operational Reports
    REPORT_PERMISSIONS.VIEW_REPORTS,
    REPORT_PERMISSIONS.GENERATE_REPORTS,
    REPORT_PERMISSIONS.VIEW_ANALYTICS,
    REPORT_PERMISSIONS.EXPORT_DATA,
    REPORT_PERMISSIONS.VIEW_FINANCIAL_REPORTS,
    REPORT_PERMISSIONS.VIEW_INVENTORY_REPORTS,
    REPORT_PERMISSIONS.VIEW_SALES_REPORTS,
] as const;

// Role hierarchy definition
export const ROLE_HIERARCHY = {
    [UserRole.SUPER_ADMIN]: {
        level: 4,
        canCreate: [UserRole.ADMIN],
        canManage: [UserRole.ADMIN],
        scope: 'system',
        excludedPermissions: OPERATIONAL_PERMISSIONS,
    },
    [UserRole.ADMIN]: {
        level: 3,
        canCreate: [UserRole.PHARMACIST, UserRole.CASHIER],
        canManage: [UserRole.PHARMACIST, UserRole.CASHIER],
        scope: 'pharmacy',
        excludedPermissions: SYSTEM_LEVEL_PERMISSIONS,
    },
    [UserRole.PHARMACIST]: {
        level: 2,
        canCreate: [],
        canManage: [],
        scope: 'branch',
        excludedPermissions: [
            ...SYSTEM_LEVEL_PERMISSIONS,
            USER_PERMISSIONS.CREATE_USER,
            USER_PERMISSIONS.DELETE_USER,
            USER_PERMISSIONS.MANAGE_PERMISSIONS,
        ],
    },
    [UserRole.CASHIER]: {
        level: 1,
        canCreate: [],
        canManage: [],
        scope: 'branch',
        excludedPermissions: [
            ...SYSTEM_LEVEL_PERMISSIONS,
            ...Object.values(USER_PERMISSIONS),
            ...Object.values(BRANCH_PERMISSIONS).filter(
                (p) => p !== BRANCH_PERMISSIONS.VIEW_BRANCHES,
            ),
        ],
    },
} as const;

// Role-based default permissions
export const ROLE_PERMISSIONS = {
    super_admin: [
        // System-level permissions only
        ...SYSTEM_LEVEL_PERMISSIONS,

        // View-only access to operational data for oversight
        PHARMACY_PERMISSIONS.VIEW_PHARMACY_INFO,
        BRANCH_PERMISSIONS.VIEW_BRANCHES,
        USER_PERMISSIONS.VIEW_USERS,
        USER_PERMISSIONS.VIEW_USER_ACTIVITY,

        // User management for admins only
        USER_PERMISSIONS.UPDATE_USER, // For admin management
        USER_PERMISSIONS.DELETE_USER, // For admin management
        USER_PERMISSIONS.MANAGE_PERMISSIONS, // For admin permission assignment
    ],
    admin: [
        // User Management (for pharmacists and cashiers)
        USER_PERMISSIONS.CREATE_USER,
        USER_PERMISSIONS.UPDATE_USER,
        USER_PERMISSIONS.DELETE_USER,
        USER_PERMISSIONS.VIEW_USERS,
        USER_PERMISSIONS.MANAGE_PERMISSIONS,
        USER_PERMISSIONS.VIEW_USER_ACTIVITY,

        // Pharmacy (view and limited management)
        PHARMACY_PERMISSIONS.VIEW_PHARMACY_INFO,

        // Branch Management (full access)
        ...Object.values(BRANCH_PERMISSIONS),

        // Inventory Management (full access)
        ...Object.values(DRUG_PERMISSIONS),

        // Sales Management (full access)
        ...Object.values(SALES_PERMISSIONS),

        // Customer Management (full access)
        ...Object.values(CUSTOMER_PERMISSIONS),

        // Reports (full access)
        REPORT_PERMISSIONS.VIEW_REPORTS,
        REPORT_PERMISSIONS.GENERATE_REPORTS,
        REPORT_PERMISSIONS.VIEW_ANALYTICS,
        REPORT_PERMISSIONS.EXPORT_DATA,
        REPORT_PERMISSIONS.VIEW_FINANCIAL_REPORTS,
        REPORT_PERMISSIONS.VIEW_INVENTORY_REPORTS,
        REPORT_PERMISSIONS.VIEW_SALES_REPORTS,

        // Expiry Management (full access)
        ...Object.values(EXPIRY_PERMISSIONS),
    ],
    pharmacist: [
        // User Management (view only)
        USER_PERMISSIONS.VIEW_USERS,

        // Pharmacy (view only)
        PHARMACY_PERMISSIONS.VIEW_PHARMACY_INFO,

        // Branch (view only)
        BRANCH_PERMISSIONS.VIEW_BRANCHES,

        // Inventory Management
        DRUG_PERMISSIONS.VIEW_DRUGS,
        DRUG_PERMISSIONS.UPDATE_DRUG,
        DRUG_PERMISSIONS.MANAGE_INVENTORY,
        DRUG_PERMISSIONS.VIEW_LOW_STOCK,
        DRUG_PERMISSIONS.TRANSFER_STOCK,

        // Sales Management
        SALES_PERMISSIONS.CREATE_SALE,
        SALES_PERMISSIONS.VIEW_SALES,
        SALES_PERMISSIONS.FINALIZE_SALE,
        SALES_PERMISSIONS.VIEW_SALE_HISTORY,

        // Customer Management
        CUSTOMER_PERMISSIONS.CREATE_CUSTOMER,
        CUSTOMER_PERMISSIONS.UPDATE_CUSTOMER,
        CUSTOMER_PERMISSIONS.VIEW_CUSTOMERS,
        CUSTOMER_PERMISSIONS.VIEW_CUSTOMER_HISTORY,

        // Reports (limited)
        REPORT_PERMISSIONS.VIEW_REPORTS,
        REPORT_PERMISSIONS.VIEW_INVENTORY_REPORTS,
        REPORT_PERMISSIONS.VIEW_SALES_REPORTS,

        // Expiry Management
        EXPIRY_PERMISSIONS.VIEW_EXPIRY_ALERTS,
        EXPIRY_PERMISSIONS.DISPOSE_EXPIRED_DRUGS,
    ],
    cashier: [
        // Branch (view only)
        BRANCH_PERMISSIONS.VIEW_BRANCHES,

        // Inventory (view only)
        DRUG_PERMISSIONS.VIEW_DRUGS,
        DRUG_PERMISSIONS.VIEW_LOW_STOCK,

        // Sales Management (limited)
        SALES_PERMISSIONS.CREATE_SALE,
        SALES_PERMISSIONS.VIEW_SALES,
        SALES_PERMISSIONS.VIEW_SALE_HISTORY,

        // Customer Management (limited)
        CUSTOMER_PERMISSIONS.CREATE_CUSTOMER,
        CUSTOMER_PERMISSIONS.UPDATE_CUSTOMER,
        CUSTOMER_PERMISSIONS.VIEW_CUSTOMERS,
        CUSTOMER_PERMISSIONS.VIEW_CUSTOMER_HISTORY,

        // Expiry (view only)
        EXPIRY_PERMISSIONS.VIEW_EXPIRY_ALERTS,
    ],
} as const;

// Helper functions
export const getPermissionsByRole = (
    role: keyof typeof ROLE_PERMISSIONS,
): readonly string[] => {
    return ROLE_PERMISSIONS[role] || [];
};

export const getPermissionCategory = (permission: string): string => {
    for (const [categoryKey, category] of Object.entries(
        PERMISSION_CATEGORIES,
    )) {
        if ((category.permissions as string[]).includes(permission)) {
            return categoryKey;
        }
    }
    return 'UNKNOWN';
};

/**
 * Check if a user role can create another user role
 */
export const canCreateRole = (
    creatorRole: UserRole,
    targetRole: UserRole,
): boolean => {
    const hierarchy = ROLE_HIERARCHY[creatorRole];
    return hierarchy
        ? (hierarchy.canCreate as readonly UserRole[]).includes(targetRole)
        : false;
};

/**
 * Check if a user role can manage another user role
 */
export const canManageRole = (
    managerRole: UserRole,
    targetRole: UserRole,
): boolean => {
    const hierarchy = ROLE_HIERARCHY[managerRole];
    return hierarchy
        ? (hierarchy.canManage as readonly UserRole[]).includes(targetRole)
        : false;
};

/**
 * Get the scope level for a role
 */
export const getRoleScope = (
    role: UserRole,
): 'system' | 'pharmacy' | 'branch' => {
    const hierarchy = ROLE_HIERARCHY[role];
    return hierarchy ? hierarchy.scope : 'branch';
};

/**
 * Check if a permission is excluded for a role
 */
export const isPermissionExcludedForRole = (
    role: UserRole,
    permission: string,
): boolean => {
    const hierarchy = ROLE_HIERARCHY[role];
    return hierarchy
        ? (hierarchy.excludedPermissions as readonly string[]).includes(
              permission,
          )
        : false;
};

/**
 * Get filtered permissions for a role (excluding restricted permissions)
 */
export const getFilteredPermissionsForRole = (
    role: UserRole,
    permissions: string[],
): string[] => {
    const hierarchy = ROLE_HIERARCHY[role];
    if (!hierarchy) return permissions;

    return permissions.filter(
        (permission) =>
            !(hierarchy.excludedPermissions as readonly string[]).includes(
                permission,
            ),
    );
};

export const getPermissionDescription = (permission: string): string => {
    const descriptions: Record<string, string> = {
        // User Management
        [USER_PERMISSIONS.CREATE_USER]: 'Create new users',
        [USER_PERMISSIONS.UPDATE_USER]: 'Update user information',
        [USER_PERMISSIONS.DELETE_USER]: 'Delete users',
        [USER_PERMISSIONS.VIEW_USERS]: 'View user list and details',
        [USER_PERMISSIONS.MANAGE_PERMISSIONS]:
            'Assign and manage user permissions',
        [USER_PERMISSIONS.VIEW_USER_ACTIVITY]: 'View user activity logs',

        // Pharmacy Management
        [PHARMACY_PERMISSIONS.MANAGE_PHARMACY]:
            'Full pharmacy management access',
        [PHARMACY_PERMISSIONS.VIEW_PHARMACY_INFO]: 'View pharmacy information',
        [PHARMACY_PERMISSIONS.UPDATE_PHARMACY_SETTINGS]:
            'Update pharmacy settings',

        // Branch Management
        [BRANCH_PERMISSIONS.CREATE_BRANCH]: 'Create new branches',
        [BRANCH_PERMISSIONS.UPDATE_BRANCH]: 'Update branch information',
        [BRANCH_PERMISSIONS.DELETE_BRANCH]: 'Delete branches',
        [BRANCH_PERMISSIONS.VIEW_BRANCHES]: 'View branch list and details',
        [BRANCH_PERMISSIONS.MANAGE_BRANCHES]: 'Full branch management access',

        // Drug Management
        [DRUG_PERMISSIONS.CREATE_DRUG]: 'Add new drugs to inventory',
        [DRUG_PERMISSIONS.UPDATE_DRUG]: 'Update drug information',
        [DRUG_PERMISSIONS.DELETE_DRUG]: 'Remove drugs from system',
        [DRUG_PERMISSIONS.VIEW_DRUGS]: 'View drug inventory',
        [DRUG_PERMISSIONS.MANAGE_DRUGS]: 'Full drug management access',
        [DRUG_PERMISSIONS.MANAGE_INVENTORY]: 'Manage inventory levels',
        [DRUG_PERMISSIONS.VIEW_LOW_STOCK]: 'View low stock alerts',
        [DRUG_PERMISSIONS.TRANSFER_STOCK]: 'Transfer stock between branches',

        // Sales Management
        [SALES_PERMISSIONS.CREATE_SALE]: 'Create new sales transactions',
        [SALES_PERMISSIONS.UPDATE_SALE]: 'Modify sales transactions',
        [SALES_PERMISSIONS.DELETE_SALE]: 'Delete sales transactions',
        [SALES_PERMISSIONS.VIEW_SALES]: 'View sales list and details',
        [SALES_PERMISSIONS.FINALIZE_SALE]: 'Finalize and complete sales',
        [SALES_PERMISSIONS.VOID_SALE]: 'Void sales transactions',
        [SALES_PERMISSIONS.REFUND_SALE]: 'Process refunds',
        [SALES_PERMISSIONS.VIEW_SALE_HISTORY]: 'View historical sales data',

        // Customer Management
        [CUSTOMER_PERMISSIONS.CREATE_CUSTOMER]: 'Add new customers',
        [CUSTOMER_PERMISSIONS.UPDATE_CUSTOMER]: 'Update customer information',
        [CUSTOMER_PERMISSIONS.DELETE_CUSTOMER]: 'Remove customers',
        [CUSTOMER_PERMISSIONS.VIEW_CUSTOMERS]: 'View customer list and details',
        [CUSTOMER_PERMISSIONS.MANAGE_CUSTOMERS]:
            'Full customer management access',
        [CUSTOMER_PERMISSIONS.VIEW_CUSTOMER_HISTORY]:
            'View customer purchase history',

        // Reports
        [REPORT_PERMISSIONS.VIEW_REPORTS]: 'View system reports',
        [REPORT_PERMISSIONS.GENERATE_REPORTS]: 'Generate custom reports',
        [REPORT_PERMISSIONS.VIEW_ANALYTICS]: 'View analytics and insights',
        [REPORT_PERMISSIONS.EXPORT_DATA]: 'Export data and reports',
        [REPORT_PERMISSIONS.VIEW_FINANCIAL_REPORTS]: 'View financial reports',
        [REPORT_PERMISSIONS.VIEW_INVENTORY_REPORTS]: 'View inventory reports',
        [REPORT_PERMISSIONS.VIEW_SALES_REPORTS]: 'View sales reports',

        // System Administration
        [SYSTEM_PERMISSIONS.MANAGE_SYSTEM_SETTINGS]:
            'Manage system configuration',
        [SYSTEM_PERMISSIONS.VIEW_AUDIT_LOGS]: 'View system audit logs',
        [SYSTEM_PERMISSIONS.MANAGE_CRON_JOBS]: 'Manage scheduled tasks',
        [SYSTEM_PERMISSIONS.BACKUP_RESTORE]: 'Backup and restore system data',
        [SYSTEM_PERMISSIONS.SYSTEM_MONITORING]: 'Monitor system performance',

        // Expiry Management
        [EXPIRY_PERMISSIONS.VIEW_EXPIRY_ALERTS]: 'View drug expiry alerts',
        [EXPIRY_PERMISSIONS.MANAGE_EXPIRY_SETTINGS]:
            'Configure expiry alert settings',
        [EXPIRY_PERMISSIONS.DISPOSE_EXPIRED_DRUGS]: 'Dispose of expired drugs',

        // Manager Privileges
        [MANAGER_PERMISSIONS.MANAGE_BRANCH_STAFF]:
            'Manage staff within assigned branch',
        [MANAGER_PERMISSIONS.VIEW_BRANCH_ANALYTICS]:
            'View detailed branch performance analytics',
        [MANAGER_PERMISSIONS.APPROVE_DISCOUNTS]:
            'Approve special discounts and promotions',
        [MANAGER_PERMISSIONS.MANAGE_BRANCH_INVENTORY]:
            'Full inventory control for assigned branch',
        [MANAGER_PERMISSIONS.OVERRIDE_PRICES]:
            'Override system prices when necessary',
        [MANAGER_PERMISSIONS.APPROVE_REFUNDS]:
            'Approve refund requests and returns',
        [MANAGER_PERMISSIONS.MANAGE_SHIFT_SCHEDULES]:
            'Create and manage staff schedules',
        [MANAGER_PERMISSIONS.VIEW_STAFF_PERFORMANCE]:
            'View staff performance metrics and reports',
    };

    return descriptions[permission] || permission;
};

export default ALL_PERMISSIONS;
