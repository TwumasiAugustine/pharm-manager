import { Request, Response } from 'express';
import User, { IUserDoc } from '../models/user.model';
import PermissionService from '../services/permission.service';
import {
    ALL_PERMISSIONS,
    PERMISSION_CATEGORIES,
    ROLE_PERMISSIONS,
    Permission,
    getPermissionsByRole,
    getPermissionDescription,
} from '../constants/permissions';

/**
 * Permission Controller
 *
 * Handles API endpoints for permission management
 */
export class PermissionController {
    /**
     * Get all available permissions grouped by category
     */
    static async getAllPermissions(req: Request, res: Response) {
        try {
            const permissions = Object.entries(PERMISSION_CATEGORIES).map(
                ([key, category]) => ({
                    categoryKey: key,
                    name: category.name,
                    description: category.description,
                    icon: category.icon,
                    permissions: category.permissions.map((permission) => ({
                        key: permission,
                        name: permission,
                        description: getPermissionDescription(permission),
                    })),
                }),
            );

            res.json({
                success: true,
                data: permissions,
            });
        } catch (error) {
            console.error('Error getting permissions:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get permissions',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }

    /**
     * Get permissions for a specific role
     */
    static async getRolePermissions(req: Request, res: Response) {
        try {
            const { role } = req.params;

            if (
                !role ||
                !ROLE_PERMISSIONS[role as keyof typeof ROLE_PERMISSIONS]
            ) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid role specified',
                });
            }

            const permissions = getPermissionsByRole(
                role as keyof typeof ROLE_PERMISSIONS,
            );

            res.json({
                success: true,
                data: {
                    role,
                    permissions: permissions.map((permission) => ({
                        key: permission,
                        name: permission,
                        description: getPermissionDescription(permission),
                    })),
                },
            });
        } catch (error) {
            console.error('Error getting role permissions:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get role permissions',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }

    /**
     * Get user permissions (role-based + custom)
     */
    static async getUserPermissions(req: Request, res: Response) {
        try {
            const { userId } = req.params;
            const currentUser = req.user;

            if (!currentUser) {
                return res.status(401).json({
                    success: false,
                    message: 'Authentication required',
                });
            }

            // Find the target user
            const user = await User.findById(userId).select('-password');
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found',
                });
            }

            // Check if current user can view this user's permissions
            // For this check, we need to convert token to pseudo-doc for the permission check
            const currentUserForPermissionCheck = {
                ...currentUser,
                _id: currentUser.id,
            } as any;

            if (
                !PermissionService.canManageUserPermissions(
                    currentUserForPermissionCheck,
                    user,
                )
            ) {
                return res.status(403).json({
                    success: false,
                    message: 'Permission denied',
                });
            }

            const userPermissions = PermissionService.getUserPermissions(user);
            const rolePermissions = getPermissionsByRole(
                user.role as unknown as keyof typeof ROLE_PERMISSIONS,
            );
            const customPermissions =
                PermissionService.getCustomPermissions(user);

            res.json({
                success: true,
                data: {
                    user: {
                        id: user._id,
                        name: user.name,
                        email: user.email,
                        role: user.role,
                    },
                    permissions: {
                        all: userPermissions.map((permission) => ({
                            key: permission,
                            name: permission,
                            description: getPermissionDescription(permission),
                            source: rolePermissions.includes(permission)
                                ? 'role'
                                : 'custom',
                        })),
                        roleDefaults: rolePermissions,
                        custom: customPermissions,
                    },
                },
            });
        } catch (error) {
            console.error('Error getting user permissions:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get user permissions',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }

    /**
     * Update user permissions
     */
    static async updateUserPermissions(req: Request, res: Response) {
        try {
            const { userId } = req.params;
            const { permissions, resetToRoleDefaults } = req.body;
            const currentUser = req.user;

            if (!currentUser) {
                return res.status(401).json({
                    success: false,
                    message: 'Authentication required',
                });
            }

            // Validate input
            if (!permissions || !Array.isArray(permissions)) {
                return res.status(400).json({
                    success: false,
                    message: 'Permissions array is required',
                });
            }

            // Find the target user
            const user = await User.findById(userId).select('-password');
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found',
                });
            }

            // Check if current user can manage this user's permissions
            // For this check, we need to convert token to pseudo-doc for the permission check
            const currentUserForPermissionCheck = {
                ...currentUser,
                _id: currentUser.id,
            } as any;

            if (
                !PermissionService.canManageUserPermissions(
                    currentUserForPermissionCheck,
                    user,
                )
            ) {
                return res.status(403).json({
                    success: false,
                    message: 'Permission denied',
                });
            }

            // Validate permissions
            if (!PermissionService.validatePermissions(permissions)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid permissions provided',
                });
            }

            let newPermissions;

            if (resetToRoleDefaults) {
                // Reset to role defaults
                newPermissions = PermissionService.resetToRoleDefaults(user);
            } else {
                // Set custom permissions
                newPermissions = PermissionService.setCustomPermissions(
                    user,
                    permissions,
                );
            }

            // Update user
            user.permissions = newPermissions;
            await user.save();

            // Get updated permissions for response
            const updatedPermissions =
                PermissionService.getUserPermissions(user);
            const rolePermissions = getPermissionsByRole(
                user.role as unknown as keyof typeof ROLE_PERMISSIONS,
            );

            res.json({
                success: true,
                message: 'User permissions updated successfully',
                data: {
                    user: {
                        id: user._id,
                        name: user.name,
                        email: user.email,
                        role: user.role,
                    },
                    permissions: {
                        all: updatedPermissions.map((permission) => ({
                            key: permission,
                            name: permission,
                            description: getPermissionDescription(permission),
                            source: rolePermissions.includes(permission)
                                ? 'role'
                                : 'custom',
                        })),
                        roleDefaults: rolePermissions,
                        custom: PermissionService.getCustomPermissions(user),
                    },
                },
            });
        } catch (error) {
            console.error('Error updating user permissions:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update user permissions',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }

    /**
     * Add permissions to a user
     */
    static async addUserPermissions(req: Request, res: Response) {
        try {
            const { userId } = req.params;
            const { permissions } = req.body;
            const currentUser = req.user;

            if (!currentUser) {
                return res.status(401).json({
                    success: false,
                    message: 'Authentication required',
                });
            }

            // Validate input
            if (!permissions || !Array.isArray(permissions)) {
                return res.status(400).json({
                    success: false,
                    message: 'Permissions array is required',
                });
            }

            // Find the target user
            const user = await User.findById(userId).select('-password');
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found',
                });
            }

            // Check if current user can manage this user's permissions
            // For this check, we need to convert token to pseudo-doc for the permission check
            const currentUserForPermissionCheck = {
                ...currentUser,
                _id: currentUser.id,
            } as any;

            if (
                !PermissionService.canManageUserPermissions(
                    currentUserForPermissionCheck,
                    user,
                )
            ) {
                return res.status(403).json({
                    success: false,
                    message: 'Permission denied',
                });
            }

            // Validate permissions
            if (!PermissionService.validatePermissions(permissions)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid permissions provided',
                });
            }

            // Add permissions
            const newPermissions = PermissionService.addPermissions(
                user,
                permissions,
            );
            user.permissions = newPermissions;
            await user.save();

            res.json({
                success: true,
                message: 'Permissions added successfully',
                data: {
                    addedPermissions: permissions,
                    totalPermissions: newPermissions.length,
                },
            });
        } catch (error) {
            console.error('Error adding user permissions:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to add user permissions',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }

    /**
     * Remove permissions from a user
     */
    static async removeUserPermissions(req: Request, res: Response) {
        try {
            const { userId } = req.params;
            const { permissions } = req.body;
            const currentUser = req.user;

            if (!currentUser) {
                return res.status(401).json({
                    success: false,
                    message: 'Authentication required',
                });
            }

            // Validate input
            if (!permissions || !Array.isArray(permissions)) {
                return res.status(400).json({
                    success: false,
                    message: 'Permissions array is required',
                });
            }

            // Find the target user
            const user = await User.findById(userId).select('-password');
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found',
                });
            }

            // Check if current user can manage this user's permissions
            // For this check, we need to convert token to pseudo-doc for the permission check
            const currentUserForPermissionCheck = {
                ...currentUser,
                _id: currentUser.id,
            } as any;

            if (
                !PermissionService.canManageUserPermissions(
                    currentUserForPermissionCheck,
                    user,
                )
            ) {
                return res.status(403).json({
                    success: false,
                    message: 'Permission denied',
                });
            }

            // Remove permissions
            const newPermissions = PermissionService.removePermissions(
                user,
                permissions,
            );
            user.permissions = newPermissions;
            await user.save();

            res.json({
                success: true,
                message: 'Permissions removed successfully',
                data: {
                    removedPermissions: permissions,
                    totalPermissions: newPermissions.length,
                },
            });
        } catch (error) {
            console.error('Error removing user permissions:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to remove user permissions',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }

    /**
     * Check if current user has specific permission
     */
    static async checkPermission(req: Request, res: Response) {
        try {
            const { permission } = req.params;
            const currentUser = req.user;

            if (!currentUser) {
                return res.status(401).json({
                    success: false,
                    message: 'Authentication required',
                });
            }

            if (!permission) {
                return res.status(400).json({
                    success: false,
                    message: 'Permission parameter is required',
                });
            }

            const hasPermission = PermissionService.hasPermissionFromToken(
                currentUser,
                permission as Permission,
            );

            res.json({
                success: true,
                data: {
                    permission,
                    hasPermission,
                    user: {
                        id: currentUser.id,
                        name: currentUser.name,
                        role: currentUser.role,
                    },
                },
            });
        } catch (error) {
            console.error('Error checking permission:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to check permission',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }

    /**
     * Get current user's permissions
     */
    static async getCurrentUserPermissions(req: Request, res: Response) {
        try {
            const currentUser = req.user;

            if (!currentUser) {
                return res.status(401).json({
                    success: false,
                    message: 'Authentication required',
                });
            }

            const userPermissions =
                PermissionService.getUserPermissionsFromToken(currentUser);
            const rolePermissions = getPermissionsByRole(
                currentUser.role as keyof typeof ROLE_PERMISSIONS,
            );
            const customPermissions =
                PermissionService.getCustomPermissionsFromToken(currentUser);

            res.json({
                success: true,
                data: {
                    user: {
                        id: currentUser.id,
                        name: currentUser.name,
                        email: currentUser.email,
                        role: currentUser.role,
                    },
                    permissions: {
                        all: userPermissions.map((permission) => ({
                            key: permission,
                            name: permission,
                            description: getPermissionDescription(permission),
                            source: rolePermissions.includes(permission)
                                ? 'role'
                                : 'custom',
                        })),
                        roleDefaults: rolePermissions,
                        custom: customPermissions,
                    },
                },
            });
        } catch (error) {
            console.error('Error getting current user permissions:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get current user permissions',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }
}

export default PermissionController;
