import { Request, Response, NextFunction } from 'express';
import { ReportService } from '../services/report.service';
import { successResponse } from '../utils/response';
import type { ReportFilters } from '../types/report.types';

export class ReportController {
    private reportService: ReportService;

    constructor() {
        this.reportService = new ReportService();
    }

    /**
     * Generate a report based on filters
     * @route POST /api/reports/generate
     * @access Private
     */
    async generateReport(
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
        try {
            const filters: ReportFilters = req.body;
            const report = await this.reportService.generateReport(filters);

            successResponse(res, 'Report generated successfully', report);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Export report as PDF
     * @route POST /api/reports/export/pdf
     * @access Private
     */
    async exportReportPDF(
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
        try {
            const filters: ReportFilters = req.body;
            const pdfBuffer = await this.reportService.exportReportPDF(filters);

            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader(
                'Content-Disposition',
                `attachment; filename=report-${Date.now()}.pdf`,
            );
            res.send(pdfBuffer);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Export report as CSV
     * @route POST /api/reports/export/csv
     * @access Private
     */
    async exportReportCSV(
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
        try {
            const filters: ReportFilters = req.body;
            const csvData = await this.reportService.exportReportCSV(filters);

            res.setHeader('Content-Type', 'text/csv');
            res.setHeader(
                'Content-Disposition',
                `attachment; filename=report-${Date.now()}.csv`,
            );
            res.send(csvData);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get report summary data
     * @route GET /api/reports/summary
     * @access Private
     */
    async getReportSummary(
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
        try {
            const {
                startDate,
                endDate,
                reportType = 'sales',
            } = req.query as {
                startDate?: string;
                endDate?: string;
                reportType?: 'sales' | 'inventory' | 'expiry' | 'financial';
            };

            const summary = await this.reportService.getReportSummary({
                dateRange: { start: startDate || '', end: endDate || '' },
                reportType,
                format: 'table',
            });

            successResponse(
                res,
                'Report summary retrieved successfully',
                summary,
            );
        } catch (error) {
            next(error);
        }
    }
}
