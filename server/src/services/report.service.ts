import Drug from '../models/drug.model';
import { Sale } from '../models/sale.model';
import Customer from '../models/customer.model';
import { getPharmacyInfo } from './pharmacy.service';
import type {
    ReportFilters,
    ReportResponse,
    ReportDataItem,
    ReportSummaryData,
} from '../types/report.types';
import puppeteer from 'puppeteer';

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

            // Get pharmacy information
            const pharmacyInfo = await getPharmacyInfo();

            return {
                data,
                summary,
                totalRecords: data.length,
                currentPage: 1,
                totalPages: Math.ceil(data.length / 50), // Assuming 50 items per page
                pharmacyInfo: pharmacyInfo
                    ? {
                          name: pharmacyInfo.name,
                          address: pharmacyInfo.address,
                          contact: {
                              phone: pharmacyInfo.contact.phone,
                              email: pharmacyInfo.contact.email,
                              website: pharmacyInfo.contact.website,
                          },
                          registrationNumber: pharmacyInfo.registrationNumber,
                          slogan: pharmacyInfo.slogan,
                      }
                    : undefined,
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
            const { data, summary, pharmacyInfo } = reportData;

            // Create header with pharmacy information
            let csvContent = '';

            if (pharmacyInfo) {
                csvContent += `"${pharmacyInfo.name}"\n`;
                csvContent += `"${pharmacyInfo.slogan}"\n`;
                csvContent += `"Address: ${pharmacyInfo.address.street}, ${pharmacyInfo.address.city}, ${pharmacyInfo.address.state} ${pharmacyInfo.address.postalCode}, ${pharmacyInfo.address.country}"\n`;
                csvContent += `"Phone: ${pharmacyInfo.contact.phone} | Email: ${pharmacyInfo.contact.email}"\n`;
                csvContent += `"Registration Number: ${pharmacyInfo.registrationNumber}"\n`;
                csvContent += '\n';
            }

            csvContent += `"${filters.reportType.charAt(0).toUpperCase() + filters.reportType.slice(1)} Report"\n`;
            csvContent += `"Generated on: ${new Date().toLocaleDateString(
                'en-US',
                {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                },
            )}"\n`;
            csvContent += '\n';

            // Add summary information
            csvContent += '"SUMMARY"\n';
            csvContent += `"Total Revenue","GH₵${summary.totalRevenue.toLocaleString()}"\n`;
            csvContent += `"Total Sales","${summary.totalSales}"\n`;
            csvContent += `"Total Items","${summary.totalItems}"\n`;
            csvContent += `"Profit Margin","${summary.profitMargin ? summary.profitMargin.toFixed(1) + '%' : 'N/A'}"\n`;
            csvContent += `"Top Selling Drug","${summary.topSellingDrug}"\n`;
            csvContent += `"Average Order Value","GH₵${summary.averageOrderValue.toFixed(2)}"\n`;
            csvContent += `"Report Period","${summary.period.start ? new Date(summary.period.start).toLocaleDateString() : 'N/A'} - ${summary.period.end ? new Date(summary.period.end).toLocaleDateString() : 'N/A'}"\n`;
            csvContent += '\n';

            // Add detailed data
            csvContent += '"DETAILED DATA"\n';
            csvContent +=
                '"Date","Drug Name","Category","Quantity","Unit Price (GH₵)","Total Price (GH₵)","Profit (GH₵)","Customer","Batch Number","Expiry Date"\n';

            data.forEach((item) => {
                csvContent += `"${new Date(item.date).toLocaleDateString()}",`;
                csvContent += `"${item.drugName}",`;
                csvContent += `"${item.category}",`;
                csvContent += `"${item.quantity}",`;
                csvContent += `"${item.unitPrice.toFixed(2)}",`;
                csvContent += `"${item.totalPrice.toFixed(2)}",`;
                csvContent += `"${item.profit ? item.profit.toFixed(2) : '0.00'}",`;
                csvContent += `"${item.customer || 'Walk-in'}",`;
                csvContent += `"${item.batchNumber || 'N/A'}",`;
                csvContent += `"${item.expiryDate ? new Date(item.expiryDate).toLocaleDateString() : 'N/A'}"\n`;
            });

            return csvContent;
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
        const { data, summary, pharmacyInfo } = reportData;

        return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <title>${pharmacyInfo?.name || 'Pharmacy'} - Report</title>
                <style>
                    body {
                        font-family: 'Arial', sans-serif;
                        margin: 0;
                        padding: 20px;
                        color: #333;
                        line-height: 1.6;
                    }
                    .header {
                        border-bottom: 3px solid #2563eb;
                        padding-bottom: 20px;
                        margin-bottom: 30px;
                        position: relative;
                    }
                    .pharmacy-logo {
                        text-align: center;
                        margin-bottom: 15px;
                    }
                    .pharmacy-name {
                        font-size: 28px;
                        font-weight: bold;
                        color: #1e40af;
                        margin: 0;
                        text-align: center;
                    }
                    .pharmacy-slogan {
                        font-style: italic;
                        color: #6b7280;
                        text-align: center;
                        margin: 5px 0 15px 0;
                        font-size: 14px;
                    }
                    .pharmacy-contact {
                        display: flex;
                        justify-content: space-between;
                        margin-top: 15px;
                        font-size: 12px;
                        color: #4b5563;
                    }
                    .contact-left, .contact-right {
                        flex: 1;
                    }
                    .contact-right {
                        text-align: right;
                    }
                    .report-title {
                        text-align: center;
                        margin: 20px 0;
                        padding: 15px;
                        background: linear-gradient(135deg, #3b82f6, #1d4ed8);
                        color: white;
                        border-radius: 8px;
                        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                    }
                    .report-title h1 {
                        margin: 0;
                        font-size: 24px;
                        font-weight: 600;
                    }
                    .report-subtitle {
                        margin: 5px 0 0 0;
                        font-size: 14px;
                        opacity: 0.9;
                    }
                    .summary {
                        background: #f8fafc;
                        border: 1px solid #e2e8f0;
                        border-radius: 8px;
                        padding: 20px;
                        margin-bottom: 30px;
                        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
                    }
                    .summary h3 {
                        margin: 0 0 20px 0;
                        color: #1e40af;
                        font-size: 18px;
                        border-bottom: 2px solid #3b82f6;
                        padding-bottom: 8px;
                        display: inline-block;
                    }
                    .summary-grid {
                        display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                        gap: 15px;
                    }
                    .summary-item {
                        background: white;
                        padding: 15px;
                        border-radius: 6px;
                        border-left: 4px solid #3b82f6;
                        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                    }
                    .summary-label {
                        font-size: 12px;
                        color: #6b7280;
                        text-transform: uppercase;
                        font-weight: 600;
                        margin-bottom: 5px;
                    }
                    .summary-value {
                        font-size: 20px;
                        font-weight: bold;
                        color: #1f2937;
                    }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-top: 20px;
                        background: white;
                        border-radius: 8px;
                        overflow: hidden;
                        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                    }
                    th {
                        background: linear-gradient(135deg, #1e40af, #3b82f6);
                        color: white;
                        font-weight: 600;
                        padding: 12px 8px;
                        text-align: left;
                        font-size: 14px;
                    }
                    td {
                        padding: 10px 8px;
                        border-bottom: 1px solid #f1f5f9;
                        font-size: 13px;
                    }
                    tbody tr:hover {
                        background-color: #f8fafc;
                    }
                    tbody tr:nth-child(even) {
                        background-color: #f9fafb;
                    }
                    .text-right { text-align: right; }
                    .text-center { text-align: center; }
                    .currency {
                        font-weight: 600;
                        color: #059669;
                    }
                    .footer {
                        margin-top: 40px;
                        padding-top: 20px;
                        border-top: 2px solid #e5e7eb;
                        text-align: center;
                        font-size: 12px;
                        color: #6b7280;
                    }
                    @media print {
                        body { margin: 0; }
                        .header { page-break-inside: avoid; }
                        .summary { page-break-inside: avoid; }
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    ${
                        pharmacyInfo
                            ? `
                        <div class="pharmacy-logo">
                            <h1 class="pharmacy-name">${pharmacyInfo.name}</h1>
                            <p class="pharmacy-slogan">${pharmacyInfo.slogan}</p>
                        </div>
                        <div class="pharmacy-contact">
                            <div class="contact-left">
                                <div><strong>Address:</strong></div>
                                <div>${pharmacyInfo.address.street}</div>
                                <div>${pharmacyInfo.address.city}, ${pharmacyInfo.address.state} ${pharmacyInfo.address.postalCode}</div>
                                <div>${pharmacyInfo.address.country}</div>
                            </div>
                            <div class="contact-right">
                                <div><strong>Contact Information:</strong></div>
                                <div>Phone: ${pharmacyInfo.contact.phone}</div>
                                <div>Email: ${pharmacyInfo.contact.email}</div>
                                ${pharmacyInfo.contact.website ? `<div>Website: ${pharmacyInfo.contact.website}</div>` : ''}
                                <div>Reg. No: ${pharmacyInfo.registrationNumber}</div>
                            </div>
                        </div>
                    `
                            : ''
                    }

                    <div class="report-title">
                        <h1>${filters.reportType.charAt(0).toUpperCase() + filters.reportType.slice(1)} Report</h1>
                        <p class="report-subtitle">Generated on: ${new Date().toLocaleDateString(
                            'en-US',
                            {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                            },
                        )}</p>
                    </div>
                </div>

                <div class="summary">
                    <h3>Report Summary</h3>
                    <div class="summary-grid">
                        <div class="summary-item">
                            <div class="summary-label">Total Revenue</div>
                            <div class="summary-value currency">GH₵${summary.totalRevenue.toLocaleString()}</div>
                        </div>
                        <div class="summary-item">
                            <div class="summary-label">Total Sales</div>
                            <div class="summary-value">${summary.totalSales}</div>
                        </div>
                        <div class="summary-item">
                            <div class="summary-label">Total Items</div>
                            <div class="summary-value">${summary.totalItems}</div>
                        </div>
                        <div class="summary-item">
                            <div class="summary-label">Profit Margin</div>
                            <div class="summary-value">${summary.profitMargin ? summary.profitMargin.toFixed(1) + '%' : 'N/A'}</div>
                        </div>
                        <div class="summary-item">
                            <div class="summary-label">Top Selling Drug</div>
                            <div class="summary-value">${summary.topSellingDrug}</div>
                        </div>
                        <div class="summary-item">
                            <div class="summary-label">Average Order Value</div>
                            <div class="summary-value currency">GH₵${summary.averageOrderValue.toFixed(2)}</div>
                        </div>
                    </div>
                </div>

                <table>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Drug Name</th>
                            <th>Category</th>
                            <th class="text-center">Quantity</th>
                            <th class="text-right">Unit Price</th>
                            <th class="text-right">Total Price</th>
                            <th class="text-right">Profit</th>
                            <th>Customer</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data
                            .map(
                                (item: ReportDataItem) => `
                            <tr>
                                <td>${new Date(item.date).toLocaleDateString()}</td>
                                <td><strong>${item.drugName}</strong></td>
                                <td>${item.category}</td>
                                <td class="text-center">${item.quantity}</td>
                                <td class="text-right currency">GH₵${item.unitPrice.toFixed(2)}</td>
                                <td class="text-right currency">GH₵${item.totalPrice.toFixed(2)}</td>
                                <td class="text-right currency">GH₵${item.profit ? item.profit.toFixed(2) : '0.00'}</td>
                                <td>${item.customer || 'Walk-in'}</td>
                            </tr>
                        `,
                            )
                            .join('')}
                    </tbody>
                </table>

                <div class="footer">
                    <p>This report was generated automatically by ${pharmacyInfo?.name || 'Pharmacy Management System'}</p>
                    <p>Report Period: ${summary.period.start ? new Date(summary.period.start).toLocaleDateString() : 'N/A'} - ${summary.period.end ? new Date(summary.period.end).toLocaleDateString() : 'N/A'}</p>
                </div>
            </body>
            </html>
        `;
    }
}
