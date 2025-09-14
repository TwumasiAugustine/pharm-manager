import api from './api';

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
        username: string;
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
        username: string;
        role: string;
    };
}

// Get all available permissions grouped by category
export const getAllPermissions = async (): Promise<PermissionCategory[]> => {
    const response = await api.get('/permissions');
    return response.data.data;
};

// Get permissions for a specific role
export const getRolePermissions = async (
    role: string,
): Promise<{ role: string; permissions: Permission[] }> => {
    const response = await api.get(`/permissions/role/${role}`);
    return response.data.data;
};

// Get current user's permissions
export const getCurrentUserPermissions = async (): Promise<UserPermissions> => {
    const response = await api.get('/permissions/current');
    return response.data.data;
};

// Check if current user has specific permission
export const checkPermission = async (
    permission: string,
): Promise<PermissionCheckResult> => {
    const response = await api.get(`/permissions/check/${permission}`);
    return response.data.data;
};

// Get permissions for a specific user
export const getUserPermissions = async (
    userId: string,
): Promise<UserPermissions> => {
    const response = await api.get(`/permissions/user/${userId}`);
    return response.data.data;
};

// Update user permissions
export const updateUserPermissions = async (
    userId: string,
    permissions: string[],
    resetToRoleDefaults?: boolean,
): Promise<UserPermissions> => {
    const response = await api.put(`/permissions/user/${userId}`, {
        permissions,
        resetToRoleDefaults,
    });
    return response.data.data;
};

// Add permissions to a user
export const addUserPermissions = async (
    userId: string,
    permissions: string[],
): Promise<{ addedPermissions: string[]; totalPermissions: number }> => {
    const response = await api.post(`/permissions/user/${userId}/add`, {
        permissions,
    });
    return response.data.data;
};

// Remove permissions from a user
export const removeUserPermissions = async (
    userId: string,
    permissions: string[],
): Promise<{ removedPermissions: string[]; totalPermissions: number }> => {
    const response = await api.post(`/permissions/user/${userId}/remove`, {
        permissions,
    });
    return response.data.data;
};

export default {
    getAllPermissions,
    getRolePermissions,
    getCurrentUserPermissions,
    checkPermission,
    getUserPermissions,
    updateUserPermissions,
    addUserPermissions,
    removeUserPermissions,
};
