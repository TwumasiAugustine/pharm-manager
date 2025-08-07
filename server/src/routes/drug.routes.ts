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

// Get drug types (available to all authenticated users)
router.get('/types', drugController.getDrugTypes.bind(drugController));

// Get dosage forms (available to all authenticated users)
router.get('/dosage-forms', drugController.getDosageForms.bind(drugController));

// Get expiring drugs (available to all authenticated users)
router.get('/expiring', drugController.getExpiringDrugs.bind(drugController));

// Get all drugs (available to all authenticated users)
router.get('/', drugController.getDrugs.bind(drugController));

// Get a specific drug (available to all authenticated users)
router.get('/:id', drugController.getDrug.bind(drugController));

// Calculate package pricing for a drug (available to all authenticated users)
router.get('/:id/pricing', drugController.calculatePackagePricing.bind(drugController));

// Create, update, and delete operations are restricted to admin and pharmacist roles
router.use(authorize(UserRole.ADMIN, UserRole.PHARMACIST));

// Create a new drug
router.post('/', drugController.createDrug.bind(drugController));

// Update a drug
router.put('/:id', drugController.updateDrug.bind(drugController));

// Delete a drug
router.delete('/:id', drugController.deleteDrug.bind(drugController));

export default router;
