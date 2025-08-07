import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../molecules/Card';
import { useSales } from '../../hooks/useSales';
import { useDrugs } from '../../hooks/useDrugs';
import { formatCurrency } from '../../utils/packagePricing';
import {
    FaDownload,
    FaFilter,
    FaBox,
    FaBoxes,
    FaPills,
    FaChartBar,
    FaTable,
    FaCalendarAlt,
    FaSearch,
} from 'react-icons/fa';

interface PackageSalesReportProps {
    startDate?: string;
    endDate?: string;
    drugId?: string;
    packageType?: 'all' | 'individual' | 'pack' | 'carton';
}

interface SalesReportData {
    summary: {
        totalSales: number;
        totalRevenue: number;
        totalUnits: number;
        totalPacks: number;
        totalCartons: number;
        averageOrderValue: number;
    };
    packageBreakdown: {
        individual: { sales: number; revenue: number; units: number };
        pack: { sales: number; revenue: number; units: number; packs: number };
        carton: { sales: number; revenue: number; units: number; cartons: number };
    };
    drugPerformance: Array<{
        id: string;
        name: string;
        generic: string;
        brand: string;
        totalSold: number;
        totalRevenue: number;
        packageType: string;
        unitsSold: number;
        packsSold: number;
        cartonsSold: number;
    }>;
    dailySales: Array<{
        date: string;
        sales: number;
        revenue: number;
        units: number;
        packs: number;
        cartons: number;
    }>;
}

export const PackageSalesReport: React.FC<PackageSalesReportProps> = ({
    startDate,
    endDate,
    drugId,
    packageType = 'all',
}) => {
    const [reportData, setReportData] = useState<SalesReportData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [filters, setFilters] = useState({
        startDate: startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: endDate || new Date().toISOString().split('T')[0],
        drugId: drugId || '',
        packageType: packageType,
    });

    const { data: salesData } = useSales({
        startDate: filters.startDate,
        endDate: filters.endDate,
    });

    const { data: drugsData } = useDrugs({ limit: 1000 });

    useEffect(() => {
        if (salesData && drugsData) {
            generateReport();
        }
    }, [salesData, drugsData, filters]);

    const generateReport = () => {
        if (!salesData?.data || !drugsData?.drugs) return;

        const sales = salesData.data;
        const drugs = drugsData.drugs;

        // Filter sales based on criteria
        let filteredSales = sales;
        if (filters.drugId) {
            filteredSales = sales.filter(sale =>
                sale.items.some(item => item.drugId === filters.drugId)
            );
        }

        // Calculate summary
        const summary = {
            totalSales: filteredSales.length,
            totalRevenue: filteredSales.reduce((sum, sale) => sum + sale.totalAmount, 0),
            totalUnits: 0,
            totalPacks: 0,
            totalCartons: 0,
            averageOrderValue: 0,
        };

        // Package breakdown
        const packageBreakdown = {
            individual: { sales: 0, revenue: 0, units: 0 },
            pack: { sales: 0, revenue: 0, units: 0, packs: 0 },
            carton: { sales: 0, revenue: 0, units: 0, cartons: 0 },
        };

        // Drug performance tracking
        const drugPerformance: Record<string, any> = {};

        // Daily sales tracking
        const dailySales: Record<string, any> = {};

        filteredSales.forEach((sale) => {
            const saleDate = new Date(sale.createdAt).toISOString().split('T')[0];
            
            if (!dailySales[saleDate]) {
                dailySales[saleDate] = {
                    date: saleDate,
                    sales: 0,
                    revenue: 0,
                    units: 0,
                    packs: 0,
                    cartons: 0,
                };
            }

            dailySales[saleDate].sales += 1;
            dailySales[saleDate].revenue += sale.totalAmount;

            sale.items.forEach((item) => {
                const itemPackageType = item.packageType || 'individual';
                
                // Apply package type filter
                if (filters.packageType !== 'all' && itemPackageType !== filters.packageType) {
                    return;
                }

                // Update summary
                summary.totalUnits += item.unitsSold || item.quantity;
                if (item.packsSold) summary.totalPacks += item.packsSold;
                if (item.cartonsSold) summary.totalCartons += item.cartonsSold;

                // Update package breakdown
                if (itemPackageType === 'individual') {
                    packageBreakdown.individual.sales += 1;
                    packageBreakdown.individual.revenue += item.priceAtSale * item.quantity;
                    packageBreakdown.individual.units += item.quantity;
                    dailySales[saleDate].units += item.quantity;
                } else if (itemPackageType === 'pack') {
                    packageBreakdown.pack.sales += 1;
                    packageBreakdown.pack.revenue += item.priceAtSale * item.quantity;
                    packageBreakdown.pack.units += item.unitsSold || item.quantity;
                    packageBreakdown.pack.packs += item.packsSold || 0;
                    dailySales[saleDate].packs += item.packsSold || 0;
                } else if (itemPackageType === 'carton') {
                    packageBreakdown.carton.sales += 1;
                    packageBreakdown.carton.revenue += item.priceAtSale * item.quantity;
                    packageBreakdown.carton.units += item.unitsSold || item.quantity;
                    packageBreakdown.carton.cartons += item.cartonsSold || 0;
                    dailySales[saleDate].cartons += item.cartonsSold || 0;
                }

                // Update drug performance
                if (!drugPerformance[item.drugId]) {
                    const drug = drugs.find(d => d.id === item.drugId);
                    drugPerformance[item.drugId] = {
                        id: item.drugId,
                        name: item.name || drug?.name || 'Unknown Drug',
                        generic: drug?.generic || '',
                        brand: drug?.brand || '',
                        totalSold: 0,
                        totalRevenue: 0,
                        packageType: itemPackageType,
                        unitsSold: 0,
                        packsSold: 0,
                        cartonsSold: 0,
                    };
                }

                drugPerformance[item.drugId].totalSold += item.quantity;
                drugPerformance[item.drugId].totalRevenue += item.priceAtSale * item.quantity;
                drugPerformance[item.drugId].unitsSold += item.unitsSold || item.quantity;
                drugPerformance[item.drugId].packsSold += item.packsSold || 0;
                drugPerformance[item.drugId].cartonsSold += item.cartonsSold || 0;
            });
        });

        summary.averageOrderValue = summary.totalSales > 0 ? summary.totalRevenue / summary.totalSales : 0;

        const sortedDrugPerformance = Object.values(drugPerformance)
            .sort((a, b) => b.totalRevenue - a.totalRevenue);

        const sortedDailySales = Object.values(dailySales)
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        setReportData({
            summary,
            packageBreakdown,
            drugPerformance: sortedDrugPerformance,
            dailySales: sortedDailySales,
        });

        setIsLoading(false);
    };

    const handleFilterChange = (newFilters: Partial<typeof filters>) => {
        setFilters(prev => ({ ...prev, ...newFilters }));
    };

    const exportReport = () => {
        if (!reportData) return;

        const csvData = [
            ['Package Sales Report'],
            [''],
            ['Summary'],
            ['Total Sales', reportData.summary.totalSales],
            ['Total Revenue', formatCurrency(reportData.summary.totalRevenue)],
            ['Total Units', reportData.summary.totalUnits],
            ['Total Packs', reportData.summary.totalPacks],
            ['Total Cartons', reportData.summary.totalCartons],
            ['Average Order Value', formatCurrency(reportData.summary.averageOrderValue)],
            [''],
            ['Package Breakdown'],
            ['Type', 'Sales', 'Revenue', 'Units', 'Packs', 'Cartons'],
            ['Individual', reportData.packageBreakdown.individual.sales, formatCurrency(reportData.packageBreakdown.individual.revenue), reportData.packageBreakdown.individual.units, '', ''],
            ['Pack', reportData.packageBreakdown.pack.sales, formatCurrency(reportData.packageBreakdown.pack.revenue), reportData.packageBreakdown.pack.units, reportData.packageBreakdown.pack.packs, ''],
            ['Carton', reportData.packageBreakdown.carton.sales, formatCurrency(reportData.packageBreakdown.carton.revenue), reportData.packageBreakdown.carton.units, '', reportData.packageBreakdown.carton.cartons],
            [''],
            ['Top Performing Drugs'],
            ['Name', 'Generic', 'Brand', 'Total Sold', 'Total Revenue', 'Units', 'Packs', 'Cartons'],
            ...reportData.drugPerformance.slice(0, 10).map(drug => [
                drug.name,
                drug.generic,
                drug.brand,
                drug.totalSold,
                formatCurrency(drug.totalRevenue),
                drug.unitsSold,
                drug.packsSold,
                drug.cartonsSold,
            ]),
        ];

        const csvContent = csvData.map(row => row.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `package-sales-report-${filters.startDate}-to-${filters.endDate}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
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

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-900">Package Sales Report</h2>
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-200 rounded w-32"></div>
                    </div>
                </div>
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

    if (!reportData) {
        return (
            <div className="text-center py-8">
                <p className="text-gray-500">No report data available</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-2xl font-bold text-gray-900">Package Sales Report</h2>
                <div className="flex gap-2">
                    <button
                        onClick={exportReport}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-2"
                    >
                        <FaDownload />
                        Export CSV
                    </button>
                </div>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FaFilter className="text-blue-500" />
                        Report Filters
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                            <input
                                type="date"
                                value={filters.startDate}
                                onChange={(e) => handleFilterChange({ startDate: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                            <input
                                type="date"
                                value={filters.endDate}
                                onChange={(e) => handleFilterChange({ endDate: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Package Type</label>
                            <select
                                value={filters.packageType}
                                onChange={(e) => handleFilterChange({ packageType: e.target.value as any })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="all">All Types</option>
                                <option value="individual">Individual</option>
                                <option value="pack">Pack</option>
                                <option value="carton">Carton</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Drug</label>
                            <select
                                value={filters.drugId}
                                onChange={(e) => handleFilterChange({ drugId: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">All Drugs</option>
                                {drugsData?.drugs?.map((drug) => (
                                    <option key={drug.id} value={drug.id}>
                                        {drug.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Sales</p>
                                <p className="text-2xl font-bold text-gray-900">{reportData.summary.totalSales}</p>
                            </div>
                            <FaChartBar className="h-8 w-8 text-blue-500" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {formatCurrency(reportData.summary.totalRevenue)}
                                </p>
                            </div>
                            <FaChartBar className="h-8 w-8 text-green-500" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Units</p>
                                <p className="text-2xl font-bold text-gray-900">{reportData.summary.totalUnits.toLocaleString()}</p>
                            </div>
                            <FaPills className="h-8 w-8 text-purple-500" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Avg Order Value</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {formatCurrency(reportData.summary.averageOrderValue)}
                                </p>
                            </div>
                            <FaChartBar className="h-8 w-8 text-orange-500" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Package Breakdown */}
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
                            {Object.entries(reportData.packageBreakdown).map(([type, data]) => (
                                <div key={type} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        {getPackageTypeIcon(type)}
                                        <div>
                                            <p className="font-medium text-gray-900 capitalize">{type}</p>
                                            <p className="text-sm text-gray-600">{data.sales} sales</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-gray-900">{formatCurrency(data.revenue)}</p>
                                        <p className="text-sm text-gray-600">
                                            {data.units.toLocaleString()} units
                                            {type === 'pack' && data.packs > 0 && ` (${data.packs} packs)`}
                                            {type === 'carton' && data.cartons > 0 && ` (${data.cartons} cartons)`}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Top Performing Drugs */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FaTable className="text-green-500" />
                            Top Performing Drugs
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {reportData.drugPerformance.slice(0, 8).map((drug, index) => (
                                <div key={drug.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold text-blue-600">
                                            {index + 1}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">{drug.name}</p>
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                {getPackageTypeIcon(drug.packageType)}
                                                <span>{drug.totalSold} sold</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-gray-900">{formatCurrency(drug.totalRevenue)}</p>
                                        <p className="text-xs text-gray-600">
                                            {drug.unitsSold} units
                                            {drug.packsSold > 0 && `, ${drug.packsSold} packs`}
                                            {drug.cartonsSold > 0 && `, ${drug.cartonsSold} cartons`}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Daily Sales Trend */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FaCalendarAlt className="text-purple-500" />
                        Daily Sales Trend
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-64 flex items-end justify-between gap-2">
                        {reportData.dailySales.map((day) => {
                            const maxRevenue = Math.max(...reportData.dailySales.map(d => d.revenue));
                            const height = maxRevenue > 0 ? (day.revenue / maxRevenue) * 100 : 0;
                            
                            return (
                                <div key={day.date} className="flex-1 flex flex-col items-center">
                                    <div className="w-full bg-purple-100 rounded-t" style={{ height: `${height}%` }}>
                                        <div className="w-full bg-purple-500 rounded-t" style={{ height: '100%' }}></div>
                                    </div>
                                    <div className="text-xs text-gray-600 mt-2 text-center">
                                        <div>{new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                                        <div className="font-medium">{day.sales}</div>
                                        <div className="text-xs">{formatCurrency(day.revenue)}</div>
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
