import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../molecules/Card';
import { useSales } from '../../hooks/useSales';
import { useDrugs } from '../../hooks/useDrugs';
import { formatCurrency } from '../../utils/packagePricing';
import {
    FaChartLine,
    FaBox,
    FaBoxes,
    FaPills,
    FaMoneyBillAlt,
    FaCalendarAlt,
    FaTrendingUp,
    FaTrendingDown,
    FaExclamationTriangle,
    FaCheckCircle,
} from 'react-icons/fa';

interface AnalyticsData {
    totalSales: number;
    totalRevenue: number;
    averageOrderValue: number;
    packageTypeBreakdown: {
        individual: { count: number; revenue: number };
        pack: { count: number; revenue: number };
        carton: { count: number; revenue: number };
    };
    topSellingDrugs: Array<{
        id: string;
        name: string;
        totalSold: number;
        totalRevenue: number;
        packageType: string;
    }>;
    lowStockDrugs: Array<{
        id: string;
        name: string;
        quantity: number;
        threshold: number;
    }>;
    expiringDrugs: Array<{
        id: string;
        name: string;
        expiryDate: string;
        daysUntilExpiry: number;
        quantity: number;
    }>;
    salesTrend: Array<{
        date: string;
        sales: number;
        revenue: number;
    }>;
}

export const EnhancedAnalytics: React.FC = () => {
    const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
    const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
    const [isLoading, setIsLoading] = useState(true);

    const { data: salesData } = useSales({
        startDate: getStartDate(timeRange),
        endDate: new Date().toISOString(),
    });

    const { data: drugsData } = useDrugs({ limit: 1000 });

    useEffect(() => {
        if (salesData && drugsData) {
            calculateAnalytics();
        }
    }, [salesData, drugsData, timeRange]);

    const getStartDate = (range: string) => {
        const date = new Date();
        switch (range) {
            case '7d':
                date.setDate(date.getDate() - 7);
                break;
            case '30d':
                date.setDate(date.getDate() - 30);
                break;
            case '90d':
                date.setDate(date.getDate() - 90);
                break;
        }
        return date.toISOString();
    };

    const calculateAnalytics = () => {
        if (!salesData?.data || !drugsData?.drugs) return;

        const sales = salesData.data;
        const drugs = drugsData.drugs;

        // Calculate basic metrics
        const totalSales = sales.length;
        const totalRevenue = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
        const averageOrderValue = totalSales > 0 ? totalRevenue / totalSales : 0;

        // Package type breakdown
        const packageBreakdown = {
            individual: { count: 0, revenue: 0 },
            pack: { count: 0, revenue: 0 },
            carton: { count: 0, revenue: 0 },
        };

        // Top selling drugs
        const drugSales: Record<string, any> = {};

        sales.forEach((sale) => {
            sale.items.forEach((item) => {
                // Package breakdown
                const packageType = item.packageType || 'individual';
                packageBreakdown[packageType].count += 1;
                packageBreakdown[packageType].revenue += item.priceAtSale * item.quantity;

                // Drug sales tracking
                if (!drugSales[item.drugId]) {
                    drugSales[item.drugId] = {
                        id: item.drugId,
                        name: item.name,
                        totalSold: 0,
                        totalRevenue: 0,
                        packageType: packageType,
                    };
                }
                drugSales[item.drugId].totalSold += item.quantity;
                drugSales[item.drugId].totalRevenue += item.priceAtSale * item.quantity;
            });
        });

        const topSellingDrugs = Object.values(drugSales)
            .sort((a, b) => b.totalRevenue - a.totalRevenue)
            .slice(0, 10);

        // Low stock drugs
        const lowStockDrugs = drugs
            .filter((drug) => drug.quantity <= 50) // Threshold of 50 units
            .map((drug) => ({
                id: drug.id,
                name: drug.name,
                quantity: drug.quantity,
                threshold: 50,
            }))
            .sort((a, b) => a.quantity - b.quantity)
            .slice(0, 10);

        // Expiring drugs
        const today = new Date();
        const expiringDrugs = drugs
            .filter((drug) => {
                const expiryDate = new Date(drug.expiryDate);
                const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                return daysUntilExpiry <= 90 && daysUntilExpiry >= 0;
            })
            .map((drug) => {
                const expiryDate = new Date(drug.expiryDate);
                const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                return {
                    id: drug.id,
                    name: drug.name,
                    expiryDate: drug.expiryDate,
                    daysUntilExpiry,
                    quantity: drug.quantity,
                };
            })
            .sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry)
            .slice(0, 10);

        // Sales trend
        const salesByDate: Record<string, { sales: number; revenue: number }> = {};
        sales.forEach((sale) => {
            const date = new Date(sale.createdAt).toISOString().split('T')[0];
            if (!salesByDate[date]) {
                salesByDate[date] = { sales: 0, revenue: 0 };
            }
            salesByDate[date].sales += 1;
            salesByDate[date].revenue += sale.totalAmount;
        });

        const salesTrend = Object.entries(salesByDate)
            .map(([date, data]) => ({
                date,
                sales: data.sales,
                revenue: data.revenue,
            }))
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        setAnalyticsData({
            totalSales,
            totalRevenue,
            averageOrderValue,
            packageTypeBreakdown: packageBreakdown,
            topSellingDrugs,
            lowStockDrugs,
            expiringDrugs,
            salesTrend,
        });

        setIsLoading(false);
    };

    const getPackageTypeIcon = (type: string) => {
        switch (type) {
            case 'individual':
                return <FaPills className="text-gray-500" />;
            case 'pack':
                return <FaBox className="text-green-500" />;
            case 'carton':
                return <FaBoxes className="text-purple-500" />;
            default:
                return <FaPills className="text-gray-500" />;
        }
    };

    const getExpiryStatusColor = (daysUntilExpiry: number) => {
        if (daysUntilExpiry <= 7) return 'text-red-600';
        if (daysUntilExpiry <= 30) return 'text-orange-600';
        return 'text-yellow-600';
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                        <Card key={i}>
                            <CardContent className="p-6">
                                <div className="animate-pulse">
                                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                    <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    if (!analyticsData) {
        return (
            <div className="text-center py-8">
                <p className="text-gray-500">No analytics data available</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Time Range Selector */}
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
                <div className="flex gap-2">
                    {(['7d', '30d', '90d'] as const).map((range) => (
                        <button
                            key={range}
                            onClick={() => setTimeRange(range)}
                            className={`px-3 py-1 rounded-md text-sm font-medium ${
                                timeRange === range
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                        >
                            {range}
                        </button>
                    ))}
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Sales</p>
                                <p className="text-2xl font-bold text-gray-900">{analyticsData.totalSales}</p>
                            </div>
                            <FaChartLine className="h-8 w-8 text-blue-500" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {formatCurrency(analyticsData.totalRevenue)}
                                </p>
                            </div>
                            <FaMoneyBillAlt className="h-8 w-8 text-green-500" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Average Order</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {formatCurrency(analyticsData.averageOrderValue)}
                                </p>
                            </div>
                            <FaTrendingUp className="h-8 w-8 text-purple-500" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Package Sales</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {analyticsData.packageTypeBreakdown.pack.count + analyticsData.packageTypeBreakdown.carton.count}
                                </p>
                            </div>
                            <FaBoxes className="h-8 w-8 text-orange-500" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Package Type Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FaBox className="text-blue-500" />
                            Package Type Breakdown
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {Object.entries(analyticsData.packageTypeBreakdown).map(([type, data]) => (
                                <div key={type} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        {getPackageTypeIcon(type)}
                                        <div>
                                            <p className="font-medium text-gray-900 capitalize">{type}</p>
                                            <p className="text-sm text-gray-600">{data.count} sales</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-gray-900">{formatCurrency(data.revenue)}</p>
                                        <p className="text-sm text-gray-600">
                                            {((data.revenue / analyticsData.totalRevenue) * 100).toFixed(1)}%
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Top Selling Drugs */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FaTrendingUp className="text-green-500" />
                            Top Selling Drugs
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {analyticsData.topSellingDrugs.slice(0, 5).map((drug, index) => (
                                <div key={drug.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold text-blue-600">
                                            {index + 1}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">{drug.name}</p>
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                {getPackageTypeIcon(drug.packageType)}
                                                <span>{drug.totalSold} units</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-gray-900">{formatCurrency(drug.totalRevenue)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Alerts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Low Stock Drugs */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FaExclamationTriangle className="text-orange-500" />
                            Low Stock Alert
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {analyticsData.lowStockDrugs.length > 0 ? (
                            <div className="space-y-3">
                                {analyticsData.lowStockDrugs.map((drug) => (
                                    <div key={drug.id} className="flex items-center justify-between p-3 bg-orange-50 border border-orange-200 rounded-lg">
                                        <div>
                                            <p className="font-medium text-gray-900">{drug.name}</p>
                                            <p className="text-sm text-orange-600">
                                                Only {drug.quantity} units remaining
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <div className="w-12 h-2 bg-orange-200 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-orange-500 rounded-full"
                                                    style={{ width: `${(drug.quantity / drug.threshold) * 100}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-4">
                                <FaCheckCircle className="mx-auto h-8 w-8 text-green-500 mb-2" />
                                <p className="text-green-600">All drugs have sufficient stock</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Expiring Drugs */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FaCalendarAlt className="text-red-500" />
                            Expiring Soon
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {analyticsData.expiringDrugs.length > 0 ? (
                            <div className="space-y-3">
                                {analyticsData.expiringDrugs.map((drug) => (
                                    <div key={drug.id} className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
                                        <div>
                                            <p className="font-medium text-gray-900">{drug.name}</p>
                                            <p className={`text-sm ${getExpiryStatusColor(drug.daysUntilExpiry)}`}>
                                                Expires in {drug.daysUntilExpiry} days ({drug.quantity} units)
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-gray-600">
                                                {new Date(drug.expiryDate).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-4">
                                <FaCheckCircle className="mx-auto h-8 w-8 text-green-500 mb-2" />
                                <p className="text-green-600">No drugs expiring soon</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Sales Trend Chart */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FaChartLine className="text-blue-500" />
                        Sales Trend ({timeRange})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-64 flex items-end justify-between gap-2">
                        {analyticsData.salesTrend.map((day, index) => {
                            const maxRevenue = Math.max(...analyticsData.salesTrend.map(d => d.revenue));
                            const height = maxRevenue > 0 ? (day.revenue / maxRevenue) * 100 : 0;
                            
                            return (
                                <div key={day.date} className="flex-1 flex flex-col items-center">
                                    <div className="w-full bg-blue-100 rounded-t" style={{ height: `${height}%` }}>
                                        <div className="w-full bg-blue-500 rounded-t" style={{ height: '100%' }}></div>
                                    </div>
                                    <div className="text-xs text-gray-600 mt-2 text-center">
                                        <div>{new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                                        <div className="font-medium">{day.sales}</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
