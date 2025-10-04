import express from 'express';

import {
    createBranch,
    getBranches,
    updateBranch,
    deleteBranch,
} from '../controllers/branch.controller';
import { authorizeAuthenticated } from '../middlewares/authorize.middleware';
import { requirePermission } from '../services/permission.service';
import { BRANCH_PERMISSIONS } from '../constants/permissions';
import { authenticate } from '../middlewares/auth.middleware';

const router = express.Router();

// Branch creation and management (Admin only - operational responsibility)
router.post(
    '/',
    authenticate,
    requirePermission(BRANCH_PERMISSIONS.CREATE_BRANCH),
    createBranch,
);
router.put(
    '/:id',
    authenticate,
    requirePermission(BRANCH_PERMISSIONS.UPDATE_BRANCH),
    updateBranch,
);
router.delete(
    '/:id',
    authenticate,
    requirePermission(BRANCH_PERMISSIONS.DELETE_BRANCH),
    deleteBranch,
);

// Branch listing is available to all authenticated users (for dropdowns, displays, and Super Admin oversight)
router.get(
    '/',
    authenticate,
    requirePermission(BRANCH_PERMISSIONS.VIEW_BRANCHES),
    getBranches,
);

export default router;
