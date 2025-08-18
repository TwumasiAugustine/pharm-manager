import { z } from 'zod';

export const saleItemSchema = z.object({
    drugId: z.string().min(1, 'Drug is required'),
    drugName: z.string(),
    quantity: z.number().min(1, 'Quantity must be at least 1'),
    priceAtSale: z.number(),
    maxQuantity: z.number(),
    saleType: z.enum(['unit', 'pack', 'carton']),
});

export const createSaleSchema = z.object({
    items: z.array(saleItemSchema).min(1, 'At least one item is required'),
    paymentMethod: z.string().min(1, 'Payment method is required'),
    transactionId: z.string().optional(),
    notes: z.string().optional(),
});

export type CreateSaleFormValues = z.infer<typeof createSaleSchema>;
