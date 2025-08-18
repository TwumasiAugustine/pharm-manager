import { Router } from 'express';
import { CustomerController } from '../controllers/customer.controller';
import { csrfProtection } from '../middlewares/csrf.middleware';

const router = Router();
const customerController = new CustomerController();

// Customer CRUD operations
router.post('/', csrfProtection, customerController.createCustomer);
router.get('/', customerController.getCustomers);
router.get('/search', customerController.searchCustomers);
router.get('/:id', customerController.getCustomerById);
router.put('/:id', csrfProtection, customerController.updateCustomer);
router.delete('/:id', csrfProtection, customerController.deleteCustomer);

export default router;
