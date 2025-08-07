import { Sale, ISale } from '../models/sale.model';
import Drug from '../models/drug.model';
import Customer from '../models/customer.model';
import { Types } from 'mongoose';
import mongoose from 'mongoose';
import { BadRequestError, NotFoundError } from '../utils/errors';
import { CustomerService } from './customer.service';

// Helper type for mapped sale objects
type MappedSaleItem = {
    drug: any;
    quantity: number;
    packageType: 'individual' | 'pack' | 'carton';
    unitsSold: number;
    packsSold?: number;
    cartonsSold?: number;
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
     * Calculate package-based pricing and quantities
     */
    private calculatePackageSale(
        drug: any,
        requestedQuantity: number,
        packageType: 'individual' | 'pack' | 'carton'
    ) {
        const result = {
            unitsToDeduct: requestedQuantity,
            packsSold: 0,
            cartonsSold: 0,
            totalPrice: 0,
            unitPrice: drug.price,
        };

        if (packageType === 'individual') {
            result.totalPrice = requestedQuantity * drug.price;
        } else if (packageType === 'pack' && drug.packageInfo?.isPackaged) {
            const { unitsPerPack, packPrice } = drug.packageInfo;
            if (!unitsPerPack || !packPrice) {
                throw new BadRequestError('Pack information not available for this drug');
            }
            
            const packsNeeded = Math.ceil(requestedQuantity / unitsPerPack);
            result.packsSold = packsNeeded;
            result.unitsToDeduct = packsNeeded * unitsPerPack;
            result.totalPrice = packsNeeded * packPrice;
            result.unitPrice = packPrice / unitsPerPack;
        } else if (packageType === 'carton' && drug.packageInfo?.isPackaged) {
            const { unitsPerPack, packsPerCarton, cartonPrice } = drug.packageInfo;
            if (!unitsPerPack || !packsPerCarton || !cartonPrice) {
                throw new BadRequestError('Carton information not available for this drug');
            }
            
            const unitsPerCarton = unitsPerPack * packsPerCarton;
            const cartonsNeeded = Math.ceil(requestedQuantity / unitsPerCarton);
            result.cartonsSold = cartonsNeeded;
            result.packsSold = cartonsNeeded * packsPerCarton;
            result.unitsToDeduct = cartonsNeeded * unitsPerCarton;
            result.totalPrice = cartonsNeeded * cartonPrice;
            result.unitPrice = cartonPrice / unitsPerCarton;
        }

        return result;
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
            packageType?: 'individual' | 'pack' | 'carton';
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
                    const saleItems = await Promise.all(
                        data.items.map(async (item) => {
                            const drug = await Drug.findById(
                                item.drugId,
                            ).session(session!);
                            if (!drug)
                                throw new NotFoundError('Drug not found');

                            const packageType = item.packageType || 'individual';
                            const packageCalculation = this.calculatePackageSale(
                                drug, 
                                item.quantity, 
                                packageType
                            );

                            if (drug.quantity < packageCalculation.unitsToDeduct)
                                throw new BadRequestError(`Insufficient stock. Available: ${drug.quantity}, Required: ${packageCalculation.unitsToDeduct}`);

                            // Update drug stock
                            drug.quantity -= packageCalculation.unitsToDeduct;
                            await drug.save({ session: session! });

                            calculatedTotal += packageCalculation.totalPrice;

                            return {
                                drug: drug._id,
                                quantity: item.quantity,
                                packageType,
                                unitsSold: packageCalculation.unitsToDeduct,
                                packsSold: packageCalculation.packsSold,
                                cartonsSold: packageCalculation.cartonsSold,
                                priceAtSale: packageCalculation.unitPrice,
                            };
                        }),
                    );

                    if (Math.abs(calculatedTotal - data.totalAmount) > 0.01)
                        throw new BadRequestError(`Total mismatch. Calculated: ${calculatedTotal}, Provided: ${data.totalAmount}`);

                    const sale = await Sale.create(
                        [
                            {
                                items: saleItems,
                                totalAmount: calculatedTotal,
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

                    createdSale = sale[0];
                },
                {
                    retryWrites: true,
                    retryReads: true,
                },
            );

            return this.mapSaleToResponse(createdSale);
        } catch (error) {
            // If transaction fails, try without transaction
            if (session) {
                try {
                    await session.endSession();
                } catch (sessionError) {
                    console.error('Error ending session:', sessionError);
                }
            }

            console.warn('Transaction failed, falling back to non-transactional approach:', error);
            return this.createSaleWithoutTransaction(data);
        } finally {
            if (session) {
                try {
                    await session.endSession();
                } catch (sessionError) {
                    console.error('Error ending session:', sessionError);
                }
            }
        }
    }

    /**
     * Create a sale without transactions (fallback method)
     */
    private async createSaleWithoutTransaction(data: {
        items: { 
            drugId: string; 
            quantity: number;
            packageType?: 'individual' | 'pack' | 'carton';
        }[];
        totalAmount: number;
        paymentMethod: 'cash' | 'card' | 'mobile';
        transactionId?: string;
        notes?: string;
        userId: string;
        customerId?: string;
    }) {
        let calculatedTotal = 0;
        const saleItems = await Promise.all(
            data.items.map(async (item) => {
                const drug = await Drug.findById(item.drugId);
                if (!drug) throw new NotFoundError('Drug not found');

                const packageType = item.packageType || 'individual';
                const packageCalculation = this.calculatePackageSale(
                    drug, 
                    item.quantity, 
                    packageType
                );

                if (drug.quantity < packageCalculation.unitsToDeduct)
                    throw new BadRequestError(`Insufficient stock. Available: ${drug.quantity}, Required: ${packageCalculation.unitsToDeduct}`);

                // Update drug stock
                drug.quantity -= packageCalculation.unitsToDeduct;
                await drug.save();

                calculatedTotal += packageCalculation.totalPrice;

                return {
                    drug: drug._id,
                    quantity: item.quantity,
                    packageType,
                    unitsSold: packageCalculation.unitsToDeduct,
                    packsSold: packageCalculation.packsSold,
                    cartonsSold: packageCalculation.cartonsSold,
                    priceAtSale: packageCalculation.unitPrice,
                };
            }),
        );

        if (Math.abs(calculatedTotal - data.totalAmount) > 0.01)
            throw new BadRequestError(`Total mismatch. Calculated: ${calculatedTotal}, Provided: ${data.totalAmount}`);

        const sale = await Sale.create({
            items: saleItems,
            totalAmount: calculatedTotal,
            soldBy: new Types.ObjectId(data.userId),
            customer: data.customerId
                ? new Types.ObjectId(data.customerId)
                : undefined,
            paymentMethod: data.paymentMethod,
            transactionId: data.transactionId,
            notes: data.notes,
        });

        return this.mapSaleToResponse(sale);
    }

    /**
     * Get sales with pagination and optional date filtering
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
        const skip = (page - 1) * limit;
        const query: any = {};

        // Add date filtering if provided
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) {
                query.createdAt.$gte = new Date(startDate);
            }
            if (endDate) {
                query.createdAt.$lte = new Date(endDate);
            }
        }

        const [sales, total] = await Promise.all([
            Sale.find(query)
                .populate('items.drug')
                .populate('soldBy', 'name email')
                .populate('customer', 'name phone')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            Sale.countDocuments(query),
        ]);

        const mappedSales = sales.map((sale) => this.mapSaleToResponse(sale));

        // Group sales by date
        const groupedData: Record<string, MappedSale[]> = {};
        mappedSales.forEach((sale) => {
            const date = sale.createdAt.toISOString().split('T')[0];
            if (!groupedData[date]) {
                groupedData[date] = [];
            }
            groupedData[date].push(sale);
        });

        return {
            data: mappedSales,
            groupedData,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    /**
     * Get a sale by ID
     */
    async getSaleById(id: string): Promise<MappedSale> {
        const sale = await Sale.findById(id)
            .populate('items.drug')
            .populate('soldBy', 'name email')
            .populate('customer', 'name phone');

        if (!sale) {
            throw new NotFoundError('Sale not found');
        }

        return this.mapSaleToResponse(sale);
    }

    /**
     * Map sale document to response object
     */
    private mapSaleToResponse(sale: any): MappedSale {
        return {
            id: sale._id.toString(),
            items: sale.items.map((item: any) => ({
                id: item._id?.toString(),
                drugId: item.drug._id?.toString() || item.drug.toString(),
                name: item.drug.name || 'Unknown Drug',
                generic: item.drug.generic || '',
                brand: item.drug.brand || '',
                quantity: item.quantity,
                packageType: item.packageType || 'individual',
                unitsSold: item.unitsSold || item.quantity,
                packsSold: item.packsSold || 0,
                cartonsSold: item.cartonsSold || 0,
                priceAtSale: item.priceAtSale,
                drug: item.drug,
            })),
            soldBy: {
                id: sale.soldBy._id?.toString() || sale.soldBy.toString(),
                name: sale.soldBy.name || 'Unknown User',
                email: sale.soldBy.email || '',
            },
            customer: sale.customer
                ? {
                      id: sale.customer._id?.toString() || sale.customer.toString(),
                      name: sale.customer.name || 'Unknown Customer',
                      phone: sale.customer.phone || '',
                  }
                : undefined,
            totalAmount: sale.totalAmount,
            paymentMethod: sale.paymentMethod,
            transactionId: sale.transactionId,
            notes: sale.notes,
            createdAt: sale.createdAt,
            updatedAt: sale.updatedAt,
        };
    }
}
