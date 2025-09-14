import User from '../models/user.model';
import type { IUserDoc } from '../types/user.types';
import {
    ALL_PERMISSIONS,
    ROLE_PERMISSIONS,
    Permission,
} from '../constants/permissions';

/**
 * Permission Service
 *
 * Handles permission checking, validation, and management for users
 */
export class PermissionService {
    /**
     * Check if a user has a specific permission
     */
    static hasPermission(user: IUserDoc, permission: Permission): boolean {
        if (!user || !permission) {
            return false;
        }

        // Super admin has all permissions
        if (user.role === 'SUPER_ADMIN') {
            return true;
        }

        // Check if user has the permission in their custom permissions array
        if (user.permissions && user.permissions.includes(permission)) {
            return true;
        }

        // Check if user's role has the permission by default
        const rolePermissions =
            ROLE_PERMISSIONS[user.role as keyof typeof ROLE_PERMISSIONS];
        return rolePermissions
            ? (rolePermissions as readonly string[]).includes(permission)
            : false;
    }

    /**
     * Check if a user has any of the specified permissions
     */
    static hasAnyPermission(
        user: IUserDoc,
        permissions: Permission[],
    ): boolean {
        return permissions.some((permission) =>
            this.hasPermission(user, permission),
        );
    }

    /**
     * Check if a user has all of the specified permissions
     */
    static hasAllPermissions(
        user: IUserDoc,
        permissions: Permission[],
    ): boolean {
        return permissions.every((permission) =>
            this.hasPermission(user, permission),
        );
    }

    /**
     * Get all permissions for a user (role-based + custom)
     */
    static getUserPermissions(user: IUserDoc): Permission[] {
        if (!user) {
            return [];
        }

        // Super admin has all permissions
        if (user.role === 'SUPER_ADMIN') {
            return Object.values(ALL_PERMISSIONS);
        }

        // Get role-based permissions
        const rolePermissions =
            ROLE_PERMISSIONS[user.role as keyof typeof ROLE_PERMISSIONS] || [];

        // Combine with custom permissions (avoid duplicates)
        const customPermissions = user.permissions || [];
        const allPermissions = [
            ...new Set([...rolePermissions, ...customPermissions]),
        ];

        return allPermissions as Permission[];
    }

    /**
     * Get permissions that are explicitly granted beyond role defaults
     */
    static getCustomPermissions(user: IUserDoc): Permission[] {
        if (!user || !user.permissions) {
            return [];
        }

        const rolePermissions =
            ROLE_PERMISSIONS[user.role as keyof typeof ROLE_PERMISSIONS] || [];
        return user.permissions.filter(
            (permission: string) =>
                !(rolePermissions as readonly string[]).includes(permission),
        ) as Permission[];
    }

    /**
     * Get permissions that are removed from role defaults
     */
    static getRemovedPermissions(user: IUserDoc): Permission[] {
        if (!user) {
            return [];
        }

        const rolePermissions =
            ROLE_PERMISSIONS[user.role as keyof typeof ROLE_PERMISSIONS] || [];
        const userPermissions = user.permissions || [];

        return rolePermissions.filter(
            (permission) => !userPermissions.includes(permission),
        ) as Permission[];
    }

    /**
     * Validate if permissions are valid
     */
    static validatePermissions(permissions: string[]): boolean {
        const validPermissions = Object.values(ALL_PERMISSIONS);
        return permissions.every((permission) =>
            validPermissions.includes(permission as Permission),
        );
    }

    /**
     * Add permissions to a user
     */
    static addPermissions(
        user: IUserDoc,
        permissions: Permission[],
    ): Permission[] {
        const currentPermissions = user.permissions || [];
        const rolePermissions =
            ROLE_PERMISSIONS[user.role as keyof typeof ROLE_PERMISSIONS] || [];

        // Combine all permissions and remove duplicates
        const allPermissions = [
            ...new Set([
                ...rolePermissions,
                ...currentPermissions,
                ...permissions,
            ]),
        ];

        return allPermissions as Permission[];
    }

    /**
     * Remove permissions from a user
     */
    static removePermissions(
        user: IUserDoc,
        permissions: Permission[],
    ): Permission[] {
        const currentPermissions = user.permissions || [];
        const rolePermissions =
            ROLE_PERMISSIONS[user.role as keyof typeof ROLE_PERMISSIONS] || [];

        // Start with role permissions and current custom permissions
        let allPermissions = [
            ...new Set([...rolePermissions, ...currentPermissions]),
        ];

        // Remove specified permissions
        allPermissions = allPermissions.filter(
            (permission) => !permissions.includes(permission as Permission),
        );

        return allPermissions as Permission[];
    }

    /**
     * Set custom permissions for a user (override role defaults)
     */
    static setCustomPermissions(
        user: User,
        permissions: Permission[],
    ): Permission[] {
        // Validate permissions
        if (!this.validatePermissions(permissions)) {
            throw new Error('Invalid permissions provided');
        }

        return permissions;
    }

    /**
     * Reset user permissions to role defaults
     */
    static resetToRoleDefaults(user: User): Permission[] {
        const rolePermissions =
            ROLE_PERMISSIONS[user.role as keyof typeof ROLE_PERMISSIONS] || [];
        return rolePermissions as Permission[];
    }

    /**
     * Get permission diff between current and new permissions
     */
    static getPermissionDiff(
        currentPermissions: Permission[],
        newPermissions: Permission[],
    ) {
        const added = newPermissions.filter(
            (permission) => !currentPermissions.includes(permission),
        );
        const removed = currentPermissions.filter(
            (permission) => !newPermissions.includes(permission),
        );

        return { added, removed };
    }

    /**
     * Check if user can manage another user's permissions
     */
    static canManageUserPermissions(manager: User, targetUser: User): boolean {
        // Super admin can manage anyone
        if (manager.role === 'SUPER_ADMIN') {
            return true;
        }

        // Cannot manage super admin permissions
        if (targetUser.role === 'SUPER_ADMIN') {
            return false;
        }

        // Admin can manage non-admin users
        if (manager.role === 'ADMIN' && targetUser.role !== 'ADMIN') {
            return true;
        }

        // Check if manager has MANAGE_PERMISSIONS permission
        return this.hasPermission(manager, 'MANAGE_PERMISSIONS' as Permission);
    }

    /**
     * Get allowed permissions for a role
     */
    static getAllowedPermissionsForRole(role: string): readonly Permission[] {
        return ROLE_PERMISSIONS[role as keyof typeof ROLE_PERMISSIONS] || [];
    }

    /**
     * Check if a permission is available for a specific role
     */
    static isPermissionAvailableForRole(
        role: string,
        permission: Permission,
    ): boolean {
        const rolePermissions =
            ROLE_PERMISSIONS[role as keyof typeof ROLE_PERMISSIONS] || [];
        return (rolePermissions as readonly string[]).includes(permission);
    }
}

// Export middleware function for route protection
export const requirePermission = (permission: Permission) => {
    return (req: any, res: any, next: any) => {
        const user = req.user;

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required',
            });
        }

        if (!PermissionService.hasPermission(user, permission)) {
            return res.status(403).json({
                success: false,
                message: `Permission denied. Required permission: ${permission}`,
            });
        }

        next();
    };
};

// Export middleware function for multiple permissions (any)
export const requireAnyPermission = (permissions: Permission[]) => {
    return (req: any, res: any, next: any) => {
        const user = req.user;

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required',
            });
        }

        if (!PermissionService.hasAnyPermission(user, permissions)) {
            return res.status(403).json({
                success: false,
                message: `Permission denied. Required permissions: ${permissions.join(', ')}`,
            });
        }

        next();
    };
};

// Export middleware function for multiple permissions (all)
export const requireAllPermissions = (permissions: Permission[]) => {
    return (req: any, res: any, next: any) => {
        const user = req.user;

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required',
            });
        }

        if (!PermissionService.hasAllPermissions(user, permissions)) {
            return res.status(403).json({
                success: false,
                message: `Permission denied. Required permissions: ${permissions.join(', ')}`,
            });
        }

        next();
    };
};

export default PermissionService;
