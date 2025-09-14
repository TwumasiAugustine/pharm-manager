import { z } from 'zod';

/**
 * Zod schema for drug form validation
 */
export const drugSchema = z.object({
    /** Basic fields */
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
    dosageForm: z
        .string()
        .min(2, 'Dosage form must be at least 2 characters')
        .max(50, 'Dosage form must be less than 50 characters'),
    ableToSell: z.boolean().default(true),
    drugsInCarton: z
        .number()
        .int()
        .min(0, 'Drugs in carton cannot be negative')
        .default(0)
        .optional(),
    unitsPerCarton: z
        .number()
        .int()
        .min(1, 'Units per carton must be at least 1'),
    packsPerCarton: z
        .number()
        .int()
        .min(1, 'Packs per carton must be at least 1'),
    quantity: z
        .number()
        .int('Quantity must be a whole number')
        .min(0, 'Quantity cannot be negative')
        .default(0)
        .optional(),
    pricePerUnit: z.number().min(0, 'Price per unit cannot be negative'),
    pricePerPack: z
        .number()
        .min(0, 'Price per pack cannot be negative')
        .default(0)
        .optional(),
    pricePerCarton: z
        .number()
        .min(0, 'Price per carton cannot be negative')
        .default(0)
        .optional(),
    costPrice: z.number().min(0.01, 'Cost price must be at least 0.01'),
    expiryDate: z.string().refine(
        (date) => {
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
    supplier: z
        .string()
        .min(2, 'Supplier must be at least 2 characters')
        .max(100, 'Supplier must be less than 100 characters')
        .optional(),
    location: z
        .string()
        .min(2, 'Location must be at least 2 characters')
        .max(100, 'Location must be less than 100 characters')
        .optional(),
    branchId: z
        .string()
        .transform((val) => val || undefined) // Convert empty string to undefined
        .optional()
        .refine((val) => !val || val.length >= 2, {
            message: 'Branch Id must be at least 2 characters when provided',
        }),
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
