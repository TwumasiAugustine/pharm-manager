import { z } from 'zod';

/**
 * Zod schema for package information validation
 */
const packageInfoSchema = z.object({
    isPackaged: z.boolean().default(false),
    unitsPerPack: z.number().min(1, 'Units per pack must be at least 1').optional(),
    packsPerCarton: z.number().min(1, 'Packs per carton must be at least 1').optional(),
    packPrice: z.number().min(0, 'Pack price cannot be negative').optional(),
    cartonPrice: z.number().min(0, 'Carton price cannot be negative').optional(),
}).refine((data) => {
    // If isPackaged is true, unitsPerPack and packPrice are required
    if (data.isPackaged) {
        return data.unitsPerPack !== undefined && data.packPrice !== undefined;
    }
    return true;
}, {
    message: 'Pack information is required when drug is packaged',
    path: ['unitsPerPack'],
}).refine((data) => {
    // If packsPerCarton is provided, cartonPrice is required
    if (data.packsPerCarton !== undefined) {
        return data.cartonPrice !== undefined;
    }
    return true;
}, {
    message: 'Carton price is required when packs per carton is specified',
    path: ['cartonPrice'],
});

/**
 * Zod schema for drug form validation
 */
export const drugSchema = z.object({
    name: z
        .string()
        .min(2, 'Name must be at least 2 characters')
        .max(100, 'Name must be less than 100 characters'),
    generic: z
        .string()
        .min(2, 'Generic name must be at least 2 characters')
        .max(100, 'Generic name must be less than 100 characters'),
    brand: z
        .string()
        .min(2, 'Brand must be at least 2 characters')
        .max(100, 'Brand must be less than 100 characters'),
    category: z
        .string()
        .min(2, 'Category must be at least 2 characters')
        .max(50, 'Category must be less than 50 characters'),
    type: z
        .string()
        .min(2, 'Drug type must be at least 2 characters')
        .max(50, 'Drug type must be less than 50 characters'),
    dosageForm: z
        .string()
        .min(2, 'Dosage form must be at least 2 characters')
        .max(50, 'Dosage form must be less than 50 characters'),
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
    packageInfo: packageInfoSchema.optional(),
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
    type: z.string().optional(),
    dosageForm: z.string().optional(),
    requiresPrescription: z.boolean().optional(),
    expiryBefore: z.string().optional(),
    expiryAfter: z.string().optional(),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
    isPackaged: z.boolean().optional(),
});

/**
 * Type definition from search Zod schema
 */
export type DrugSearchFormValues = z.infer<typeof drugSearchSchema>;
