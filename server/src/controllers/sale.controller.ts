import PharmacyInfo from '../models/pharmacy-info.model';
import { UnauthorizedError, BadRequestError } from '../utils/errors';
import { Sale } from '../models/sale.model';
import { Request, Response, NextFunction } from 'express';
import { SaleService } from '../services/sale.service';
import { successResponse } from '../utils/response';
import { logAuditEvent } from '../middlewares/audit.middleware';

const saleService = new SaleService();

export class SaleController {
    async createSale(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.id;
            const userBranchId = req.user!.branchId;

            // Check if short code feature is enabled
            const pharmacyInfo = await PharmacyInfo.findOne();
            let shortCode: string | undefined = undefined;
            if (pharmacyInfo?.requireSaleShortCode) {
                // Generate a 6-digit short code
                shortCode = Math.random()
                    .toString(36)
                    .substring(2, 8)
                    .toUpperCase();
            }
            const sale: any = await saleService.createSale(
                {
                    ...req.body,
                    userId,
                    shortCode,
                    finalized: !shortCode, // If no code, mark as finalized
                    branchId: req.body.branchId,
                },
                userBranchId, // Pass user's branch ID
            );

            // Log audit event for sale creation
            setImmediate(async () => {
                await logAuditEvent(
                    req.user!.id,
                    'CREATE',
                    'SALE',
                    `Created new sale with total amount: $${sale.totalAmount}`,
                    {
                        resourceId: sale._id.toString(),
                        userRole: req.user!.role,
                        ipAddress: req.ip || req.connection.remoteAddress,
                        userAgent: req.get('User-Agent'),
                        newValues: {
                            totalAmount: sale.totalAmount,
                            itemCount: sale.items.length,
                            paymentMethod: sale.paymentMethod,
                            customer: req.body.customerId ? 'Yes' : 'Walk-in',
                        },
                    },
                );
            });

            res.status(201).json(successResponse(sale, 'Sale created', 201));
        } catch (err: any) {
            next(err);
        }
    }

    // Get sale by short code (for cashier)
    async getSaleByShortCode(req: Request, res: Response, next: NextFunction) {
        try {
            const { code } = req.params;
            const sale = await Sale.findOne({ shortCode: code });
            if (!sale) throw new BadRequestError('Invalid or expired code');
            res.json(successResponse(sale));
        } catch (err: any) {
            next(err);
        }
    }

    // Cashier: Finalize/print sale using short code
    async finalizeSaleByShortCode(
        req: Request,
        res: Response,
        next: NextFunction,
    ) {
        try {
            if (!req.user) throw new UnauthorizedError('Not authenticated');

            // Super admin cannot finalize sales - they have all other permissions but not this
            if (req.user.role === 'super_admin') {
                throw new UnauthorizedError(
                    'Super admin cannot finalize sales',
                );
            }

            if (
                !req.user.permissions ||
                !req.user.permissions.includes('FINALIZE_SALE')
            ) {
                throw new UnauthorizedError('No permission to finalize sale');
            }
            const { code } = req.body;
            // Find sale by code
            const sale = await Sale.findOne({ shortCode: code });
            if (!sale) {
                throw new BadRequestError('Invalid or expired code');
            }
            // Check if code is expired (older than 10 minutes)
            const now = new Date();
            const createdAt =
                sale.createdAt instanceof Date
                    ? sale.createdAt
                    : new Date(sale.createdAt);
            const diffMs = now.getTime() - createdAt.getTime();
            const diffMinutes = diffMs / (1000 * 60);
            if (diffMinutes > 10) {
                throw new BadRequestError(
                    'Short code has expired. Please ask the pharmacist to generate a new one.',
                );
            }
            // If already finalized, allow printing (do not update again)
            if (sale.finalized) {
                return res.json(
                    successResponse(
                        sale,
                        'Sale already finalized and ready for printing',
                    ),
                );
            }
            // Otherwise, finalize the sale
            sale.finalized = true;
            await sale.save();
            res.json(
                successResponse(sale, 'Sale finalized and ready for printing'),
            );
        } catch (err: any) {
            // If unauthorized, send 401 for frontend to handle logout
            if (err instanceof UnauthorizedError) {
                return res
                    .status(401)
                    .json({ success: false, message: err.message });
            }
            next(err);
        }
    }
    // Get all sales with pagination and optional date range

    async getSales(req: Request, res: Response, next: NextFunction) {
        try {
            const { page, limit, startDate, endDate } = req.query;
            const result = await saleService.getSales(
                {
                    page: page ? Number(page) : 1,
                    limit: limit ? Number(limit) : 10,
                    startDate: startDate as string,
                    endDate: endDate as string,
                },
                req.user?.role,
                req.user?.branchId,
            );
            res.json(successResponse(result));
        } catch (err: any) {
            next(err);
        }
    }

    async getSaleById(req: Request, res: Response, next: NextFunction) {
        try {
            const sale = await saleService.getSaleById(
                req.params.id,
                req.user?.role,
                req.user?.branchId,
            );
            res.json(successResponse(sale));
        } catch (err: any) {
            next(err);
        }
    }
}
