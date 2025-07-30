import { ISale, Sale } from '../models/sale.model';
import Drug from '../models/drug.model';
import {
    CreateSaleRequest,
    SaleResponse,
    SaleSearchParams,
} from '../types/sale.types';
import { NotFoundError, BadRequestError } from '../utils/errors';
import { Types } from 'mongoose';

export class SaleService {
    /**
     * Create a new sale
     * @param saleData - Data for creating the sale
     * @param userId - The ID of the user creating the sale
     * @returns The created sale
     */
    public async createSale(
        saleData: CreateSaleRequest,
        userId: string,
    ): Promise<SaleResponse> {
        const session = await Sale.startSession();
        session.startTransaction();

        try {
            let calculatedTotal = 0;

            const saleItems = await Promise.all(
                saleData.items.map(async (item) => {
                    const drug = await Drug.findById(item.drugId).session(
                        session,
                    );
                    if (!drug) {
                        throw new NotFoundError(
                            `Drug with ID ${item.drugId} not found`,
                        );
                    }
                    if (drug.quantity < item.quantity) {
                        throw new BadRequestError(
                            `Not enough stock for ${drug.name}`,
                        );
                    }
                    // Decrease drug quantity
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

            // Verify total amount
            if (Math.abs(calculatedTotal - saleData.totalAmount) > 0.01) {
                throw new BadRequestError(
                    'Total amount does not match calculated total',
                );
            }

            const newSale = new Sale({
                items: saleItems,
                totalAmount: saleData.totalAmount,
                soldBy: new Types.ObjectId(userId),
                paymentMethod: saleData.paymentMethod,
                transactionId: saleData.transactionId,
                notes: saleData.notes,
            });

            const savedSale = await newSale.save({ session });
            await session.commitTransaction();
            session.endSession();

            // Populate and format response
            const populatedSale = await Sale.findById(savedSale._id)
                .populate('items.drug', 'name brand')
                .populate('soldBy', 'name')
                .populate('customer', 'name contactNumber email notes')
                .exec();

            if (!populatedSale) {
                throw new NotFoundError('Sale not found after creation');
            }

            return this.formatSaleResponse(populatedSale);
        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            throw error;
        }
    }

    /**
     * Get a paginated list of sales
     * @param params - Search and pagination parameters
     * @returns A paginated list of sales
     */
    public async getSales(params: SaleSearchParams) {
        const {
            page = 1,
            limit = 10,
            startDate,
            endDate,
            userId,
            sortBy = 'date', // Default sort by date
            sortOrder = 'desc',
            groupByDate = true, // New parameter to enable date grouping
        } = params;

        console.log('Sales query params:', params);

        // Build the query
        const query: any = {};

        // Date range filtering
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) {
                // Ensure startDate is at the beginning of the day
                const start = new Date(startDate);
                start.setHours(0, 0, 0, 0);
                query.createdAt.$gte = start;
                console.log('Start date query:', start);
            }
            if (endDate) {
                // Ensure endDate is at the end of the day
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                query.createdAt.$lte = end;
                console.log('End date query:', end);
            }
        }

        if (userId) {
            if (!Types.ObjectId.isValid(userId)) {
                throw new BadRequestError('Invalid user ID format');
            }
            query.soldBy = new Types.ObjectId(userId);
        }

        // Log the final query for debugging
        console.log('MongoDB query:', JSON.stringify(query));

        const sortOptions: { [key: string]: 'asc' | 'desc' } = {};
        if (sortBy === 'date') {
            sortOptions.createdAt = sortOrder;
        } else if (sortBy === 'total') {
            sortOptions.totalAmount = sortOrder;
        }

        // For non-grouped results, use the standard pagination
        if (!groupByDate) {
            console.log('Using non-grouped sales query');
            const skip = (page - 1) * limit;

            // Convert limit and skip to numbers to ensure proper MongoDB query
            const limitNum = parseInt(String(limit), 10);
            const skipNum = parseInt(String(skip), 10);

            // First count the total sales matching the query
            const totalSales = await Sale.countDocuments(query);
            console.log(`Found ${totalSales} total sales`);

            // Then fetch the sales for the current page
            const sales = await Sale.find(query)
                .populate('items.drug', 'name brand')
                .populate('soldBy', 'name')
                .sort(sortOptions)
                .skip(skipNum)
                .limit(limitNum)
                .exec();

            console.log(`Fetched ${sales.length} sales for current page`);

            // Format the sales for the response
            const formattedSales = sales.map((sale) =>
                this.formatSaleResponse(sale),
            );

            return {
                data: formattedSales,
                pagination: {
                    total: totalSales,
                    page: Number(page),
                    limit: limitNum,
                    totalPages: Math.ceil(totalSales / limitNum),
                },
            };
        }

        // For grouped results, use aggregation
        console.log('Using grouped sales query');

        // First, count total unique dates for pagination
        const dateGroupCount = await Sale.aggregate([
            { $match: query },
            {
                $group: {
                    _id: {
                        $dateToString: {
                            format: '%Y-%m-%d',
                            date: '$createdAt',
                        },
                    },
                },
            },
            { $count: 'total' },
        ]).exec();

        const totalUniqueDates =
            dateGroupCount.length > 0 ? dateGroupCount[0].total : 0;
        console.log(`Found ${totalUniqueDates} unique dates with sales`);

        // Ensure skip and limit are numbers, not strings
        const skip =
            parseInt(String(page - 1), 10) * parseInt(String(limit), 10);
        const limitNum = parseInt(String(limit), 10);

        console.log(`Using skip=${skip} and limit=${limitNum} for pagination`);

        // Now get the grouped sales for the current page
        try {
            const groupedSales = await Sale.aggregate([
                { $match: query },
                {
                    $group: {
                        _id: {
                            $dateToString: {
                                format: '%Y-%m-%d',
                                date: '$createdAt',
                            },
                        },
                        sales: { $push: '$$ROOT' },
                        totalAmount: { $sum: '$totalAmount' },
                        totalItems: { $sum: { $size: '$items' } },
                        saleCount: { $sum: 1 },
                    },
                },
                { $sort: { _id: sortOrder === 'asc' ? 1 : -1 } },
                { $skip: skip },
                { $limit: limitNum },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'sales.soldBy',
                        foreignField: '_id',
                        as: 'salesUsers',
                    },
                },
                {
                    $lookup: {
                        from: 'drugs',
                        localField: 'sales.items.drug',
                        foreignField: '_id',
                        as: 'drugs',
                    },
                },
            ]).exec();

            console.log(
                `Successfully retrieved ${groupedSales.length} grouped sales`,
            );

            // Format the grouped sales data
            const formattedGroupedSales = groupedSales.map((group) => {
                const salesWithDetails = group.sales.map((sale: any) => {
                    const saleObj = sale as any;
                    // Find the user who processed this sale
                    const user = group.salesUsers.find(
                        (u: any) =>
                            u._id.toString() === saleObj.soldBy.toString(),
                    );

                    // Get item details
                    const itemsWithDetails = saleObj.items.map((item: any) => {
                        const drug = group.drugs.find(
                            (d: any) =>
                                d._id.toString() === item.drug.toString(),
                        );
                        return {
                            drugId: item.drug.toString(),
                            name: drug?.name || 'Unknown Drug',
                            brand: drug?.brand || '',
                            quantity: item.quantity,
                            priceAtSale: item.priceAtSale,
                        };
                    });

                    return {
                        id: saleObj._id.toString(),
                        items: itemsWithDetails,
                        totalAmount: saleObj.totalAmount,
                        soldBy: {
                            id: saleObj.soldBy.toString(),
                            name: user?.name || 'Unknown User',
                        },
                        createdAt: saleObj.createdAt,
                    };
                });

                return {
                    date: group._id,
                    sales: salesWithDetails,
                    totalAmount: group.totalAmount,
                    totalItems: group.totalItems,
                    saleCount: group.saleCount,
                };
            });

            return {
                data: formattedGroupedSales,
                pagination: {
                    total: totalUniqueDates,
                    page: Number(page),
                    limit: limitNum,
                    totalPages: Math.ceil(totalUniqueDates / limitNum),
                },
            };
        } catch (error) {
            console.error('Error in sales aggregation:', error);
            // Return empty result set on error
            return {
                data: [],
                pagination: {
                    total: 0,
                    page: Number(page),
                    limit: limitNum,
                    totalPages: 0,
                },
            };
        }
    }

    /**
     * Get a single sale by its ID
     * @param id - The ID of the sale
     * @returns The sale details
     */
    public async getSaleById(id: string): Promise<SaleResponse> {
        if (!Types.ObjectId.isValid(id)) {
            throw new BadRequestError('Invalid sale ID format');
        }

        const sale = await Sale.findById(id)
            .populate('items.drug', 'name brand')
            .populate('soldBy', 'name email')
            .exec();

        if (!sale) {
            throw new NotFoundError(`Sale with ID ${id} not found`);
        }

        return this.formatSaleResponse(sale);
    }

    /**
     * Format a Sale document into a SaleResponse
     * @param sale - The sale document
     * @returns A formatted sale response
     */
    private formatSaleResponse(sale: ISale): SaleResponse {
        const saleObject = sale.toObject() as ISale;
        return {
            id: (saleObject._id as Types.ObjectId).toString(),
            items: saleObject.items.map((item: any) => ({
                drugId: item.drug?._id?.toString() || '',
                name: item.drug?.name || '',
                brand: item.drug?.brand || '',
                quantity: item.quantity,
                priceAtSale: item.priceAtSale,
            })),
            totalAmount: saleObject.totalAmount,
            soldBy: {
                id: (saleObject.soldBy as any)?._id?.toString() || '',
                name: (saleObject.soldBy as any)?.name || '',
            },
            paymentMethod: saleObject.paymentMethod,
            transactionId: saleObject.transactionId,
            notes: saleObject.notes,
            createdAt:
                saleObject.createdAt instanceof Date
                    ? saleObject.createdAt.toISOString()
                    : '',
        };
    }
}
