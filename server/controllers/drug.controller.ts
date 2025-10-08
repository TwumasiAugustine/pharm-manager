import { Request, Response, NextFunction } from 'express';
import { DrugService } from '../services/drug.service';
import { successResponse } from '../utils/response';
import {
    ICreateDrugRequest,
    IDrugSearchParams,
    IUpdateDrugRequest,
} from '../types/drug.types';
import { logAuditEvent } from '../middlewares/audit.middleware';
import { trackActivity } from '../utils/activity-tracker';

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
            const user = req.user!;

            const drug: any = await drugService.createDrug(
                drugData,
                user.role,
                user.branchId,
                user.pharmacyId,
            );

            // Log audit event for drug creation
            setImmediate(async () => {
                // Track drug creation activity
                await trackActivity(req.user!.id, 'CREATE', 'DRUG', {
                    action: 'Create Drug',
                    resourceId: drug._id?.toString(),
                    resourceName: `${drug.name} (${drug.brand})`,
                    category: drug.category,
                    quantity: drug.quantity,
                    price: drug.price,
                });

                await logAuditEvent(
                    req.user!.id,
                    'CREATE',
                    'DRUG',
                    `Created new drug: ${drug.name} (${drug.brand})`,
                    {
                        resourceId: drug._id?.toString() || 'unknown',
                        userRole: req.user!.role,
                        ipAddress: req.ip || req.connection.remoteAddress,
                        userAgent: req.get('User-Agent'),
                        newValues: drugData,
                    },
                );
            });

            res.status(201).json(
                successResponse(
                    { drug: drug },
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
            const user = req.user!;

            const drug = await drugService.getDrugById(id, user);

            // Track drug view activity
            setImmediate(async () => {
                await trackActivity(req.user!.id, 'VIEW', 'DRUG', {
                    action: 'View Drug',
                    resourceId: drug._id?.toString(),
                    resourceName: `${drug.name} (${drug.brand})`,
                });
            });

            res.status(200).json(
                successResponse({ drug: drug }, 'Drug retrieved successfully'),
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
            const user = req.user!;

            // Get original drug data for audit log
            const originalDrug: any = await drugService.getDrugById(id, user);
            const drug: any = await drugService.updateDrug(
                id,
                updateData,
                user,
            );

            // Log audit event for drug update
            setImmediate(async () => {
                // Track drug update activity
                await trackActivity(req.user!.id, 'UPDATE', 'DRUG', {
                    action: 'Update Drug',
                    resourceId: drug._id?.toString(),
                    resourceName: `${drug.name} (${drug.brand})`,
                    updatedFields: Object.keys(updateData),
                    newQuantity: drug.quantity,
                    newPrice: drug.sellingPrice,
                });

                await logAuditEvent(
                    req.user!.id,
                    'UPDATE',
                    'DRUG',
                    `Updated drug: ${drug.name} (${drug.brand})`,
                    {
                        resourceId: drug._id?.toString() || id,
                        userRole: req.user!.role,
                        ipAddress: req.ip || req.connection.remoteAddress,
                        userAgent: req.get('User-Agent'),
                        oldValues: {
                            name: originalDrug.name,
                            brand: originalDrug.brand,
                            quantity: originalDrug.quantity,
                            costPrice: originalDrug.costPrice,
                            expiryDate: originalDrug.expiryDate,
                        },
                        newValues: updateData,
                    },
                );
            });

            res.status(200).json(
                successResponse({ drug: drug }, 'Drug updated successfully'),
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
            const user = req.user!;

            // Get drug data before deletion for audit log
            const drugToDelete: any = await drugService.getDrugById(id, user);
            await drugService.deleteDrug(id, user);

            // Log audit event for drug deletion
            setImmediate(async () => {
                await logAuditEvent(
                    req.user!.id,
                    'DELETE',
                    'DRUG',
                    `Deleted drug: ${drugToDelete.name} (${drugToDelete.brand})`,
                    {
                        resourceId: drugToDelete._id?.toString() || id,
                        userRole: req.user!.role,
                        ipAddress: req.ip || req.connection.remoteAddress,
                        userAgent: req.get('User-Agent'),
                        oldValues: {
                            name: drugToDelete.name,
                            brand: drugToDelete.brand,
                            quantity: drugToDelete.quantity,
                            costPrice: drugToDelete.costPrice,
                            expiryDate: drugToDelete.expiryDate,
                        },
                    },
                );
            });

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

            const user = req.user!;
            const result = await drugService.getDrugs(params, user);

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
            const user = req.user!;
            const categories = await drugService.getCategories(user);

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
            const user = req.user!;
            const drugs = await drugService.getExpiringDrugs(days, user);

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
