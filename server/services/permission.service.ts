import User from '../models/user.model';
import type { IUserDoc } from '../models/user.model';
import { UserRole } from '../types/user.types';
import { ITokenPayload } from '../types/auth.types';
import {
    ALL_PERMISSIONS,
    ROLE_PERMISSIONS,
    MANAGER_PERMISSIONS,
    ROLE_HIERARCHY,
    isPermissionExcludedForRole,
    canCreateRole,
    canManageRole,
    getRoleScope,
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

        // Check if permission is excluded for this role
        if (isPermissionExcludedForRole(user.role, permission)) {
            return false;
        }

        // Super admin has system-level permissions only
        if (user.role === UserRole.SUPER_ADMIN) {
            const rolePermissions =
                ROLE_PERMISSIONS[user.role as keyof typeof ROLE_PERMISSIONS];
            return rolePermissions
                ? (rolePermissions as readonly string[]).includes(permission)
                : false;
        }

        // Check if user has the permission in their custom permissions array
        if (user.permissions && user.permissions.includes(permission)) {
            return true;
        }

        // Check manager permissions if user is a manager
        if (user.isManager && this.isManagerPermission(permission)) {
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
     * Check if a permission is a manager-specific permission
     */
    static isManagerPermission(permission: Permission): boolean {
        return Object.values(MANAGER_PERMISSIONS).includes(permission as any);
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

        // Get role-based permissions (now respects role hierarchy)
        const rolePermissions =
            ROLE_PERMISSIONS[user.role as keyof typeof ROLE_PERMISSIONS] || [];

        // Add manager permissions if user is a manager (but only if not excluded for their role)
        const managerPermissions = user.isManager
            ? Object.values(MANAGER_PERMISSIONS).filter(
                  (permission) =>
                      !isPermissionExcludedForRole(user.role, permission),
              )
            : [];

        // Add custom permissions (but only if not excluded for their role)
        const customPermissions = user.permissions
            ? user.permissions.filter(
                  (permission) =>
                      !isPermissionExcludedForRole(user.role, permission),
              )
            : [];

        // Combine all permissions and remove duplicates
        const allPermissions = [
            ...rolePermissions,
            ...managerPermissions,
            ...customPermissions,
        ];

        return [...new Set(allPermissions)] as Permission[];
    }

    /**
     * Check if a user can create another user of specified role
     */
    static canCreateUser(creatorUser: IUserDoc, targetRole: UserRole): boolean {
        return canCreateRole(creatorUser.role, targetRole);
    }

    /**
     * Check if a user can manage another user
     */
    static canManageUser(managerUser: IUserDoc, targetUser: IUserDoc): boolean {
        return canManageRole(managerUser.role, targetUser.role);
    }

    /**
     * Get the scope level for a user
     */
    static getUserScope(user: IUserDoc): 'system' | 'pharmacy' | 'branch' {
        return getRoleScope(user.role);
    }

    /**
     * Check if a permission is allowed for a role
     */
    static isPermissionAllowedForRole(
        role: UserRole,
        permission: string,
    ): boolean {
        return !isPermissionExcludedForRole(role, permission);
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
        user: IUserDoc,
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
    static resetToRoleDefaults(user: IUserDoc): Permission[] {
        const rolePermissions =
            ROLE_PERMISSIONS[user.role as keyof typeof ROLE_PERMISSIONS] || [];
        return [...rolePermissions] as Permission[];
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
    static canManageUserPermissions(
        manager: IUserDoc,
        targetUser: IUserDoc,
    ): boolean {
        // Super admin can manage anyone
        if (manager.role === UserRole.SUPER_ADMIN) {
            return true;
        }

        // Cannot manage super admin permissions
        if (targetUser.role === UserRole.SUPER_ADMIN) {
            return false;
        }

        // Admin can manage non-admin users
        if (
            manager.role === UserRole.ADMIN &&
            targetUser.role !== UserRole.ADMIN
        ) {
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

    // ====================
    // TOKEN PAYLOAD ADAPTERS
    // ====================
    // These methods work with ITokenPayload from JWT tokens to provide
    // type-safe permission checking without requiring database lookups

    /**
     * Check if a token user has a specific permission
     */
    static hasPermissionFromToken(
        tokenUser: ITokenPayload,
        permission: Permission,
    ): boolean {
        if (!tokenUser || !permission) {
            return false;
        }

        // Check if permission is excluded for this role
        if (isPermissionExcludedForRole(tokenUser.role, permission)) {
            return false;
        }

        // Get role-based permissions (respects hierarchy)
        const rolePermissions =
            ROLE_PERMISSIONS[tokenUser.role as keyof typeof ROLE_PERMISSIONS];

        // Check role permissions first
        if (
            rolePermissions &&
            (rolePermissions as readonly string[]).includes(permission)
        ) {
            return true;
        }

        // Check if user has the permission in their custom permissions array
        if (
            tokenUser.permissions &&
            tokenUser.permissions.includes(permission) &&
            !isPermissionExcludedForRole(tokenUser.role, permission)
        ) {
            return true;
        }

        return false;
    }

    /**
     * Check if a token user has any of the specified permissions
     */
    static hasAnyPermissionFromToken(
        tokenUser: ITokenPayload,
        permissions: Permission[],
    ): boolean {
        return permissions.some((permission) =>
            this.hasPermissionFromToken(tokenUser, permission),
        );
    }

    /**
     * Check if a token user has all of the specified permissions
     */
    static hasAllPermissionsFromToken(
        tokenUser: ITokenPayload,
        permissions: Permission[],
    ): boolean {
        return permissions.every((permission) =>
            this.hasPermissionFromToken(tokenUser, permission),
        );
    }

    /**
     * Get all permissions for a token user (role-based + custom)
     */
    static getUserPermissionsFromToken(tokenUser: ITokenPayload): Permission[] {
        if (!tokenUser) {
            return [];
        }

        // Get role-based permissions (now respects role hierarchy)
        const rolePermissions =
            ROLE_PERMISSIONS[tokenUser.role as keyof typeof ROLE_PERMISSIONS] ||
            [];

        // Add custom permissions (but only if not excluded for their role)
        const customPermissions = tokenUser.permissions
            ? tokenUser.permissions.filter(
                  (permission) =>
                      !isPermissionExcludedForRole(tokenUser.role, permission),
              )
            : [];

        // Combine all permissions and remove duplicates
        const allPermissions = [...rolePermissions, ...customPermissions];

        return [...new Set(allPermissions)] as Permission[];
    }

    /**
     * Get permissions that are explicitly granted beyond role defaults
     */
    static getCustomPermissionsFromToken(
        tokenUser: ITokenPayload,
    ): Permission[] {
        if (!tokenUser || !tokenUser.permissions) {
            return [];
        }

        const rolePermissions =
            ROLE_PERMISSIONS[tokenUser.role as keyof typeof ROLE_PERMISSIONS] ||
            [];

        // Filter out permissions that are already granted by role
        const customOnly = tokenUser.permissions.filter(
            (permission) =>
                !(rolePermissions as readonly string[]).includes(permission),
        );

        return customOnly as Permission[];
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

        if (!PermissionService.hasPermissionFromToken(user, permission)) {
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

        if (!PermissionService.hasAnyPermissionFromToken(user, permissions)) {
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

        if (!PermissionService.hasAllPermissionsFromToken(user, permissions)) {
            return res.status(403).json({
                success: false,
                message: `Permission denied. Required permissions: ${permissions.join(', ')}`,
            });
        }

        next();
    };
};

export default PermissionService;
