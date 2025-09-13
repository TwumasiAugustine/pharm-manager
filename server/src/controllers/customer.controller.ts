import { Request, Response, NextFunction } from 'express';
import { CustomerService } from '../services/customer.service';
import { successResponse } from '../utils/response';
import { BadRequestError, NotFoundError } from '../utils/errors';

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
                req.user?.role,
                req.user?.branchId,
            );
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
                req.user?.role,
                req.user?.branchId,
            );
            if (!customer) {
                throw new NotFoundError('Customer not found');
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
            const userBranchId = req.user!.branchId;
            const newCustomer = await customerService.createCustomer(
                req.body,
                userBranchId,
            );
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
            const deleted = await customerService.deleteCustomer(req.params.id);
            if (!deleted) {
                throw new NotFoundError('Customer not found');
            }
            res.status(200).json(
                successResponse(null, 'Customer deleted successfully'),
            );
        } catch (error) {
            next(error);
        }
    }
}
