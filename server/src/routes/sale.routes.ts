import { Router } from 'express';
import { SaleController } from '../controllers/sale.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/authorize.middleware';
import { UserRole } from '../types/auth.types';
import { validate } from '../middlewares/validation.middleware';
import { createSaleSchema } from '../validations/sale.validation';
import { csrfProtection } from '../middlewares/csrf.middleware';

const router = Router();
const saleController = new SaleController();
// Get sale by short code (for cashier)
router.get('/shortcode/:code', authenticate, saleController.getSaleByShortCode);

// Finalize/print sale by short code (for cashier)
router.post(
    '/finalize',
    authenticate,
    csrfProtection,
    saleController.finalizeSaleByShortCode,
);

// Create a new sale
router.post(
    '/',
    authenticate,
    csrfProtection,
    authorize([UserRole.ADMIN, UserRole.PHARMACIST]),
    validate(createSaleSchema),
    saleController.createSale,
);

// Get all sales with filtering and pagination
router.get(
    '/',
    authenticate,
    authorize([UserRole.ADMIN, UserRole.PHARMACIST]),
    saleController.getSales,
);

// Get a specific sale by ID
router.get(
    '/:id',
    authenticate,
    authorize([UserRole.ADMIN, UserRole.PHARMACIST]),
    saleController.getSaleById,
);

// TODO: Add PDF receipt endpoint
// router.get('/:id/receipt', ...)

export default router;
