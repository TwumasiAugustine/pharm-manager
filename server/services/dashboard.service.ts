import { Sale } from '../models/sale.model';
import { Drug } from '../models/drug.model';
import Customer from '../models/customer.model';
import { Types } from 'mongoose';
import { ITokenPayload } from '../types/auth.types';
import {
    getBranchScopingFilter,
    getPharmacyScopingFilter,
} from '../utils/data-scoping';

export class DashboardService {
    /**
     * Get dashboard analytics with total sales, drug stats, and top-selling drugs
     * @param startDate - Start date for filtering (optional)
     * @param endDate - End date for filtering (optional)
     * @param period - Time period filter ('day', 'week', 'month', 'year')
     * @param branchId - Branch ID for filtering (optional)
     * @param user - User context for data scoping
     * @returns Dashboard analytics data
     */
    async getDashboardAnalytics(
        {
            startDate,
            endDate,
            period = 'month',
            branchId,
        }: {
            startDate?: string;
            endDate?: string;
            period?: 'day' | 'week' | 'month' | 'year';
            branchId?: string;
        },
        user: ITokenPayload,
    ) {
        // Build date filter query with data scoping
        const dateQuery = this.buildDateQuery(
            startDate,
            endDate,
            period,
            branchId,
            user,
        );

        // Run all analytics queries in parallel
        const [
            totalSales,
            totalRevenue,
            totalProfit,
            topSellingDrugs,
            lowStockDrugs,
            totalCustomers,
            totalDrugs,
            salesByPeriod,
            revenueByPeriod,
            profitByPeriod,
            saleTypeDistribution,
            profitMarginAnalysis,
        ] = await Promise.all([
            this.getTotalSales(dateQuery),
            this.getTotalRevenue(dateQuery),
            this.getTotalProfit(dateQuery),
            this.getTopSellingDrugs(dateQuery),
            this.getLowStockDrugs(branchId, user),
            this.getTotalCustomers(user),
            this.getTotalDrugs(branchId, user),
            this.getSalesByPeriod(dateQuery, period),
            this.getRevenueByPeriod(dateQuery, period),
            this.getProfitByPeriod(dateQuery, period),
            this.getSaleTypeDistribution(dateQuery),
            this.getProfitMarginAnalysis(dateQuery),
        ]);

        return {
            overview: {
                totalSales,
                totalRevenue,
                totalProfit,
                totalCustomers,
                totalDrugs,
                lowStockCount: lowStockDrugs.length,
                profitMargin:
                    totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0,
                averageOrderValue:
                    totalSales > 0 ? totalRevenue / totalSales : 0,
            },
            charts: {
                topSellingDrugs,
                lowStockDrugs,
                salesByPeriod,
                revenueByPeriod,
                profitByPeriod,
                saleTypeDistribution,
                profitMarginAnalysis,
            },
        };
    }

    /**
     * Get sales trends for charts
     * @param startDate - Start date for filtering
     * @param endDate - End date for filtering
     * @param period - Grouping period
     * @returns Sales trend data
     */
    async getSalesTrends(
        {
            startDate,
            endDate,
            period = 'day',
        }: {
            startDate?: string;
            endDate?: string;
            period?: 'day' | 'week' | 'month';
        },
        user: ITokenPayload,
    ) {
        const dateQuery = this.buildDateQuery(
            startDate,
            endDate,
            period,
            undefined,
            user,
        );

        const [salesByPeriod, revenueByPeriod] = await Promise.all([
            this.getSalesByPeriod(dateQuery, period),
            this.getRevenueByPeriod(dateQuery, period),
        ]);

        return {
            salesByPeriod,
            revenueByPeriod,
        };
    }

    /**
     * Build MongoDB date query based on filters
     */
    private buildDateQuery(
        startDate?: string,
        endDate?: string,
        period?: string,
        branchId?: string,
        user?: ITokenPayload,
    ) {
        const query: any = {};

        // Apply data scoping based on user role and assignments
        if (user) {
            const scopingFilter = getBranchScopingFilter(user);
            Object.assign(query, scopingFilter);
        }

        // Add branch filter if provided (and not already set by scoping)
        if (branchId && !query.branch) {
            query.branch = new Types.ObjectId(branchId);
        }

        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) query.createdAt.$lte = new Date(endDate);
        } else {
            // Default based on period
            const now = new Date();
            switch (period) {
                case 'day':
                    query.createdAt = {
                        $gte: new Date(
                            now.getFullYear(),
                            now.getMonth(),
                            now.getDate(),
                        ),
                    };
                    break;
                case 'week':
                    const weekStart = new Date(now);
                    weekStart.setDate(now.getDate() - 7);
                    query.createdAt = { $gte: weekStart };
                    break;
                case 'month':
                    query.createdAt = {
                        $gte: new Date(now.getFullYear(), now.getMonth(), 1),
                    };
                    break;
                case 'year':
                    query.createdAt = {
                        $gte: new Date(now.getFullYear(), 0, 1),
                    };
                    break;
            }
        }

        return query;
    }

    /**
     * Get total number of sales
     */
    private async getTotalSales(dateQuery: any): Promise<number> {
        return await Sale.countDocuments(dateQuery);
    }

    /**
     * Get total revenue
     */
    private async getTotalRevenue(dateQuery: any): Promise<number> {
        const result = await Sale.aggregate([
            { $match: dateQuery },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } },
        ]);
        return result[0]?.total || 0;
    }

    /**
     * Get total profit from sales
     */
    private async getTotalProfit(dateQuery: any): Promise<number> {
        const result = await Sale.aggregate([
            { $match: dateQuery },
            { $group: { _id: null, total: { $sum: '$totalProfit' } } },
        ]);
        return result[0]?.total || 0;
    }

    /**
     * Get top-selling drugs with enhanced metrics
     */
    private async getTopSellingDrugs(dateQuery: any, limit = 3) {
        const result = await Sale.aggregate([
            { $match: dateQuery },
            { $unwind: '$items' },
            {
                $group: {
                    _id: '$items.drug',
                    totalQuantity: { $sum: '$items.quantity' },
                    totalRevenue: {
                        $sum: {
                            $multiply: [
                                '$items.quantity',
                                '$items.priceAtSale',
                            ],
                        },
                    },
                    totalProfit: { $sum: '$items.profit' },
                    salesByType: {
                        $push: {
                            saleType: '$items.saleType',
                            quantity: '$items.quantity',
                        },
                    },
                },
            },
            {
                $addFields: {
                    groupedSalesType: {
                        $reduce: {
                            input: '$salesByType',
                            initialValue: {},
                            in: {
                                $mergeObjects: [
                                    '$$value',
                                    {
                                        $cond: [
                                            {
                                                $ne: [
                                                    {
                                                        $type: {
                                                            $getField: {
                                                                field: '$$this.saleType',
                                                                input: '$$value',
                                                            },
                                                        },
                                                    },
                                                    'missing',
                                                ],
                                            },
                                            {
                                                $arrayToObject: [
                                                    [
                                                        {
                                                            k: '$$this.saleType',
                                                            v: {
                                                                $add: [
                                                                    {
                                                                        $getField:
                                                                            {
                                                                                field: '$$this.saleType',
                                                                                input: '$$value',
                                                                            },
                                                                    },
                                                                    '$$this.quantity',
                                                                ],
                                                            },
                                                        },
                                                    ],
                                                ],
                                            },
                                            {
                                                $arrayToObject: [
                                                    [
                                                        {
                                                            k: '$$this.saleType',
                                                            v: '$$this.quantity',
                                                        },
                                                    ],
                                                ],
                                            },
                                        ],
                                    },
                                ],
                            },
                        },
                    },
                },
            },
            {
                $addFields: {
                    salesByType: {
                        $map: {
                            input: { $objectToArray: '$groupedSalesType' },
                            as: 'item',
                            in: {
                                saleType: '$$item.k',
                                quantity: '$$item.v',
                            },
                        },
                    },
                },
            },
            { $sort: { totalQuantity: -1 } },
            { $limit: limit },
            {
                $lookup: {
                    from: 'drugs',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'drug',
                },
            },
            { $unwind: '$drug' },
            {
                $project: {
                    id: '$drug._id',
                    name: '$drug.name',
                    brand: '$drug.brand',
                    category: '$drug.category',
                    totalQuantity: 1,
                    totalRevenue: 1,
                    salesByType: 1,
                },
            },
        ]);

        return result.map((item) => ({
            ...item,
            id: item.id.toString(),
        }));
    }

    /**
     * Get drugs with low stock (quantity < 10) with branch filtering
     */
    private async getLowStockDrugs(
        branchId?: string,
        user?: ITokenPayload,
        threshold = 10,
    ) {
        const query: any = { quantity: { $lt: threshold } };

        // Apply data scoping based on user role and assignments
        if (user) {
            const scopingFilter = getBranchScopingFilter(user);
            Object.assign(query, scopingFilter);
        }

        // Add branch filter if provided (and not already set by scoping)
        if (branchId && !query.branch) {
            query.branch = new Types.ObjectId(branchId);
        }

        const drugs = await Drug.find(query).sort({ quantity: 1 }).limit(20);

        return drugs.map((drug) => ({
            id: (drug._id as Types.ObjectId).toString(),
            name: drug.name,
            brand: drug.brand,
            category: drug.category,
            quantity: drug.quantity,
            price: drug.pricePerUnit, // Map pricePerUnit to price for consistency
            pricePerUnit: drug.pricePerUnit,
            pricePerPack: drug.pricePerPack,
            pricePerCarton: drug.pricePerCarton,
            costPrice: drug.costPrice,
            profitPerUnit: drug.pricePerUnit - drug.costPrice,
            expiryDate: drug.expiryDate,
            batchNumber: drug.batchNumber,
            requiresPrescription: drug.requiresPrescription,
        }));
    }

    /**
     * Get total number of customers
     */
    private async getTotalCustomers(user?: ITokenPayload): Promise<number> {
        const query: any = {};

        // Apply data scoping based on user role and assignments
        if (user) {
            const scopingFilter = getPharmacyScopingFilter(user);
            Object.assign(query, scopingFilter);
        }

        return await Customer.countDocuments(query);
    }

    /**
     * Get total number of drugs with branch filtering
     */
    private async getTotalDrugs(
        branchId?: string,
        user?: ITokenPayload,
    ): Promise<number> {
        const query: any = {};

        // Apply data scoping based on user role and assignments
        if (user) {
            const scopingFilter = getBranchScopingFilter(user);
            Object.assign(query, scopingFilter);
        }

        // Add branch filter if provided (and not already set by scoping)
        if (branchId && !query.branch) {
            query.branch = new Types.ObjectId(branchId);
        }

        return await Drug.countDocuments(query);
    }

    /**
     * Get sales grouped by period with enhanced metrics
     */
    private async getSalesByPeriod(dateQuery: any, period: string) {
        const groupFormat = this.getGroupFormat(period);

        const result = await Sale.aggregate([
            { $match: dateQuery },
            {
                $group: {
                    _id: groupFormat,
                    count: { $sum: 1 },
                    revenue: { $sum: '$totalAmount' },
                    profit: { $sum: '$totalProfit' },
                },
            },
            { $sort: { _id: 1 } },
        ]);

        return result.map((item) => ({
            period: this.formatPeriodLabel(item._id, period),
            sales: item.count,
            revenue: item.revenue,
            profit: item.profit,
            profitMargin:
                item.revenue > 0 ? (item.profit / item.revenue) * 100 : 0,
        }));
    }

    /**
     * Get revenue grouped by period
     */
    private async getRevenueByPeriod(dateQuery: any, period: string) {
        return await this.getSalesByPeriod(dateQuery, period);
    }

    /**
     * Get profit trends by period
     */
    private async getProfitByPeriod(dateQuery: any, period: string) {
        const groupFormat = this.getGroupFormat(period);

        const result = await Sale.aggregate([
            { $match: dateQuery },
            {
                $group: {
                    _id: groupFormat,
                    totalProfit: { $sum: '$totalProfit' },
                    totalRevenue: { $sum: '$totalAmount' },
                    salesCount: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
        ]);

        return result.map((item) => ({
            period: this.formatPeriodLabel(item._id, period),
            profit: item.totalProfit,
            revenue: item.totalRevenue,
            margin:
                item.totalRevenue > 0
                    ? (item.totalProfit / item.totalRevenue) * 100
                    : 0,
            averageProfitPerSale:
                item.salesCount > 0 ? item.totalProfit / item.salesCount : 0,
        }));
    }

    /**
     * Get sale type distribution analysis
     */
    private async getSaleTypeDistribution(dateQuery: any) {
        const result = await Sale.aggregate([
            { $match: dateQuery },
            { $unwind: '$items' },
            // Filter out items where saleType is null or undefined
            { $match: { 'items.saleType': { $exists: true, $ne: null } } },
            {
                $group: {
                    _id: '$items.saleType',
                    count: { $sum: 1 },
                    totalQuantity: { $sum: '$items.quantity' },
                    totalRevenue: {
                        $sum: {
                            $multiply: [
                                '$items.quantity',
                                '$items.priceAtSale',
                            ],
                        },
                    },
                    totalProfit: { $sum: '$items.profit' },
                },
            },
            { $sort: { totalRevenue: -1 } },
        ]);

        const total = result.reduce((sum, item) => sum + item.totalRevenue, 0);

        return result.map((item) => ({
            type: item._id || 'unit', // Map to 'type' field and provide default
            count: item.count,
            totalQuantity: item.totalQuantity,
            revenue: item.totalRevenue, // Map to 'revenue' field
            profit: item.totalProfit, // Map to 'profit' field
            profitMargin:
                item.totalRevenue > 0
                    ? (item.totalProfit / item.totalRevenue) * 100
                    : 0,
            percentage: total > 0 ? (item.totalRevenue / total) * 100 : 0,
        }));
    }

    /**
     * Get profit margin analysis by category
     */
    private async getProfitMarginAnalysis(dateQuery: any) {
        const result = await Sale.aggregate([
            { $match: dateQuery },
            { $unwind: '$items' },
            {
                $lookup: {
                    from: 'drugs',
                    localField: 'items.drug',
                    foreignField: '_id',
                    as: 'drugData',
                },
            },
            { $unwind: '$drugData' },
            {
                $group: {
                    _id: '$drugData.category',
                    totalRevenue: {
                        $sum: {
                            $multiply: [
                                '$items.quantity',
                                '$items.priceAtSale',
                            ],
                        },
                    },
                    totalProfit: { $sum: '$items.profit' },
                    salesCount: { $sum: 1 },
                    averagePrice: { $avg: '$items.priceAtSale' },
                },
            },
            {
                $project: {
                    category: '$_id',
                    totalRevenue: 1,
                    totalProfit: 1,
                    salesCount: 1,
                    averagePrice: 1,
                    profitMargin: {
                        $cond: [
                            { $gt: ['$totalRevenue', 0] },
                            {
                                $multiply: [
                                    {
                                        $divide: [
                                            '$totalProfit',
                                            '$totalRevenue',
                                        ],
                                    },
                                    100,
                                ],
                            },
                            0,
                        ],
                    },
                },
            },
            { $sort: { profitMargin: -1 } },
        ]);

        return result;
    }

    /**
     * Get MongoDB group format based on period
     */
    private getGroupFormat(period: string) {
        switch (period) {
            case 'day':
                return {
                    year: { $year: '$createdAt' },
                    month: { $month: '$createdAt' },
                    day: { $dayOfMonth: '$createdAt' },
                };
            case 'week':
                return {
                    year: { $year: '$createdAt' },
                    week: { $week: '$createdAt' },
                };
            case 'month':
                return {
                    year: { $year: '$createdAt' },
                    month: { $month: '$createdAt' },
                };
            case 'year':
                return {
                    year: { $year: '$createdAt' },
                };
            default:
                return {
                    year: { $year: '$createdAt' },
                    month: { $month: '$createdAt' },
                    day: { $dayOfMonth: '$createdAt' },
                };
        }
    }

    /**
     * Format period label for display
     */
    private formatPeriodLabel(groupId: any, period: string): string {
        switch (period) {
            case 'day':
                return `${groupId.year}-${String(groupId.month).padStart(2, '0')}-${String(groupId.day).padStart(2, '0')}`;
            case 'week':
                return `${groupId.year}-W${String(groupId.week).padStart(2, '0')}`;
            case 'month':
                return `${groupId.year}-${String(groupId.month).padStart(2, '0')}`;
            case 'year':
                return `${groupId.year}`;
            default:
                return `${groupId.year}-${String(groupId.month).padStart(2, '0')}-${String(groupId.day).padStart(2, '0')}`;
        }
    }
}
