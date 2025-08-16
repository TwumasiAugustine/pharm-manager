import { z } from 'zod';

export const createUserSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    role: z.enum(['admin', 'pharmacist', 'cashier']),
});

export const updateUserSchema = z.object({
    name: z.string().min(1, 'Name is required').optional(),
    email: z.string().email('Invalid email').optional(),
    password: z
        .string()
        .min(6, 'Password must be at least 6 characters')
        .optional(),
    role: z.enum(['admin', 'pharmacist', 'cashier']).optional(),
});
