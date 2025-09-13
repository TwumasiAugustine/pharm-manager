import { Request, Response, NextFunction } from 'express';
import User from '../models/user.model';
import { UserService } from '../services/user.service';
import { successResponse } from '../utils/response';
import { UserRole } from '../types/auth.types';

// Admin level: Assign permissions to a user
export const assignPermissions = async (req: Request, res: Response) => {
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
    const { userId, permissions } = req.body;

    // Get the user to check their role
    const targetUser = await User.findById(userId);
    if (!targetUser) {
        return res
            .status(404)
            .json({ success: false, message: 'User not found' });
    }

    // Prevent assigning FINALIZE_SALE permission to super admin
    if (
        targetUser.role === UserRole.SUPER_ADMIN || UserRole.ADMIN &&
        permissions.includes('FINALIZE_SALE')
    ) {
        return res.status(400).json({
            success: false,
            message: 'Super admin cannot have FINALIZE_SALE permission',
        });
    }

    const user = await User.findByIdAndUpdate(
        userId,
        { permissions },
        { new: true },
    );
    res.json({ success: true, user });
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
            (req.user.role !== 'admin' && req.user.role !== 'super_admin')
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
            );
            res.json(successResponse(result, 'Users retrieved successfully'));
        } catch (error) {
            next(error);
        }
    }

    async createUser(req: Request, res: Response, next: NextFunction) {
        try {
            const user = await this.userService.createUser(req.body);
            res.status(201).json(
                successResponse(user, 'User created successfully'),
            );
        } catch (error) {
            next(error);
        }
    }

    async updateUser(req: Request, res: Response, next: NextFunction) {
        try {
            const user = await this.userService.updateUser(
                req.params.id,
                req.body,
            );
            res.json(successResponse(user, 'User updated successfully'));
        } catch (error) {
            next(error);
        }
    }

    async deleteUser(req: Request, res: Response, next: NextFunction) {
        try {
            await this.userService.deleteUser(req.params.id);
            res.json(successResponse(null, 'User deleted successfully'));
        } catch (error) {
            next(error);
        }
    }
}
