import { Request, Response, NextFunction } from 'express';
import { SaleService } from '../services/sale.service';
import { successResponse } from '../utils/response';
import { CreateSaleRequest, SaleSearchParams } from '../types/sale.types';

const saleService = new SaleService();

export class SaleController {
    async createSale(
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
        try {
            const saleData: CreateSaleRequest = req.body;
            const userId = req.user!.id; // Authenticated user
            const newSale = await saleService.createSale(saleData, userId);
            res.status(201).json(
                successResponse(newSale, 'Sale created successfully', 201),
            );
        } catch (error) {
            next(error);
        }
    }

    async getSales(
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
        try {
            console.log('GET /sales - Request Query:', req.query);

            // Parse parameters and convert types as needed
            const params: SaleSearchParams = {
                ...req.query,
                // Convert string values to appropriate types
                page: req.query.page
                    ? parseInt(req.query.page as string, 10)
                    : 1,
                limit: req.query.limit
                    ? parseInt(req.query.limit as string, 10)
                    : 10,
                groupByDate:
                    req.query.groupByDate === 'true',
            };

            console.log('Processed sales query params:', params);

            const result = await saleService.getSales(params);
            console.log(
                `Returning ${result.data.length} sales with pagination:`,
                result.pagination,
            );

            res.status(200).json(successResponse(result));
        } catch (error) {
            console.error('Error in getSales controller:', error);
            next(error);
        }
    }

    async getSaleById(
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
        try {
            const { id } = req.params;
            const sale = await saleService.getSaleById(id);
            res.status(200).json(successResponse(sale));
        } catch (error) {
            next(error);
        }
    }
}
