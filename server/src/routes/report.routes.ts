import { Router } from 'express';
import { ReportController } from '../controllers/report.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();
const reportController = new ReportController();

// All report routes require authentication
router.use(authenticate);

/**
 * @route   POST /api/reports/generate
 * @desc    Generate a report based on filters
 * @access  Private
 * @body    ReportFilters
 */
router.post(
    '/generate',
    reportController.generateReport.bind(reportController),
);

/**
 * @route   POST /api/reports/export/pdf
 * @desc    Export report as PDF
 * @access  Private
 * @body    ReportFilters
 */
router.post(
    '/export/pdf',
    reportController.exportReportPDF.bind(reportController),
);

/**
 * @route   POST /api/reports/export/csv
 * @desc    Export report as CSV
 * @access  Private
 * @body    ReportFilters
 */
router.post(
    '/export/csv',
    reportController.exportReportCSV.bind(reportController),
);

/**
 * @route   GET /api/reports/summary
 * @desc    Get report summary data
 * @access  Private
 * @query   ?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD&reportType=sales|inventory|expiry|financial
 */
router.get(
    '/summary',
    reportController.getReportSummary.bind(reportController),
);

export default router;
