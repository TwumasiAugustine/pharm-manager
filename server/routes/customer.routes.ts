import { Router } from 'express';
import { CustomerController } from '../controllers/customer.controller';
import { csrfProtection } from '../middlewares/csrf.middleware';
import { authenticate } from '../middlewares/auth.middleware';
import { requirePermission } from '../services/permission.service';
import { CUSTOMER_PERMISSIONS } from '../constants/permissions';

const router = Router();
const customerController = new CustomerController();

// All customer routes require authentication
router.use(authenticate);

// Customer CRUD operations (operational staff only)
router.post(
    '/',
    csrfProtection,
    requirePermission(CUSTOMER_PERMISSIONS.CREATE_CUSTOMER),
    customerController.createCustomer,
);
router.get(
    '/',
    requirePermission(CUSTOMER_PERMISSIONS.VIEW_CUSTOMERS),
    customerController.getCustomers,
);
router.get(
    '/search',
    requirePermission(CUSTOMER_PERMISSIONS.VIEW_CUSTOMERS),
    customerController.searchCustomers,
);
router.get(
    '/:id',
    requirePermission(CUSTOMER_PERMISSIONS.VIEW_CUSTOMERS),
    customerController.getCustomerById,
);
router.put(
    '/:id',
    csrfProtection,
    requirePermission(CUSTOMER_PERMISSIONS.UPDATE_CUSTOMER),
    customerController.updateCustomer,
);
router.delete(
    '/:id',
    csrfProtection,
    requirePermission(CUSTOMER_PERMISSIONS.DELETE_CUSTOMER),
    customerController.deleteCustomer,
);

export default router;
