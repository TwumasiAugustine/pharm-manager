import { Request, Response, NextFunction } from 'express';
import Branch from '../models/branch.model';
import { BadRequestError } from '../utils/errors';

/**
 * Middleware that ensures at least one branch exists for the pharmacy.
 * If no branches exist, block Admin/branch-level actions and return
 * a 400 with a helpful message.
 */
export async function ensureBranchesExist(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    try {
        const count = await Branch.countDocuments();
        if (count === 0) {
            // Return a consistent error shape used across the app
            return res.status(400).json({
                error: 'No branches available. Please create at least one branch before performing this action.',
            });
        }
        return next();
    } catch (err) {
        return next(err);
    }
}

export default ensureBranchesExist;
