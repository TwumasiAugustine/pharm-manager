import Customer from '../models/customer.model';
import { NotFoundError } from '../utils/errors';
import { Sale } from '../models/sale.model';
import { Types } from 'mongoose';

export class CustomerService {
    /**
     * Create a new customer
     * @param data - The data for the new customer
     * @param userBranchId - The branch ID to assign the customer to
     * @returns The newly created customer object
     */
    async createCustomer(
        data: {
            name: string;
            phone: string;
            email?: string;
            address?: string;
        },
        userBranchId?: string,
    ) {
        const customerData = {
            ...data,
            branch: userBranchId ? new Types.ObjectId(userBranchId) : undefined,
        };

        const customer = await Customer.create(customerData);
        return customer;
    }

    /**
     * Get all customers with pagination and filtering
     * @param params - Search parameters for customers
     * @param userRole - The role of the user requesting customers
     * @param userBranchId - The branch ID of the user requesting customers
     * @returns A paginated list of customers
     */
    async getCustomers(
        params: {
            page?: number;
            limit?: number;
            search?: string;
        },
        userRole?: string,
        userBranchId?: string,
    ) {
        const query: any = {};

        // If not super admin, filter by branch
        if (userRole && userRole !== 'super_admin' && userBranchId) {
            query.branch = userBranchId;
        }

        if (params.search) {
            // Search in name, phone, and email fields
            query.$or = [
                { name: { $regex: params.search, $options: 'i' } },
                { phone: { $regex: params.search, $options: 'i' } },
                { email: { $regex: params.search, $options: 'i' } },
            ];
        }
        const customers = await Customer.find(query)
            .sort({ createdAt: -1 }) // Sort by newest first
            .skip(((params.page || 1) - 1) * (params.limit || 10))
            .limit(params.limit || 10);
        const totalCount = await Customer.countDocuments(query);
        return {
            customers,
            totalCount,
            page: params.page || 1,
            limit: params.limit || 10,
            totalPages: Math.ceil(totalCount / (params.limit || 10)),
        };
    }

    /**
     * Get a single customer by their ID
     * @param id - The ID of the customer
     * @param userRole - The role of the user requesting the customer
     * @param userBranchId - The branch ID of the user requesting the customer
     * @returns The customer object or null if not found
     */
    async getCustomerById(
        id: string,
        userRole?: string,
        userBranchId?: string,
    ) {
        const query: any = { _id: id };

        // If not super admin, filter by branch
        if (userRole && userRole !== 'super_admin' && userBranchId) {
            query.branch = userBranchId;
        }

        const customer = await Customer.findOne(query).populate({
            path: 'purchases',
            model: 'Sale',
            options: { sort: { createdAt: -1 } },
        });

        if (!customer) throw new NotFoundError('Customer not found');
        return customer;
    }

    /**
     * Add a sale to a customer's purchase history
     * @param customerId - The ID of the customer
     * @param saleId - The ID of the sale to add
     * @returns The updated customer object
     */
    async addSaleToCustomer(customerId: string, saleId: string) {
        const customer = await Customer.findByIdAndUpdate(
            customerId,
            { $addToSet: { purchases: new Types.ObjectId(saleId) } },
            { new: true },
        );

        if (!customer) throw new NotFoundError('Customer not found');
        return customer;
    }

    /**
     * Search for customers by name, phone, or email
     * @param query - The search query string
     * @returns Array of matching customers
     */
    async searchCustomers(query: string) {
        const customers = await Customer.find({
            $or: [
                { name: { $regex: query, $options: 'i' } },
                { phone: { $regex: query, $options: 'i' } },
                { email: { $regex: query, $options: 'i' } },
            ],
        }).limit(20);

        return { customers };
    }

    /**
     * Update an existing customer
     * @param id - The ID of the customer to update
     * @param data - The updated customer data
     * @returns The updated customer object or null if not found
     */
    async updateCustomer(
        id: string,
        data: {
            name?: string;
            phone?: string;
            email?: string;
            address?: string;
        },
    ) {
        const customer = await Customer.findByIdAndUpdate(
            id,
            { $set: data },
            { new: true, runValidators: true },
        );

        return customer;
    }

    /**
     * Delete a customer
     * @param id - The ID of the customer to delete
     * @returns true if deleted, false if not found
     */
    async deleteCustomer(id: string) {
        const result = await Customer.deleteOne({ _id: id });
        return result.deletedCount > 0;
    }
}
