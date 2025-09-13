import { z } from 'zod';

export const createUserSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    role: z.enum(['super_admin', 'admin', 'pharmacist', 'cashier']),
    branchId: z.string().optional(), // Branch assignment - not required for super_admin
});

export const updateUserSchema = z.object({
    name: z.string().min(1, 'Name is required').optional(),
    email: z.string().email('Invalid email').optional(),
    password: z
        .string()
        .min(6, 'Password must be at least 6 characters')
        .optional(),
    role: z.enum(['super_admin', 'admin', 'pharmacist', 'cashier']).optional(),
    branchId: z.string().optional(), // Branch assignment
});
