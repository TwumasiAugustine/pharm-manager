import Drug from '../models/drug.model';
import { Sale } from '../models/sale.model';
import Customer from '../models/customer.model';
import type {
    ReportFilters,
    ReportResponse,
    ReportDataItem,
    ReportSummaryData,
} from '../types/report.types';
import puppeteer from 'puppeteer';
import { Parser } from 'json2csv';

export class ReportService {
    /**
     * Generate a comprehensive report based on filters
     */
    async generateReport(filters: ReportFilters): Promise<ReportResponse> {
        try {
            const { dateRange, reportType } = filters;
            let data: ReportDataItem[] = [];
            let summary: ReportSummaryData;

            switch (reportType) {
                case 'sales':
                    data = await this.generateSalesReport(dateRange);
                    break;
                case 'inventory':
                    data = await this.generateInventoryReport();
                    break;
                case 'expiry':
                    data = await this.generateExpiryReport();
                    break;
                case 'financial':
                    data = await this.generateFinancialReport(dateRange);
                    break;
                default:
                    data = await this.generateSalesReport(dateRange);
            }

            summary = await this.calculateReportSummary(data, reportType);

            return {
                data,
                summary,
                totalRecords: data.length,
                currentPage: 1,
                totalPages: Math.ceil(data.length / 50), // Assuming 50 items per page
            };
        } catch (error) {
            throw new Error(`Failed to generate report: ${error}`);
        }
    }

    /**
     * Generate sales report
     */
    private async generateSalesReport(dateRange: {
        start: string;
        end: string;
    }): Promise<ReportDataItem[]> {
        const query: any = {};

        if (dateRange.start && dateRange.end) {
            query.createdAt = {
                $gte: new Date(dateRange.start),
                $lte: new Date(dateRange.end),
            };
        }

        const sales = await Sale.find(query)
            .populate('customer', 'name')
            .populate('items.drug', 'name category brand')
            .sort({ createdAt: -1 });

        const reportData: ReportDataItem[] = [];

        sales.forEach((sale) => {
            sale.items.forEach((drugItem) => {
                const drug = drugItem.drug as any;
                const customer = sale.customer as any;

                reportData.push({
                    id: `${sale._id}-${drug._id}`,
                    date: sale.createdAt.toISOString(),
                    drugName: drug.name,
                    category: drug.category,
                    quantity: drugItem.quantity,
                    unitPrice: drugItem.priceAtSale,
                    totalPrice: drugItem.quantity * drugItem.priceAtSale,
                    profit:
                        (drugItem.priceAtSale - drug.price * 0.7) *
                        drugItem.quantity, // Assuming 30% markup
                    customer: customer?.name || 'Walk-in',
                });
            });
        });

        return reportData;
    }

    /**
     * Generate inventory report
     */
    private async generateInventoryReport(): Promise<ReportDataItem[]> {
        const drugs = await Drug.find({ isActive: true });

        return drugs.map((drug: any) => ({
            id: drug._id.toString(),
            date: drug.createdAt.toISOString(),
            drugName: drug.name,
            category: drug.category,
            quantity: drug.quantity,
            unitPrice: drug.price,
            totalPrice: drug.quantity * drug.price,
            profit: 0, // Cannot calculate profit without cost price in schema
            batchNumber: drug.batchNumber,
            expiryDate: drug.expiryDate.toISOString(),
        }));
    }

    /**
     * Generate expiry report
     */
    private async generateExpiryReport(): Promise<ReportDataItem[]> {
        const now = new Date();
        const threeMonthsFromNow = new Date(
            now.getTime() + 90 * 24 * 60 * 60 * 1000,
        );

        const drugs = await Drug.find({
            isActive: true,
            expiryDate: { $lte: threeMonthsFromNow },
        });

        return drugs.map((drug: any) => ({
            id: drug._id.toString(),
            date: drug.createdAt.toISOString(),
            drugName: drug.name,
            category: drug.category,
            quantity: drug.quantity,
            unitPrice: drug.price,
            totalPrice: drug.quantity * drug.price,
            profit: 0,
            batchNumber: drug.batchNumber,
            expiryDate: drug.expiryDate?.toISOString(),
        }));
    }

    /**
     * Generate financial report
     */
    private async generateFinancialReport(dateRange: {
        start: string;
        end: string;
    }): Promise<ReportDataItem[]> {
        return this.generateSalesReport(dateRange);
    }

    /**
     * Calculate report summary
     */
    private async calculateReportSummary(
        data: ReportDataItem[],
        reportType: string,
    ): Promise<ReportSummaryData> {
        const totalRevenue = data.reduce(
            (sum, item) => sum + item.totalPrice,
            0,
        );
        const totalProfit = data.reduce((sum, item) => sum + item.profit, 0);
        const totalSales = data.length;
        const totalItems = data.reduce((sum, item) => sum + item.quantity, 0);
        const profitMargin =
            totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

        // Find top selling drug
        const drugSales = data.reduce(
            (acc, item) => {
                if (!acc[item.drugName]) {
                    acc[item.drugName] = 0;
                }
                acc[item.drugName] += item.quantity;
                return acc;
            },
            {} as Record<string, number>,
        );

        const topSellingDrug =
            Object.entries(drugSales).sort(
                ([, a], [, b]) => (b as number) - (a as number),
            )[0]?.[0] || 'N/A';

        const averageOrderValue =
            totalSales > 0 ? totalRevenue / totalSales : 0;

        return {
            totalRevenue,
            totalSales,
            totalItems,
            profitMargin,
            topSellingDrug,
            averageOrderValue,
            period: {
                start: data[0]?.date || '',
                end: data[data.length - 1]?.date || '',
            },
        };
    }

    /**
     * Export report as PDF
     */
    async exportReportPDF(filters: ReportFilters): Promise<Buffer> {
        try {
            const reportData = await this.generateReport(filters);

            const browser = await puppeteer.launch();
            const page = await browser.newPage();

            const html = this.generateReportHTML(reportData, filters);
            await page.setContent(html);

            const pdfBuffer = await page.pdf({
                format: 'A4',
                printBackground: true,
                margin: {
                    top: '20mm',
                    right: '20mm',
                    bottom: '20mm',
                    left: '20mm',
                },
            });

            await browser.close();
            return Buffer.from(pdfBuffer);
        } catch (error) {
            throw new Error(`Failed to export PDF: ${error}`);
        }
    }

    /**
     * Export report as CSV
     */
    async exportReportCSV(filters: ReportFilters): Promise<string> {
        try {
            const reportData = await this.generateReport(filters);

            const fields = [
                'date',
                'drugName',
                'category',
                'quantity',
                'unitPrice',
                'totalPrice',
                'profit',
                'customer',
            ];

            const parser = new Parser({ fields });
            return parser.parse(reportData.data);
        } catch (error) {
            throw new Error(`Failed to export CSV: ${error}`);
        }
    }

    /**
     * Get report summary only
     */
    async getReportSummary(filters: ReportFilters): Promise<ReportSummaryData> {
        const reportData = await this.generateReport(filters);
        return reportData.summary;
    }

    /**
     * Generate HTML for PDF export
     */
    private generateReportHTML(
        reportData: ReportResponse,
        filters: ReportFilters,
    ): string {
        const { data, summary } = reportData;

        return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <title>Pharmacy Report</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
                    .header { text-align: center; margin-bottom: 30px; }
                    .summary { margin-bottom: 30px; }
                    .summary-item { display: inline-block; margin: 10px; padding: 10px; border: 1px solid #ddd; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    th { background-color: #f2f2f2; }
                    .text-right { text-align: right; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>Pharmacy Management Report</h1>
                    <h2>${filters.reportType.charAt(0).toUpperCase() + filters.reportType.slice(1)} Report</h2>
                    <p>Generated on: ${new Date().toLocaleDateString()}</p>
                </div>

                <div class="summary">
                    <h3>Summary</h3>
                    <div class="summary-item">
                        <strong>Total Revenue:</strong><br>
                        GH₵${summary.totalRevenue.toLocaleString()}
                    </div>
                    <div class="summary-item">
                        <strong>Total Sales:</strong><br>
                        ${summary.totalSales}
                    </div>
                    <div class="summary-item">
                        <strong>Total Items:</strong><br>
                        ${summary.totalItems}
                    </div>
                    <div class="summary-item">
                        <strong>Profit Margin:</strong><br>
                        ${summary.profitMargin.toFixed(1)}%
                    </div>
                </div>

                <table>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Drug Name</th>
                            <th>Category</th>
                            <th>Quantity</th>
                            <th>Unit Price</th>
                            <th>Total Price</th>
                            <th>Profit</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data
                            .map(
                                (item: ReportDataItem) => `
                            <tr>
                                <td>${new Date(item.date).toLocaleDateString()}</td>
                                <td>${item.drugName}</td>
                                <td>${item.category}</td>
                                <td class="text-right">${item.quantity}</td>
                                <td class="text-right">GH₵${item.unitPrice.toFixed(2)}</td>
                                <td class="text-right">GH₵${item.totalPrice.toFixed(2)}</td>
                                <td class="text-right">GH₵${item.profit.toFixed(2)}</td>
                            </tr>
                        `,
                            )
                            .join('')}
                    </tbody>
                </table>
            </body>
            </html>
        `;
    }
}
