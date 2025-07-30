import { Request, Response, NextFunction } from 'express';
import { DrugService } from '../services/drug.service';
import { successResponse } from '../utils/response';
import {
    ICreateDrugRequest,
    IDrugSearchParams,
    IUpdateDrugRequest,
} from '../types/drug.types';

const drugService = new DrugService();

/**
 * Controller for drug-related endpoints
 */
export class DrugController {
    /**
     * Create a new drug
     */
    async createDrug(
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
        try {
            const drugData: ICreateDrugRequest = req.body;
            const drug = await drugService.createDrug(drugData);

            res.status(201).json(
                successResponse(
                    { drug: drugService['mapDrugToResponse'](drug) },
                    'Drug created successfully',
                    201,
                ),
            );
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get a drug by ID
     */
    async getDrug(
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
        try {
            const { id } = req.params;
            const drug = await drugService.getDrugById(id);

            res.status(200).json(
                successResponse(
                    { drug: drugService['mapDrugToResponse'](drug) },
                    'Drug retrieved successfully',
                ),
            );
        } catch (error) {
            next(error);
        }
    }

    /**
     * Update a drug
     */
    async updateDrug(
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
        try {
            const { id } = req.params;
            const updateData: IUpdateDrugRequest = req.body;
            const drug = await drugService.updateDrug(id, updateData);

            res.status(200).json(
                successResponse(
                    { drug: drugService['mapDrugToResponse'](drug) },
                    'Drug updated successfully',
                ),
            );
        } catch (error) {
            next(error);
        }
    }

    /**
     * Delete a drug
     */
    async deleteDrug(
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
        try {
            const { id } = req.params;
            await drugService.deleteDrug(id);

            res.status(200).json(
                successResponse(null, 'Drug deleted successfully'),
            );
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get paginated list of drugs with search and filtering
     */
    async getDrugs(
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
        try {
            const params: IDrugSearchParams = {
                page: req.query.page ? Number(req.query.page) : undefined,
                limit: req.query.limit ? Number(req.query.limit) : undefined,
                search: req.query.search as string | undefined,
                category: req.query.category as string | undefined,
                requiresPrescription: req.query.requiresPrescription
                    ? req.query.requiresPrescription === 'true'
                    : undefined,
                sortBy: req.query.sortBy as string | undefined,
                sortOrder: (req.query.sortOrder as 'asc' | 'desc') || 'asc',
                expiryBefore: req.query.expiryBefore
                    ? (req.query.expiryBefore as string)
                    : undefined,
                expiryAfter: req.query.expiryAfter
                    ? (req.query.expiryAfter as string)
                    : undefined,
            };

            const result = await drugService.getDrugs(params);

            res.status(200).json(
                successResponse(result, 'Drugs retrieved successfully'),
            );
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get list of unique drug categories
     */
    async getCategories(
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
        try {
            const categories = await drugService.getCategories();

            res.status(200).json(
                successResponse(
                    { categories },
                    'Drug categories retrieved successfully',
                ),
            );
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get list of drugs expiring soon
     */
    async getExpiringDrugs(
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
        try {
            const days = req.query.days ? Number(req.query.days) : 30; // Default to 30 days
            const drugs = await drugService.getExpiringDrugs(days);

            res.status(200).json(
                successResponse(
                    {
                        drugs: drugs.map((drug) =>
                            drugService['mapDrugToResponse'](drug),
                        ),
                        count: drugs.length,
                        days,
                    },
                    'Expiring drugs retrieved successfully',
                ),
            );
        } catch (error) {
            next(error);
        }
    }
}
