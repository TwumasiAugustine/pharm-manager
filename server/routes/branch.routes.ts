import express from 'express';

import {
    createBranch,
    getBranches,
    updateBranch,
    deleteBranch,
} from '../controllers/branch.controller';
import {
    authorizeAdminLevel,
    authorizeAuthenticated,
} from '../middlewares/authorize.middleware';
import { authenticate } from '../middlewares/auth.middleware';

const router = express.Router();

// Branch creation, update, and deletion require admin level access
router.post('/', authenticate, authorizeAdminLevel(), createBranch);
router.put('/:id', authenticate, authorizeAdminLevel(), updateBranch);
router.delete('/:id', authenticate, authorizeAdminLevel(), deleteBranch);

// Branch listing is available to all authenticated users (for dropdowns, displays)
router.get('/', authenticate, authorizeAuthenticated(), getBranches);

export default router;
