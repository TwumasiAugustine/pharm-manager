import { Router } from 'express';
import { SaleController } from '../controllers/sale.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/authorize.middleware';
import { requirePermission } from '../services/permission.service';
import { SALES_PERMISSIONS } from '../constants/permissions';
import { UserRole } from '../types/user.types';
import { validate } from '../middlewares/validation.middleware';
import { createSaleSchema } from '../validations/sale.validation';
import { csrfProtection } from '../middlewares/csrf.middleware';

const router = Router();
const saleController = new SaleController();
// Get sale by short code (for cashier)
router.get('/shortcode/:code', authenticate, saleController.getSaleByShortCode);

// Finalize/print sale by short code (operational staff only)
router.post(
    '/finalize',
    authenticate,
    csrfProtection,
    requirePermission(SALES_PERMISSIONS.FINALIZE_SALE),
    saleController.finalizeSaleByShortCode,
);

// Create a new sale (operational staff only)
router.post(
    '/',
    authenticate,
    csrfProtection,
    requirePermission(SALES_PERMISSIONS.CREATE_SALE),
    // Ensure there's at least one branch before allowing sale creation
    // (prevents actions that require branch context)
    require('../middlewares/ensure-branches.middleware').ensureBranchesExist,
    validate(createSaleSchema),
    saleController.createSale,
);

// Get all sales with filtering and pagination (operational staff only)
router.get(
    '/',
    authenticate,
    requirePermission(SALES_PERMISSIONS.VIEW_SALES),
    saleController.getSales,
);

// Get a specific sale by ID (operational staff only)
router.get(
    '/:id',
    authenticate,
    requirePermission(SALES_PERMISSIONS.VIEW_SALES),
    saleController.getSaleById,
);

// TODO: Add PDF receipt endpoint
// router.get('/:id/receipt', ...)

export default router;
