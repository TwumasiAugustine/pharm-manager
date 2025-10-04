import { z } from 'zod';

const saleItemSchema = z.object({
    drugId: z.string().length(24, 'Invalid drug ID'),
    quantity: z.number().int().min(1, 'Quantity must be at least 1'),
});

export const createSaleSchema = z.object({
    items: z.array(saleItemSchema).min(1, 'At least one item is required'),
    totalAmount: z.number().min(0, 'Total amount cannot be negative'),
    paymentMethod: z.enum(['cash', 'card', 'mobile']),
    transactionId: z.string().optional(),
    notes: z.string().optional(),
});
