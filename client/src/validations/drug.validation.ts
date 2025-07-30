import { z } from 'zod';

/**
 * Zod schema for drug form validation
 */
export const drugSchema = z.object({
    name: z
        .string()
        .min(2, 'Name must be at least 2 characters')
        .max(100, 'Name must be less than 100 characters'),
    brand: z
        .string()
        .min(2, 'Brand must be at least 2 characters')
        .max(100, 'Brand must be less than 100 characters'),
    category: z
        .string()
        .min(2, 'Category must be at least 2 characters')
        .max(50, 'Category must be less than 50 characters'),
    quantity: z
        .number()
        .int('Quantity must be a whole number')
        .min(0, 'Quantity cannot be negative'),
    price: z
        .number()
        .min(0, 'Price cannot be negative')
        .refine((val) => !isNaN(val), {
            message: 'Price must be a valid number',
        }),
    expiryDate: z.string().refine(
        (date) => {
            // Check if date is valid and in the future
            const parsedDate = new Date(date);
            return !isNaN(parsedDate.getTime()) && parsedDate > new Date();
        },
        { message: 'Expiry date must be a valid future date' },
    ),
    batchNumber: z
        .string()
        .min(3, 'Batch number must be at least 3 characters')
        .max(50, 'Batch number must be less than 50 characters'),
    requiresPrescription: z.boolean().default(false),
});

/**
 * Type definition from Zod schema
 */
export type DrugFormValues = z.infer<typeof drugSchema>;

/**
 * Zod schema for drug search form
 */
export const drugSearchSchema = z.object({
    search: z.string().optional(),
    category: z.string().optional(),
    requiresPrescription: z.boolean().optional(),
    expiryBefore: z.string().optional(),
    expiryAfter: z.string().optional(),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
});

/**
 * Type definition from search Zod schema
 */
export type DrugSearchFormValues = z.infer<typeof drugSearchSchema>;
