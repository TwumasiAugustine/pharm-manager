import type { ReportDataItem } from '../../../types/report.types';

export interface SalesChartData {
    date: string;
    totalSales: number;
    totalProfit: number;
    count: number;
}

export interface InventoryChartData {
    category: string;
    totalValue: number;
    totalQuantity: number;
    count: number;
}

export interface ExpiryChartData {
    alertLevel: string;
    count: number;
    totalValue: number;
}

export interface FinancialChartData {
    date: string;
    revenue: number;
    profit: number;
}

export const prepareSalesData = (
    data: ReportDataItem[],
): SalesChartData[] => {
    const groupedData = data.reduce(
        (acc, item) => {
            const date = new Date(item.date).toLocaleDateString();
            if (!acc[date]) {
                acc[date] = {
                    date,
                    totalSales: 0,
                    totalProfit: 0,
                    count: 0,
                };
            }
            acc[date].totalSales += item.totalPrice;
            acc[date].totalProfit += item.profit || 0;
            acc[date].count += 1;
            return acc;
        },
        {} as Record<string, SalesChartData>,
    );

    return Object.values(groupedData).sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );
};

export const prepareInventoryData = (
    data: ReportDataItem[],
): InventoryChartData[] => {
    const groupedData = data.reduce(
        (acc, item) => {
            const category = item.category || 'Other';
            if (!acc[category]) {
                acc[category] = {
                    category,
                    totalValue: 0,
                    totalQuantity: 0,
                    count: 0,
                };
            }
            acc[category].totalValue += item.totalPrice;
            acc[category].totalQuantity += item.quantity;
            acc[category].count += 1;
            return acc;
        },
        {} as Record<string, InventoryChartData>,
    );

    return Object.values(groupedData);
};

export const prepareExpiryData = (
    data: ReportDataItem[],
): ExpiryChartData[] => {
    const groupedData = data.reduce(
        (acc, item) => {
            const daysLeft =
                item.daysUntilExpiry !== undefined
                    ? item.daysUntilExpiry
                    : item.expiryDate
                    ? Math.ceil(
                          (new Date(item.expiryDate).getTime() - Date.now()) /
                              (1000 * 60 * 60 * 24),
                      )
                    : 0;

            let alertLevel: string;
            if (daysLeft <= 0) alertLevel = 'Expired';
            else if (daysLeft <= 30) alertLevel = 'Critical';
            else if (daysLeft <= 90) alertLevel = 'Warning';
            else alertLevel = 'Normal';

            if (!acc[alertLevel]) {
                acc[alertLevel] = {
                    alertLevel,
                    count: 0,
                    totalValue: 0,
                };
            }
            acc[alertLevel].count += 1;
            acc[alertLevel].totalValue += item.totalPrice;
            return acc;
        },
        {} as Record<string, ExpiryChartData>,
    );

    return Object.values(groupedData);
};

export const prepareFinancialData = (
    data: ReportDataItem[],
): FinancialChartData[] => {
    const groupedData = data.reduce(
        (acc, item) => {
            const date = new Date(item.date).toLocaleDateString();
            if (!acc[date]) {
                acc[date] = {
                    date,
                    revenue: 0,
                    profit: 0,
                };
            }
            acc[date].revenue += item.totalPrice;
            acc[date].profit += item.profit || 0;
            return acc;
        },
        {} as Record<string, FinancialChartData>,
    );

    return Object.values(groupedData).sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );
};
