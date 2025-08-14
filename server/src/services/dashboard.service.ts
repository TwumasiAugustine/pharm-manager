import { Sale } from '../models/sale.model';
import { Drug } from '../models/drug.model';
import Customer from '../models/customer.model';
import { Types } from 'mongoose';

export class DashboardService {
    /**
     * Get dashboard analytics with total sales, drug stats, and top-selling drugs
     * @param startDate - Start date for filtering (optional)
     * @param endDate - End date for filtering (optional)
     * @param period - Time period filter ('day', 'week', 'month', 'year')
     * @returns Dashboard analytics data
     */
    async getDashboardAnalytics({
        startDate,
        endDate,
        period = 'month',
    }: {
        startDate?: string;
        endDate?: string;
        period?: 'day' | 'week' | 'month' | 'year';
    }) {
        // Build date filter query
        const dateQuery = this.buildDateQuery(startDate, endDate, period);

        // Run all analytics queries in parallel
        const [
            totalSales,
            totalRevenue,
            topSellingDrugs,
            lowStockDrugs,
            totalCustomers,
            totalDrugs,
            salesByPeriod,
            revenueByPeriod,
        ] = await Promise.all([
            this.getTotalSales(dateQuery),
            this.getTotalRevenue(dateQuery),
            this.getTopSellingDrugs(dateQuery),
            this.getLowStockDrugs(),
            this.getTotalCustomers(),
            this.getTotalDrugs(),
            this.getSalesByPeriod(dateQuery, period),
            this.getRevenueByPeriod(dateQuery, period),
        ]);

        return {
            overview: {
                totalSales,
                totalRevenue,
                totalCustomers,
                totalDrugs,
                lowStockCount: lowStockDrugs.length,
            },
            charts: {
                topSellingDrugs,
                lowStockDrugs,
                salesByPeriod,
                revenueByPeriod,
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
    async getSalesTrends({
        startDate,
        endDate,
        period = 'day',
    }: {
        startDate?: string;
        endDate?: string;
        period?: 'day' | 'week' | 'month';
    }) {
        const dateQuery = this.buildDateQuery(startDate, endDate, period);

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
    ) {
        const query: any = {};

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
     * Get top-selling drugs
     */
    private async getTopSellingDrugs(dateQuery: any, limit = 10) {
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
                },
            },
        ]);

        return result.map((item) => ({
            ...item,
            id: item.id.toString(),
        }));
    }

    /**
     * Get drugs with low stock (quantity < 10)
     */
    private async getLowStockDrugs(threshold = 10) {
        const drugs = await Drug.find({ quantity: { $lt: threshold } })
            .sort({ quantity: 1 })
            .limit(20);

        return drugs.map((drug) => ({
            id: (drug._id as Types.ObjectId).toString(),
            name: drug.name,
            brand: drug.brand,
            category: drug.category,
            quantity: drug.quantity,
            pricePerUnit: drug.pricePerUnit,
            pricePerPack: drug.pricePerPack,
            pricePerCarton: drug.pricePerCarton,
            expiryDate: drug.expiryDate,
            batchNumber: drug.batchNumber,
            requiresPrescription: drug.requiresPrescription,
        }));
    }

    /**
     * Get total number of customers
     */
    private async getTotalCustomers(): Promise<number> {
        return await Customer.countDocuments();
    }

    /**
     * Get total number of drugs
     */
    private async getTotalDrugs(): Promise<number> {
        return await Drug.countDocuments();
    }

    /**
     * Get sales grouped by period
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
                },
            },
            { $sort: { _id: 1 } },
        ]);

        return result.map((item) => ({
            period: this.formatPeriodLabel(item._id, period),
            sales: item.count,
            revenue: item.revenue,
        }));
    }

    /**
     * Get revenue grouped by period
     */
    private async getRevenueByPeriod(dateQuery: any, period: string) {
        return await this.getSalesByPeriod(dateQuery, period);
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
