import { csrfProtection } from '../middlewares/csrf.middleware';
import { Router } from 'express';
import { DrugController } from '../controllers/drug.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/auth.middleware';
import { UserRole } from '../types/auth.types';

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

// Create, update, and delete operations are restricted to admin and pharmacist roles
router.use(authorize(UserRole.ADMIN, UserRole.PHARMACIST));

// Create a new drug
router.post(
    '/',
    csrfProtection,
    drugController.createDrug.bind(drugController),
);

// Update a drug
router.put(
    '/:id',
    csrfProtection,
    drugController.updateDrug.bind(drugController),
);

// Delete a drug
router.delete(
    '/:id',
    csrfProtection,
    drugController.deleteDrug.bind(drugController),
);

export default router;
