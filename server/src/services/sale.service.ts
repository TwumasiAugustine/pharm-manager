import { Sale } from '../models/sale.model';
import Drug from '../models/drug.model';
import { Types } from 'mongoose';
import { BadRequestError, NotFoundError } from '../utils/errors';

export class SaleService {
    /**
     * Create a new sale, update drug stock, and return the created sale
     */
    async createSale(data: {
        items: { drugId: string; quantity: number }[];
        totalAmount: number;
        paymentMethod: 'cash' | 'card' | 'mobile';
        transactionId?: string;
        notes?: string;
        userId: string;
    }) {
        const session = await Sale.startSession();
        session.startTransaction();
        try {
            let calculatedTotal = 0;
            const saleItems = await Promise.all(
                data.items.map(async (item) => {
                    const drug = await Drug.findById(item.drugId).session(
                        session,
                    );
                    if (!drug) throw new NotFoundError('Drug not found');
                    if (drug.quantity < item.quantity)
                        throw new BadRequestError('Insufficient stock');
                    drug.quantity -= item.quantity;
                    await drug.save({ session });
                    calculatedTotal += drug.price * item.quantity;
                    return {
                        drug: drug._id,
                        quantity: item.quantity,
                        priceAtSale: drug.price,
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
                        soldBy: new Types.ObjectId(data.userId),
                        paymentMethod: data.paymentMethod,
                        transactionId: data.transactionId,
                        notes: data.notes,
                    },
                ],
                { session },
            );
            await session.commitTransaction();
            return sale[0];
        } catch (err) {
            await session.abortTransaction();
            throw err;
        } finally {
            session.endSession();
        }
    }

    /**
     * Get paginated sales list
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
    }) {
        const query: any = {};
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) query.createdAt.$lte = new Date(endDate);
        }
        const sales = await Sale.find(query)
            .populate('items.drug')
            .populate('soldBy', 'name')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);
        const total = await Sale.countDocuments(query);
        // Map _id to id for each sale and nested objects
        const mappedSales = sales.map((sale) => {
            const saleObj = sale.toObject() as { _id: Types.ObjectId; items: any[]; soldBy: any; [key: string]: any };
            return {
                ...saleObj,
                id: saleObj._id.toString(),
                items: saleObj.items.map((item: any) => ({
                    ...item,
                    drug:
                        item.drug && typeof item.drug === 'object'
                            ? {
                                  ...item.drug,
                                  id: item.drug._id?.toString?.() || item.drug.id,
                              }
                            : item.drug,
                })),
                soldBy:
                    saleObj.soldBy && typeof saleObj.soldBy === 'object'
                        ? {
                              ...saleObj.soldBy,
                              id: saleObj.soldBy._id?.toString?.() || saleObj.soldBy._id,
                          }
                        : saleObj.soldBy,
            };
        });
        return {
            data: mappedSales,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    /**
     * Get sale by ID
     */
    async getSaleById(id: string) {
        const sale = await Sale.findById(id)
            .populate('items.drug')
            .populate('soldBy', 'name');
        if (!sale) throw new NotFoundError('Sale not found');
        // Map _id to id for sale and nested objects
        const saleObj = sale.toObject() as {
            _id: Types.ObjectId;
            items: any[];
            soldBy: any;
            [key: string]: any;
        };
        const mappedSale = {
            ...saleObj,
            id: saleObj._id.toString(),
            items: saleObj.items.map((item: any) => ({
                ...item,
                drug:
                    item.drug && typeof item.drug === 'object'
                        ? {
                              ...item.drug,
                              id: item.drug._id?.toString?.() || item.drug.id,
                          }
                        : item.drug,
            })),
            soldBy:
                saleObj.soldBy && typeof saleObj.soldBy === 'object'
                    ? {
                          ...saleObj.soldBy,
                          id: saleObj.soldBy._id?.toString?.() || saleObj.soldBy._id,
                      }
                    : saleObj.soldBy,
        };
        return mappedSale;
    }
}
