import { Request, Response, NextFunction } from 'express';
import User from '../models/user.model';
import { UserService } from '../services/user.service';
import { successResponse } from '../utils/response';
import { UserRole } from '../types/auth.types';

const userService = new UserService();

// Admin level: Assign permissions to a user
export const assignPermissions = async (req: Request, res: Response) => {
    try {
        if (
            !req.user ||
            (req.user.role !== UserRole.ADMIN &&
                req.user.role !== UserRole.SUPER_ADMIN)
        ) {
            return res.status(403).json({
                success: false,
                message: 'Only admin level users can assign permissions',
            });
        }

        // Allow super admin to assign permissions even without pharmacyId (for initial setup)
        if (!req.user.pharmacyId && req.user.role !== UserRole.SUPER_ADMIN) {
            return res.status(400).json({
                success: false,
                message: 'Pharmacy ID is required',
            });
        }

        const { userId, permissions } = req.body;

        // Delegate to user service which uses auth service
        const user = await userService.assignPermissions(
            userId,
            permissions,
            req.user.pharmacyId || '', // Pass empty string for super admin without pharmacy
        );

        res.json({ success: true, user });
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

    constructor() {
        this.userService = new UserService();
    }

    async getUsers(req: Request, res: Response, next: NextFunction) {
        try {
            const { page = 1, limit = 10, search = '' } = req.query;
            const result = await this.userService.getUsers(
                {
                    page: Number(page),
                    limit: Number(limit),
                    search: String(search),
                },
                req.user?.role,
                req.user?.branchId,
                req.user?.pharmacyId, // Pass pharmacy ID for filtering
            );
            res.json(successResponse(result, 'Users retrieved successfully'));
        } catch (error) {
            next(error);
        }
    }

    async createUser(req: Request, res: Response, next: NextFunction) {
        try {
            // Allow super admin to create users even without pharmacyId (for initial setup)
            if (
                !req.user?.pharmacyId &&
                req.user?.role !== UserRole.SUPER_ADMIN
            ) {
                res.status(400).json({
                    success: false,
                    message: 'Pharmacy ID is required',
                });
                return;
            }

            const user = await this.userService.createUser(
                req.body,
                req.user?.pharmacyId || '', // Pass empty string for super admin without pharmacy
            );
            res.json(successResponse(user, 'User created successfully'));
        } catch (error) {
            next(error);
        }
    }

    async updateUser(req: Request, res: Response, next: NextFunction) {
        try {
            // Allow super admin to update users even without pharmacyId (for initial setup)
            if (
                !req.user?.pharmacyId &&
                req.user?.role !== UserRole.SUPER_ADMIN
            ) {
                res.status(400).json({
                    success: false,
                    message: 'Pharmacy ID is required',
                });
                return;
            }

            const user = await this.userService.updateUser(
                req.params.id,
                req.body,
                req.user?.pharmacyId || '', // Pass empty string for super admin without pharmacy
            );
            res.json(successResponse(user, 'User updated successfully'));
        } catch (error) {
            next(error);
        }
    }

    async deleteUser(req: Request, res: Response, next: NextFunction) {
        try {
            // Allow super admin to delete users even without pharmacyId (for initial setup)
            if (
                !req.user?.pharmacyId &&
                req.user?.role !== UserRole.SUPER_ADMIN
            ) {
                res.status(400).json({
                    success: false,
                    message: 'Pharmacy ID is required',
                });
                return;
            }

            await this.userService.deleteUser(
                req.params.id,
                req.user?.pharmacyId || '', // Pass empty string for super admin without pharmacy
            );
            res.json(successResponse(null, 'User deleted successfully'));
        } catch (error) {
            next(error);
        }
    }
}
