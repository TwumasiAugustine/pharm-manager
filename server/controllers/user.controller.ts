import { Request, Response, NextFunction } from 'express';
import User from '../models/user.model';
import { UserService } from '../services/user.service';
import { UserManagementService } from '../services/user-management.service';
import { PermissionService } from '../services/permission.service';
import { successResponse } from '../utils/response';
import { UserRole } from '../types/user.types';
import { canCreateRole, canManageRole } from '../constants/permissions';
import { trackActivity } from '../utils/activity-tracker';

const userService = new UserService();

// Admin level: Assign permissions to a user
export const assignPermissions = async (req: Request, res: Response) => {
    try {
        const currentUser = req.user;
        const { userId, permissions } = req.body;

        if (!currentUser) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required',
            });
        }

        // Get target user to check if current user can manage them
        const targetUser = await User.findById(userId);
        if (!targetUser) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        // Check if current user can manage the target user
        if (!canManageRole(currentUser.role, targetUser.role)) {
            return res.status(403).json({
                success: false,
                message: `You do not have permission to manage ${targetUser.role} users`,
            });
        }

        // Super Admin can assign permissions to admins
        // Admin can assign permissions to pharmacists and cashiers
        if (
            (currentUser.role === UserRole.SUPER_ADMIN &&
                targetUser.role === UserRole.ADMIN) ||
            (currentUser.role === UserRole.ADMIN &&
                (targetUser.role === UserRole.PHARMACIST ||
                    targetUser.role === UserRole.CASHIER))
        ) {
            // Filter permissions to only allow those appropriate for the target role
            const filteredPermissions = permissions.filter(
                (permission: string) =>
                    PermissionService.isPermissionAllowedForRole(
                        targetUser.role,
                        permission,
                    ),
            );

            const user = await userService.assignPermissions(
                userId,
                filteredPermissions,
                currentUser.pharmacyId || '',
            );

            res.json({ success: true, user });
        } else {
            return res.status(403).json({
                success: false,
                message:
                    'You do not have permission to assign permissions to this user',
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : 'Internal server error',
        });
    }
};

/**
 * Standalone handler to check if the current admin is in first setup mode.
 * Returns { isFirstSetup: boolean }
 */
export const checkAdminFirstSetup = async (req: Request, res: Response) => {
    try {
        // req.user is set by authenticate middleware
        if (
            !req.user ||
            (req.user.role !== UserRole.ADMIN &&
                req.user.role !== UserRole.SUPER_ADMIN)
        ) {
            return res.status(403).json({
                success: false,
                message:
                    'Forbidden: Only admin level users can check first setup status',
            });
        }
        const user = await User.findById(req.user.id);
        res.json({
            success: true,
            isFirstSetup: !!user?.isFirstSetup,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to check admin first setup status',
        });
    }
};

export class UserController {
    private userService: UserService;
    private userManagementService: UserManagementService;

    constructor() {
        this.userService = new UserService();
        this.userManagementService = new UserManagementService();
    }

    async getUsers(req: Request, res: Response, next: NextFunction) {
        try {
            const {
                page = 1,
                limit = 10,
                search,
                role,
                branchId,
                isActive,
            } = req.query;
            const result = await this.userManagementService.getUsers(
                req.user?.id || '',
                Number(page),
                Number(limit),
                {
                    search: search as string,
                    role: role as UserRole,
                    branchId: branchId as string,
                    isActive:
                        isActive !== undefined ? Boolean(isActive) : undefined,
                },
            );

            // Track user list viewing activity
            if (req.user) {
                trackActivity(req.user.id, 'VIEW', 'USER', {
                    endpoint: req.path,
                    method: req.method,
                    action: 'getUsers',
                    pagination: {
                        page: Number(page),
                        limit: Number(limit),
                    },
                    filters: {
                        search: search as string,
                        role: role as UserRole,
                        branchId: branchId as string,
                        isActive: isActive,
                    },
                    resultCount: result.users?.length || 0,
                    totalCount: result.pagination?.total || 0,
                });
            }

            res.json(successResponse(result, 'Users retrieved successfully'));
        } catch (error) {
            next(error);
        }
    }

    async createUser(req: Request, res: Response, next: NextFunction) {
        try {
            const { role: targetRole } = req.body;

            // Check if current user can create the target role
            if (!req.user?.role || !canCreateRole(req.user.role, targetRole)) {
                return res.status(403).json({
                    success: false,
                    message: `You do not have permission to create ${targetRole} users`,
                });
            }

            let user;

            // Super Admin can create Admins
            if (
                req.user?.role === UserRole.SUPER_ADMIN &&
                targetRole === UserRole.ADMIN
            ) {
                user = await this.userManagementService.createAdminUser(
                    req.body,
                    req.user.id,
                    req.body.pharmacyId,
                );
            }
            // Admin can create Pharmacist/Cashier
            else if (
                req.user?.role === UserRole.ADMIN &&
                (targetRole === UserRole.PHARMACIST ||
                    targetRole === UserRole.CASHIER)
            ) {
                user = await this.userManagementService.createPharmacyUser(
                    req.body,
                    req.user.id,
                );
            } else {
                return res.status(403).json({
                    success: false,
                    message:
                        'Insufficient permissions to create this type of user',
                });
            }

            // Track user creation activity
            if (req.user && user) {
                trackActivity(req.user.id, 'CREATE', 'USER', {
                    endpoint: req.path,
                    method: req.method,
                    action: 'createUser',
                    resourceId: user._id?.toString() || user.id,
                    resourceName: user.name,
                    createdUserId: user._id || user.id,
                    userData: {
                        fullName: user.name,
                        email: user.email,
                        role: user.role,
                        branchId: user.branch,
                        pharmacyId: user.pharmacyId,
                    },
                    targetRole: targetRole,
                    creatorRole: req.user.role,
                });
            }

            res.json(successResponse(user, 'User created successfully'));
        } catch (error) {
            next(error);
        }
    }

    async updateUser(req: Request, res: Response, next: NextFunction) {
        try {
            const user = await this.userManagementService.updateUser(
                req.params.id,
                req.body,
                req.user?.id || '',
            );

            // Track user update activity
            if (req.user && user) {
                trackActivity(req.user.id, 'UPDATE', 'USER', {
                    endpoint: req.path,
                    method: req.method,
                    action: 'updateUser',
                    resourceId: req.params.id,
                    resourceName: user.name,
                    targetUserId: req.params.id,
                    updatedFields: Object.keys(req.body),
                    updatedData: {
                        fullName: user.name,
                        email: user.email,
                        role: user.role,
                        isActive: user.isActive,
                    },
                    updaterRole: req.user.role,
                });
            }

            res.json(successResponse(user, 'User updated successfully'));
        } catch (error) {
            next(error);
        }
    }

    async deleteUser(req: Request, res: Response, next: NextFunction) {
        try {
            const user = await this.userManagementService.deactivateUser(
                req.params.id,
                req.user?.id || '',
            );

            // Track user deactivation activity
            if (req.user && user) {
                trackActivity(req.user.id, 'DELETE', 'USER', {
                    endpoint: req.path,
                    method: req.method,
                    action: 'deactivateUser',
                    resourceId: req.params.id,
                    resourceName: user.name,
                    targetUserId: req.params.id,
                    deactivatedUser: {
                        fullName: user.name,
                        email: user.email,
                        role: user.role,
                        previousStatus: 'active',
                    },
                    deactivatorRole: req.user.role,
                });
            }

            res.json(successResponse(user, 'User deactivated successfully'));
        } catch (error) {
            next(error);
        }
    }

    async getUserStats(req: Request, res: Response, next: NextFunction) {
        try {
            const stats = await this.userManagementService.getUserStats(
                req.user?.id || '',
            );

            // Track user stats viewing activity
            if (req.user) {
                trackActivity(req.user.id, 'VIEW', 'USER', {
                    endpoint: req.path,
                    method: req.method,
                    action: 'getUserStats',
                    statsData: {
                        totalUsers: stats.totalUsers,
                        activeUsers: stats.activeUsers,
                        roleDistribution: stats.roleDistribution,
                    },
                });
            }

            res.json(
                successResponse(
                    stats,
                    'User statistics retrieved successfully',
                ),
            );
        } catch (error) {
            next(error);
        }
    }
}
