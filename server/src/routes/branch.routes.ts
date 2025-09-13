import express from 'express';

import {
    createBranch,
    getBranches,
    updateBranch,
    deleteBranch,
} from '../controllers/branch.controller';
import { authorizeAdminLevel } from '../middlewares/authorize.middleware';
import { authenticate } from '../middlewares/auth.middleware';

const router = express.Router();

// All branch management endpoints require admin level access (admin or super_admin)
router.post('/', authenticate, authorizeAdminLevel(), createBranch);
router.get('/', authenticate, authorizeAdminLevel(), getBranches);
router.put('/:id', authenticate, authorizeAdminLevel(), updateBranch);
router.delete('/:id', authenticate, authorizeAdminLevel(), deleteBranch);

export default router;
