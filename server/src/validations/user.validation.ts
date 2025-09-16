import { z } from 'zod';
import { UserRole } from '../types/user.types';

export const createUserSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    role: z.nativeEnum(UserRole),
    branchId: z.string().optional(), // Branch assignment - not required for super_admin
});

export const updateUserSchema = z.object({
    name: z.string().min(1, 'Name is required').optional(),
    email: z.string().email('Invalid email').optional(),
    password: z
        .string()
        .min(6, 'Password must be at least 6 characters')
        .optional(),
    role: z.nativeEnum(UserRole).optional(),
    branchId: z.string().optional(), // Branch assignment
});
