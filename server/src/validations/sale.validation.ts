import { z } from 'zod';

/**
 * Validation schema for a single item in a sale
 */
const saleItemSchema = z.object({
    drugId: z.string().refine((val) => /^[0-9a-fA-F]{24}$/.test(val), {
        message: 'Invalid drug ID format',
    }),
    quantity: z.number().int().min(1, 'Quantity must be at least 1'),
});

/**
 * Validation schema for creating a new sale
 */
export const createSaleSchema = z.object({
    items: z
        .array(saleItemSchema)
        .min(1, 'At least one item is required for a sale'),
    totalAmount: z.number().min(0, 'Total amount cannot be negative'),
    paymentMethod: z.enum(['Cash', 'Card', 'Mobile Money'], {
        required_error: 'Payment method is required',
        invalid_type_error: 'Invalid payment method',
    }),
    transactionId: z.string().optional(),
    notes: z.string().optional(),
});
