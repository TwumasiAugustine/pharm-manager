import { z } from 'zod';
import { UserRole } from '../types/user.types';
export const drugCreateSchema = z.object({
    name: z.string().min(2).max(100),
    brand: z.string().min(2).max(100),
    category: z.string().min(2).max(50),
    dosageForm: z.string().min(2).max(50),
    ableToSell: z.boolean(),
    drugsInCarton: z.number().int().min(0),
    unitsPerCarton: z.number().int().min(1),
    packsPerCarton: z.number().int().min(1),
    quantity: z.number().int().min(0),
    pricePerUnit: z.number().min(0),
    pricePerPack: z.number().min(0),
    pricePerCarton: z.number().min(0),
    expiryDate: z.union([z.string(), z.date()]),
    batchNumber: z.string().min(3).max(50),
    requiresPrescription: z.boolean(),
    supplier: z.string().min(2).max(100).optional(),
    location: z.string().min(2).max(100).optional(),
    costPrice: z.number().min(0.01),
});

export const drugUpdateSchema = drugCreateSchema.partial();

export const loginSchema = z.object({
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z
    .object({
        name: z.string().min(2, 'Name must be at least 2 characters'),
        email: z.string().email('Please enter a valid email address'),
        password: z.string().min(6, 'Password must be at least 6 characters'),
        confirmPassword: z.string().min(6, 'Confirm password is required'),
        role: z.nativeEnum(UserRole).optional(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ['confirmPassword'],
    });
