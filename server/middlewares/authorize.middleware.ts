import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../types/user.types';
import { ForbiddenError } from '../utils/errors';
import {
    canCreateRole,
    canManageRole,
    getRoleScope,
} from '../constants/permissions';

export const authorize = (allowedRoles: UserRole[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const user = req.user;

        if (!user || !user.role) {
            return next(new ForbiddenError('Authentication error'));
        }

        if (!allowedRoles.includes(user.role)) {
            return next(
                new ForbiddenError(
                    'You do not have permission to perform this action',
                ),
            );
        }

        next();
    };
};

/**
 * Middleware to authorize super admin only
 */
export const authorizeSuperAdmin = () => {
    return (req: Request, res: Response, next: NextFunction) => {
        const user = req.user;

        if (!user || user.role !== UserRole.SUPER_ADMIN) {
            return next(
                new ForbiddenError(
                    'Super admin access required for this action',
                ),
            );
        }

        next();
    };
};

/**
 * Middleware to authorize admin level (admin or super_admin)
 */
export const authorizeAdminLevel = () => {
    return (req: Request, res: Response, next: NextFunction) => {
        const user = req.user;

        if (
            !user ||
            (user.role !== UserRole.ADMIN && user.role !== UserRole.SUPER_ADMIN)
        ) {
            return next(
                new ForbiddenError(
                    'Admin level access required for this action',
                ),
            );
        }

        next();
    };
};

/**
 * Middleware to authorize all authenticated users for read operations
 * This allows cashiers and pharmacists to read necessary information
 */
export const authorizeAuthenticated = () => {
    return (req: Request, res: Response, next: NextFunction) => {
        const user = req.user;

        if (!user || !user.role) {
            return next(new ForbiddenError('Authentication required'));
        }

        next();
    };
};

/**
 * Middleware to check if user can create users of a specific role
 */
export const authorizeUserCreation = (targetRole: UserRole) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const user = req.user;

        if (!user || !user.role) {
            return next(new ForbiddenError('Authentication required'));
        }

        if (!canCreateRole(user.role, targetRole)) {
            return next(
                new ForbiddenError(
                    `You do not have permission to create ${targetRole} users`,
                ),
            );
        }

        next();
    };
};

/**
 * Middleware to check if user can manage users of a specific role
 */
export const authorizeUserManagement = (targetRole: UserRole) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const user = req.user;

        if (!user || !user.role) {
            return next(new ForbiddenError('Authentication required'));
        }

        if (!canManageRole(user.role, targetRole)) {
            return next(
                new ForbiddenError(
                    `You do not have permission to manage ${targetRole} users`,
                ),
            );
        }

        next();
    };
};

/**
 * Middleware to check scope access (system/pharmacy/branch)
 */
export const authorizeScope = (
    requiredScope: 'system' | 'pharmacy' | 'branch',
) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const user = req.user;

        if (!user || !user.role) {
            return next(new ForbiddenError('Authentication required'));
        }

        const userScope = getRoleScope(user.role);

        // System scope can access everything
        if (userScope === 'system') {
            return next();
        }

        // Pharmacy scope can access pharmacy and branch
        if (
            userScope === 'pharmacy' &&
            (requiredScope === 'pharmacy' || requiredScope === 'branch')
        ) {
            return next();
        }

        // Branch scope can only access branch
        if (userScope === 'branch' && requiredScope === 'branch') {
            return next();
        }

        return next(
            new ForbiddenError(
                `Insufficient scope. Required: ${requiredScope}, Current: ${userScope}`,
            ),
        );
    };
};
