import { csrfProtection } from '../middlewares/csrf.middleware';
import { Router } from 'express';
import { DrugController } from '../controllers/drug.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/authorize.middleware';
import { requirePermission } from '../services/permission.service';
import { DRUG_PERMISSIONS } from '../constants/permissions';
import { UserRole } from '../types/user.types';

const router = Router();
const drugController = new DrugController();

// All drug routes require authentication
router.use(authenticate);

// Get categories (available to all authenticated users)
router.get('/categories', drugController.getCategories.bind(drugController));

// Get expiring drugs (available to all authenticated users)
router.get('/expiring', drugController.getExpiringDrugs.bind(drugController));

// Get all drugs (available to all authenticated users)
router.get('/', drugController.getDrugs.bind(drugController));

// Get a specific drug (available to all authenticated users)
router.get('/:id', drugController.getDrug.bind(drugController));

// Create a new drug (Admin and Pharmacist can create drugs)
router.post(
    '/',
    csrfProtection,
    requirePermission(DRUG_PERMISSIONS.CREATE_DRUG),
    drugController.createDrug.bind(drugController),
);

// Update a drug (Admin and Pharmacist can update drugs)
router.put(
    '/:id',
    csrfProtection,
    requirePermission(DRUG_PERMISSIONS.UPDATE_DRUG),
    drugController.updateDrug.bind(drugController),
);

// Delete a drug (Admin only for safety)
router.delete(
    '/:id',
    csrfProtection,
    requirePermission(DRUG_PERMISSIONS.DELETE_DRUG),
    drugController.deleteDrug.bind(drugController),
);

export default router;
