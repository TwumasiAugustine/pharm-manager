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

            // Provide intelligent defaults for better real-time reporting
            // Use local date strings to avoid timezone issues
            if (
                !filters.dateRange ||
                (!filters.dateRange.start && !filters.dateRange.end)
            ) {
                const now = new Date();
                const startOfMonth = new Date(
                    now.getFullYear(),
                    now.getMonth(),
                    1,
                );
                const endOfMonth = new Date(
                    now.getFullYear(),
                    now.getMonth() + 1,
                    0,
                );

                filters.dateRange = {
                    start: startOfMonth.toLocaleDateString('en-CA'), // YYYY-MM-DD format
                    end: endOfMonth.toLocaleDateString('en-CA'), // YYYY-MM-DD format
                };
            }

            const report = await this.reportService.generateReport(
                filters,
                req.user!,
            );

            res.status(200).json(
                successResponse(report, 'Report generated successfully', 200),
            );
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
            const pdfBuffer = await this.reportService.exportReportPDF(
                filters,
                req.user!,
            );

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
            const csvData = await this.reportService.exportReportCSV(
                filters,
                req.user!,
            );

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
                branchId,
            } = req.query as {
                startDate?: string;
                endDate?: string;
                reportType?: 'sales' | 'inventory' | 'expiry' | 'financial';
                branchId?: string;
            };

            // Provide better default date range - current month if not specified
            // Use local date strings to avoid timezone issues
            const now = new Date();
            const defaultStartDate =
                startDate ||
                new Date(
                    now.getFullYear(),
                    now.getMonth(),
                    1,
                ).toLocaleDateString('en-CA'); // YYYY-MM-DD format
            const defaultEndDate =
                endDate ||
                new Date(
                    now.getFullYear(),
                    now.getMonth() + 1,
                    0,
                ).toLocaleDateString('en-CA'); // YYYY-MM-DD format

            const summary = await this.reportService.getReportSummary(
                {
                    dateRange: {
                        start: defaultStartDate,
                        end: defaultEndDate,
                    },
                    reportType,
                    format: 'table',
                    branchId,
                },
                req.user!,
            );

            res.status(200).json(
                successResponse(
                    summary,
                    'Report summary retrieved successfully',
                    200,
                ),
            );
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get today's report data for real-time updates
     * @route GET /api/reports/today
     * @access Private
     */
    async getTodayReport(
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
        try {
            const { reportType = 'sales', branchId } = req.query as {
                reportType?: 'sales' | 'inventory' | 'expiry' | 'financial';
                branchId?: string;
            };

            // Get today's date in local format to avoid timezone issues
            const today = new Date();
            const todayDateString = today.toLocaleDateString('en-CA'); // YYYY-MM-DD format

            const report = await this.reportService.generateReport(
                {
                    dateRange: {
                        start: todayDateString,
                        end: todayDateString,
                    },
                    reportType,
                    format: 'table',
                    branchId,
                },
                req.user!,
            );

            res.status(200).json(
                successResponse(
                    report,
                    "Today's report retrieved successfully",
                    200,
                ),
            );
        } catch (error) {
            next(error);
        }
    }
}
