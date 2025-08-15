import { Request, Response, NextFunction } from 'express';
import { SaleService } from '../services/sale.service';
import { successResponse } from '../utils/response';
import { logAuditEvent } from '../middlewares/audit.middleware';

const saleService = new SaleService();

export class SaleController {
    async createSale(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.id;
            const sale: any = await saleService.createSale({
                ...req.body,
                userId,
            });

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

    async getSales(req: Request, res: Response, next: NextFunction) {
        try {
            const { page, limit, startDate, endDate } = req.query;
            const result = await saleService.getSales({
                page: page ? Number(page) : 1,
                limit: limit ? Number(limit) : 10,
                startDate: startDate as string,
                endDate: endDate as string,
            });
            res.json(successResponse(result));
        } catch (err: any) {
            next(err);
        }
    }

    async getSaleById(req: Request, res: Response, next: NextFunction) {
        try {
            const sale = await saleService.getSaleById(req.params.id);
            res.json(successResponse(sale));
        } catch (err: any) {
            next(err);
        }
    }
}
