import express from 'express';

import {
    createBranch,
    getBranches,
    updateBranch,
    deleteBranch,
} from '../controllers/branch.controller';
import { authorize } from '../middlewares/authorize.middleware';
import { authenticate } from '../middlewares/auth.middleware';
import { UserRole } from '../types/auth.types';

const router = express.Router();

// All branch management endpoints are admin-only, require authentication first
router.post('/', authenticate, authorize([UserRole.ADMIN]), createBranch);
router.get('/', authenticate, authorize([UserRole.ADMIN]), getBranches);
router.put('/:id', authenticate, authorize([UserRole.ADMIN]), updateBranch);
router.delete('/:id', authenticate, authorize([UserRole.ADMIN]), deleteBranch);

export default router;
