import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../types/auth.types';
import { ForbiddenError } from '../utils/errors';

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
