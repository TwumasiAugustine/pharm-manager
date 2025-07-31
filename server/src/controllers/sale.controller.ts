import { Request, Response, NextFunction } from 'express';
import { SaleService } from '../services/sale.service';
import { successResponse } from '../utils/response';

const saleService = new SaleService();

export class SaleController {
    async createSale(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.id;
            const sale = await saleService.createSale({ ...req.body, userId });
            res.status(201).json(successResponse(sale, 'Sale created', 201));
        } catch (err) {
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
        } catch (err) {
            next(err);
        }
    }

    async getSaleById(req: Request, res: Response, next: NextFunction) {
        try {
            const sale = await saleService.getSaleById(req.params.id);
            res.json(successResponse(sale));
        } catch (err) {
            next(err);
        }
    }
}
