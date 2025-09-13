import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../types/auth.types';
import { ForbiddenError } from '../utils/errors';

export const authorize = (allowedRoles: UserRole[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const user = req.user;

        if (!user || !user.role) {
            return next(new ForbiddenError('Authentication error'));
        }

        // Super admin has access to everything
        if (user.role === UserRole.SUPER_ADMIN) {
            next();
            return;
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
