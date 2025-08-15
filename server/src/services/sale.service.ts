import { Sale, ISale } from '../models/sale.model';
import{ Drug }from '../models/drug.model';
import Customer from '../models/customer.model';
import { Types } from 'mongoose';
import mongoose from 'mongoose';
import { BadRequestError, NotFoundError } from '../utils/errors';
import { CustomerService } from './customer.service';

// Helper type for mapped sale objects
type MappedSaleItem = {
    drug: any;
    quantity: number;
    priceAtSale: number;
    [key: string]: any;
};

type MappedSale = {
    id: string;
    items: MappedSaleItem[];
    soldBy: any;
    customer?: any;
    totalAmount: number;
    paymentMethod: string;
    transactionId?: string;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
    [key: string]: any;
};

export class SaleService {
    private customerService: CustomerService;

    constructor() {
        this.customerService = new CustomerService();
    }

    /**
     * Create a new sale, update drug stock, and return the created sale
     * @param data - Sale data including items, payment info, and customer details
     * @returns The newly created sale object
     */
    async createSale(data: {
        items: {
            drugId: string;
            quantity: number;
            saleType: 'unit' | 'pack' | 'carton';
        }[];
        totalAmount: number;
        paymentMethod: 'cash' | 'card' | 'mobile';
        transactionId?: string;
        notes?: string;
        userId: string;
        customerId?: string;
    }) {
        // Try to use transactions, fall back to non-transactional approach if needed
        let session: mongoose.ClientSession | null = null;
        let createdSale: any = null;

        try {
            // Attempt to start a session for transactions
            session = await mongoose.startSession();

            // Start transaction with retry logic
            await session.withTransaction(
                async () => {
                    let calculatedTotal = 0;
                    let calculatedProfit = 0;
                    const saleItems = await Promise.all(
                        data.items.map(async (item) => {
                            const drug = await Drug.findById(
                                item.drugId,
                            ).session(session!);
                            if (!drug)
                                throw new NotFoundError('Drug not found');
                            let price = 0;
                            let cost = 0;
                            let stockToDeduct = item.quantity;
                            if (item.saleType === 'unit') {
                                price = drug.pricePerUnit;
                                cost = drug.costPrice;
                                if (drug.quantity < item.quantity)
                                    throw new BadRequestError(
                                        'Insufficient unit stock',
                                    );
                                drug.quantity -= item.quantity;
                            } else if (item.saleType === 'pack') {
                                price = drug.pricePerPack;
                                cost = drug.costPrice * drug.unitsPerCarton;
                                const packUnits =
                                    drug.unitsPerCarton * item.quantity;
                                if (drug.quantity < packUnits)
                                    throw new BadRequestError(
                                        'Insufficient pack stock',
                                    );
                                drug.quantity -= packUnits;
                            } else if (item.saleType === 'carton') {
                                price = drug.pricePerCarton;
                                cost =
                                    drug.costPrice *
                                    drug.unitsPerCarton *
                                    drug.packsPerCarton;
                                const cartonUnits =
                                    drug.unitsPerCarton *
                                    drug.packsPerCarton *
                                    item.quantity;
                                if (drug.quantity < cartonUnits)
                                    throw new BadRequestError(
                                        'Insufficient carton stock',
                                    );
                                drug.quantity -= cartonUnits;
                            }
                            await drug.save({ session: session! });
                            const itemTotal = price * item.quantity;
                            const itemProfit = (price - cost) * item.quantity;
                            calculatedTotal += itemTotal;
                            calculatedProfit += itemProfit;
                            return {
                                drug: drug._id,
                                quantity: item.quantity,
                                priceAtSale: price,
                                saleType: item.saleType,
                                profit: itemProfit,
                            };
                        }),
                    );

                    if (Math.abs(calculatedTotal - data.totalAmount) > 0.01)
                        throw new BadRequestError('Total mismatch');

                    const sale = await Sale.create(
                        [
                            {
                                items: saleItems,
                                totalAmount: calculatedTotal,
                                totalProfit: calculatedProfit,
                                soldBy: new Types.ObjectId(data.userId),
                                customer: data.customerId
                                    ? new Types.ObjectId(data.customerId)
                                    : undefined,
                                paymentMethod: data.paymentMethod,
                                transactionId: data.transactionId,
                                notes: data.notes,
                            },
                        ],
                        { session: session! },
                    );

                    // Update customer purchases if customerId provided - within the same transaction
                    if (data.customerId) {
                        // Update the customer document within the transaction
                        await Customer.findByIdAndUpdate(
                            data.customerId,
                            { $addToSet: { purchases: sale[0]._id } },
                            { session: session! },
                        );
                    }

                    // Store the created sale for return
                    createdSale = sale[0];
                },
                {
                    // Transaction options for better reliability
                    readConcern: { level: 'majority' },
                    writeConcern: { w: 'majority' },
                    maxTimeMS: 30000, // 30 second timeout
                },
            );

            return createdSale;
        } catch (err: any) {
            console.error('Transaction error:', err);

            // If transaction failed due to replica set issues, try fallback
            if (
                err.message?.includes('Transaction') ||
                err.message?.includes('replica set') ||
                err.code === 20 || // Transaction number error
                err.codeName === 'ConflictingOperations'
            ) {
                console.warn(
                    'Falling back to non-transactional approach due to:',
                    err.message,
                );
                return await this.createSaleWithoutTransaction(data);
            }

            throw err;
        } finally {
            // Always end the session if it was created
            if (session) {
                await session.endSession();
            }
        }
    }

    /**
     * Fallback method for creating sales without transactions
     * Used when MongoDB is not in replica set mode
     */
    private async createSaleWithoutTransaction(data: {
        items: {
            drugId: string;
            quantity: number;
            saleType: 'unit' | 'pack' | 'carton';
        }[];
        totalAmount: number;
        paymentMethod: 'cash' | 'card' | 'mobile';
        transactionId?: string;
        notes?: string;
        userId: string;
        customerId?: string;
    }) {
        try {
            let calculatedTotal = 0;
            let calculatedProfit = 0;
            const saleItems = await Promise.all(
                data.items.map(async (item) => {
                    const drug = await Drug.findById(item.drugId);
                    if (!drug) throw new NotFoundError('Drug not found');
                    let price = 0;
                    let cost = 0;
                    if (item.saleType === 'unit') {
                        price = drug.pricePerUnit;
                        cost = drug.costPrice;
                        if (drug.quantity < item.quantity)
                            throw new BadRequestError(
                                'Insufficient unit stock',
                            );
                        drug.quantity -= item.quantity;
                    } else if (item.saleType === 'pack') {
                        price = drug.pricePerPack;
                        cost = drug.costPrice * drug.unitsPerCarton;
                        const packUnits = drug.unitsPerCarton * item.quantity;
                        if (drug.quantity < packUnits)
                            throw new BadRequestError(
                                'Insufficient pack stock',
                            );
                        drug.quantity -= packUnits;
                    } else if (item.saleType === 'carton') {
                        price = drug.pricePerCarton;
                        cost =
                            drug.costPrice *
                            drug.unitsPerCarton *
                            drug.packsPerCarton;
                        const cartonUnits =
                            drug.unitsPerCarton *
                            drug.packsPerCarton *
                            item.quantity;
                        if (drug.quantity < cartonUnits)
                            throw new BadRequestError(
                                'Insufficient carton stock',
                            );
                        drug.quantity -= cartonUnits;
                    }
                    await drug.save();
                    const itemTotal = price * item.quantity;
                    const itemProfit = (price - cost) * item.quantity;
                    calculatedTotal += itemTotal;
                    calculatedProfit += itemProfit;
                    return {
                        drug: drug._id,
                        quantity: item.quantity,
                        priceAtSale: price,
                        saleType: item.saleType,
                        profit: itemProfit,
                    };
                }),
            );

            if (Math.abs(calculatedTotal - data.totalAmount) > 0.01)
                throw new BadRequestError('Total mismatch');

            const sale = await Sale.create({
                items: saleItems,
                totalAmount: calculatedTotal,
                totalProfit: calculatedProfit,
                soldBy: new Types.ObjectId(data.userId),
                customer: data.customerId
                    ? new Types.ObjectId(data.customerId)
                    : undefined,
                paymentMethod: data.paymentMethod,
                transactionId: data.transactionId,
                notes: data.notes,
            });

            // Update customer purchases if customerId provided
            if (data.customerId) {
                await Customer.findByIdAndUpdate(data.customerId, {
                    $addToSet: { purchases: sale._id },
                });
            }

            return sale;
        } catch (err) {
            // In case of error, we should ideally rollback the drug quantities
            // but without transactions, this becomes complex
            console.error(
                'Sale creation failed without transaction support:',
                err,
            );
            throw err;
        }
    }

    /**
     * Get paginated sales list with optional date filtering
     * @param params - Parameters for filtering and pagination
     * @returns Paginated and grouped sales data
     */
    async getSales({
        page = 1,
        limit = 10,
        startDate,
        endDate,
    }: {
        page?: number;
        limit?: number;
        startDate?: string;
        endDate?: string;
    }): Promise<{
        data: MappedSale[];
        groupedData: Record<string, MappedSale[]>;
        pagination: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }> {
        const query: any = {};

        // Date filtering
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) query.createdAt.$lte = new Date(endDate);
        } else {
            // Default to showing today's sales if no date range is specified
            const today = new Date();
            const startOfToday = new Date(
                today.getFullYear(),
                today.getMonth(),
                today.getDate(),
            );
            query.createdAt = { $gte: startOfToday };
        }

        const sales = await Sale.find(query)
            .populate('items.drug')
            .populate('soldBy', 'name')
            .populate('customer', 'name phone')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        const total = await Sale.countDocuments(query);

        // Map _id to id for each sale and nested objects
        const mappedSales = sales.map((sale) => {
            const saleObj = sale.toObject();
            return {
                ...saleObj,
                id: (saleObj._id as Types.ObjectId).toString(),
                items: saleObj.items.map((item: any) => ({
                    ...item,
                    drug:
                        item.drug && typeof item.drug === 'object'
                            ? {
                                  ...item.drug,
                                  id: item.drug._id?.toString() || '',
                              }
                            : item.drug,
                })),
                soldBy:
                    saleObj.soldBy && typeof saleObj.soldBy === 'object'
                        ? {
                              ...(saleObj.soldBy as any),
                              id: (saleObj.soldBy as any)._id?.toString() || '',
                          }
                        : saleObj.soldBy,
                customer:
                    saleObj.customer && typeof saleObj.customer === 'object'
                        ? {
                              ...(saleObj.customer as any),
                              id:
                                  (saleObj.customer as any)._id?.toString() ||
                                  '',
                          }
                        : saleObj.customer,
            };
        });

        // Group sales by date
        const groupedSales = mappedSales.reduce<Record<string, MappedSale[]>>(
            (acc, sale) => {
                const date = new Date(sale.createdAt).toDateString();
                if (!acc[date]) acc[date] = [];
                acc[date].push(sale);
                return acc;
            },
            {},
        );

        return {
            data: mappedSales,
            groupedData: groupedSales,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    /**
     * Get sale by ID with populated references
     * @param id - The ID of the sale to retrieve
     * @returns The sale with populated drug, customer, and soldBy fields
     * @throws NotFoundError if the sale doesn't exist
     */
    async getSaleById(id: string): Promise<MappedSale> {
        const sale = await Sale.findById(id)
            .populate('items.drug')
            .populate('soldBy', 'name')
            .populate('customer', 'name phone');
        if (!sale) throw new NotFoundError('Sale not found');

        // Map _id to id for sale and nested objects
        const saleObj = sale.toObject();
        const mappedSale = {
            ...saleObj,
            id: (saleObj._id as Types.ObjectId).toString(),
            items: saleObj.items.map((item: any) => ({
                ...item,
                drug:
                    item.drug && typeof item.drug === 'object'
                        ? {
                              ...item.drug,
                              id: item.drug._id?.toString() || '',
                          }
                        : item.drug,
            })),
            soldBy:
                saleObj.soldBy && typeof saleObj.soldBy === 'object'
                    ? {
                          ...(saleObj.soldBy as any),
                          id: (saleObj.soldBy as any)._id?.toString() || '',
                      }
                    : saleObj.soldBy,
            customer:
                saleObj.customer && typeof saleObj.customer === 'object'
                    ? {
                          ...(saleObj.customer as any),
                          id: (saleObj.customer as any)._id?.toString() || '',
                      }
                    : saleObj.customer,
        };
        return mappedSale;
    }
}
