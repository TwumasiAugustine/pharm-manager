import { Request, Response, NextFunction } from 'express';
import { CustomerService } from '../services/customer.service';
import { successResponse } from '../utils/response';
import { BadRequestError, NotFoundError } from '../utils/errors';
import { trackActivity } from '../utils/activity-tracker';

const customerService = new CustomerService();

export class CustomerController {
    /**
     * Get all customers with pagination
     */
    async getCustomers(req: Request, res: Response, next: NextFunction) {
        try {
            const { page = 1, limit = 10, search } = req.query;
            const customers = await customerService.getCustomers(
                {
                    page: Number(page),
                    limit: Number(limit),
                    search: search as string,
                },
                req.user!,
            );

            // Track customer list viewing activity
            if (req.user) {
                trackActivity(req.user.id, 'VIEW', 'CUSTOMER', {
                    endpoint: req.path,
                    method: req.method,
                    action: 'getCustomers',
                    pagination: {
                        page: Number(page),
                        limit: Number(limit),
                    },
                    search: search as string,
                    resultCount: customers.customers?.length || 0,
                });
            }

            res.status(200).json(
                successResponse(customers, 'Customers retrieved successfully'),
            );
        } catch (error) {
            next(error);
        }
    }

    /**
     * Search for customers by name, email, or contact number
     */
    async searchCustomers(req: Request, res: Response, next: NextFunction) {
        try {
            const { query } = req.query;
            if (!query || typeof query !== 'string') {
                throw new BadRequestError('Search query is required');
            }
            const customers = await customerService.searchCustomers(query);

            // Track customer search activity
            if (req.user) {
                trackActivity(req.user.id, 'SEARCH', 'CUSTOMER', {
                    endpoint: req.path,
                    method: req.method,
                    action: 'searchCustomers',
                    searchQuery: query,
                    resultCount: customers.customers?.length || 0,
                });
            }

            res.status(200).json(
                successResponse(customers, 'Customer search successful'),
            );
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get a single customer by their ID
     */
    async getCustomerById(req: Request, res: Response, next: NextFunction) {
        try {
            const customer = await customerService.getCustomerById(
                req.params.id,
                req.user!,
            );
            if (!customer) {
                throw new NotFoundError('Customer not found');
            }

            // Track individual customer viewing activity
            if (req.user) {
                trackActivity(req.user.id, 'VIEW', 'CUSTOMER', {
                    endpoint: req.path,
                    method: req.method,
                    action: 'getCustomerById',
                    resourceId: req.params.id,
                    resourceName: customer.name,
                    customerId: req.params.id,
                    customerName: customer.name,
                    customerEmail: customer.email,
                    customerPhone: customer.phone,
                });
            }

            res.status(200).json(
                successResponse(customer, 'Customer retrieved successfully'),
            );
        } catch (error) {
            next(error);
        }
    }

    /**
     * Create a new customer
     */
    async createCustomer(req: Request, res: Response, next: NextFunction) {
        try {
            // Require branchId for customer creation
            if (!req.user?.branchId) {
                throw new BadRequestError(
                    'Branch assignment is required for customer creation',
                );
            }

            const userBranchId = req.user.branchId;

            const newCustomer = await customerService.createCustomer(
                req.body,
                userBranchId,
                req.user?.pharmacyId, // Pass user's pharmacyId
            );

            // Track customer creation activity
            if (req.user) {
                trackActivity(req.user.id, 'CREATE', 'CUSTOMER', {
                    endpoint: req.path,
                    method: req.method,
                    action: 'createCustomer',
                    resourceId: newCustomer._id?.toString(),
                    resourceName: newCustomer.name,
                    customerId: newCustomer._id,
                    customerData: {
                        name: newCustomer.name,
                        email: newCustomer.email,
                        contactNumber: newCustomer.phone,
                        address: newCustomer.address,
                    },
                    branchId: userBranchId,
                    pharmacyId: req.user?.pharmacyId,
                });
            }

            res.status(201).json(
                successResponse(
                    newCustomer,
                    'Customer created successfully',
                    201,
                ),
            );
        } catch (error) {
            next(error);
        }
    }

    /**
     * Update an existing customer
     */
    async updateCustomer(req: Request, res: Response, next: NextFunction) {
        try {
            const updatedCustomer = await customerService.updateCustomer(
                req.params.id,
                req.body,
            );
            if (!updatedCustomer) {
                throw new NotFoundError('Customer not found');
            }

            // Track customer update activity
            if (req.user) {
                trackActivity(req.user.id, 'UPDATE', 'CUSTOMER', {
                    endpoint: req.path,
                    method: req.method,
                    action: 'updateCustomer',
                    resourceId: req.params.id,
                    resourceName: updatedCustomer.name,
                    customerId: req.params.id,
                    updatedFields: Object.keys(req.body),
                    updatedData: {
                        name: updatedCustomer.name,
                        email: updatedCustomer.email,
                        contactNumber: updatedCustomer.phone,
                        address: updatedCustomer.address,
                    },
                    previousData: 'Updated from existing record',
                });
            }

            res.status(200).json(
                successResponse(
                    updatedCustomer,
                    'Customer updated successfully',
                ),
            );
        } catch (error) {
            next(error);
        }
    }

    /**
     * Delete a customer
     */
    async deleteCustomer(req: Request, res: Response, next: NextFunction) {
        try {
            // First get customer details before deletion
            const customer = await customerService.getCustomerById(
                req.params.id,
                req.user!,
            );
            if (!customer) {
                throw new NotFoundError('Customer not found');
            }

            const deleted = await customerService.deleteCustomer(req.params.id);
            if (!deleted) {
                throw new NotFoundError('Customer not found');
            }

            // Track customer deletion activity
            if (req.user) {
                trackActivity(req.user.id, 'DELETE', 'CUSTOMER', {
                    endpoint: req.path,
                    method: req.method,
                    action: 'deleteCustomer',
                    resourceId: req.params.id,
                    resourceName: customer.name,
                    customerId: req.params.id,
                    deletedCustomer: {
                        name: customer.name,
                        email: customer.email,
                        contactNumber: customer.phone,
                    },
                    reason: 'Customer record deleted',
                });
            }

            res.status(200).json(
                successResponse(null, 'Customer deleted successfully'),
            );
        } catch (error) {
            next(error);
        }
    }
}
