// This file has been removed.
// The routes for customer management are no longer available.
// Please refer to the updated documentation for alternative routes.
// If you need to manage customers, use the new API endpoints.
// For further assistance, contact the development team.
// Thank you for your understanding.
// File removed
// ...existing code...
// ...existing code...
// ...existing code...
// ...existing code...
// ...existing code...
import { Router } from 'express';
import { CustomerController } from '../controllers/customer.controller';

const router = Router();
const customerController = new CustomerController();

router.post('/', customerController.createCustomer);
router.get('/', customerController.getCustomers);
router.get('/:id', customerController.getCustomerById);

export default router;
