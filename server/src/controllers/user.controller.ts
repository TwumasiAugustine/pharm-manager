// Admin: Assign permissions to a user
import User from '../models/user.model';
export const assignPermissions = async (req: Request, res: Response) => {
    if (!req.user || req.user.role !== 'admin') {
        return res
            .status(403)
            .json({
                success: false,
                message: 'Only admin can assign permissions',
            });
    }
    const { userId, permissions } = req.body;
    const user = await User.findByIdAndUpdate(
        userId,
        { permissions },
        { new: true },
    );
    if (!user)
        return res
            .status(404)
            .json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
};
import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/user.service';
import { successResponse } from '../utils/response';

import User from '../models/user.model';

/**
 * Standalone handler to check if the current admin is in first setup mode.
 * Returns { isFirstSetup: boolean }
 */
export const checkAdminFirstSetup = async (req: Request, res: Response) => {
    try {
        // req.user is set by authenticate middleware
        if (!req.user || req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Forbidden: Only admin can check first setup status',
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
            const result = await this.userService.getUsers({
                page: Number(page),
                limit: Number(limit),
                search: String(search),
            });
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
