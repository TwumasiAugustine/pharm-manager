import { Drug, IDrug } from '../models/drug.model';
import {
    ICreateDrugRequest,
    IDrugSearchParams,
    IUpdateDrugRequest,
    IPaginatedDrugsResponse,
} from '../types/drug.types';
import { UserRole } from '../types/auth.types';
import {
    NotFoundError,
    BadRequestError,
    ForbiddenError,
} from '../utils/errors';

/**
 * Service for drug-related operations
 */
export class DrugService {
    /**
     * Create a new drug
     * @param drugData The drug data to create
     * @param userRole The role of the user creating the drug
     * @param userBranchId The branch ID of the user creating the drug
     * @returns The created drug
     */
    async createDrug(
        drugData: ICreateDrugRequest,
        userRole: UserRole,
        userBranchId?: string,
    ): Promise<IDrug> {
        // Only super admin can create drugs
        if (userRole !== UserRole.SUPER_ADMIN) {
            throw new ForbiddenError('Only super admin can create drugs');
        }

        // Ensure branchId is provided for the drug
        if (!drugData.branchId) {
            throw new BadRequestError(
                'Branch ID is required for drug creation',
            );
        }

        // Check if drug with same batch number already exists in the same branch
        const existingDrug = await Drug.findOne({
            batchNumber: drugData.batchNumber,
            branch: drugData.branchId,
        });

        if (existingDrug) {
            throw new BadRequestError(
                `Drug with batch number ${drugData.batchNumber} already exists in this branch`,
            );
        }

        // Validate costPrice
        if (typeof drugData.costPrice !== 'number' || drugData.costPrice <= 0) {
            throw new BadRequestError(
                'Cost price must be a number greater than 0',
            );
        }

        // Create drug with branch assignment
        const drugCreateData = {
            ...drugData,
            branch: drugData.branchId,
        };

        // Create and return the new drug
        const drug = await Drug.create(drugCreateData);
        return drug;
    }

    /**
     * Get a drug by ID
     * @param id The drug ID
     * @param userRole The role of the user requesting the drug
     * @param userBranchId The branch ID of the user requesting the drug
     * @returns The drug
     */
    async getDrugById(
        id: string,
        userRole?: UserRole,
        userBranchId?: string,
    ): Promise<IDrug> {
        let query: any = { _id: id };

        // If not super admin, filter by branch
        if (userRole && userRole !== UserRole.SUPER_ADMIN && userBranchId) {
            query.branch = userBranchId;
        }

        const drug = await Drug.findOne(query);

        if (!drug) {
            throw new NotFoundError(`Drug with ID ${id} not found`);
        }

        return drug;
    }

    /**
     * Update a drug
     * @param id The drug ID
     * @param updateData The data to update
     * @param userRole The role of the user updating the drug
     * @param userBranchId The branch ID of the user updating the drug
     * @returns The updated drug
     */
    async updateDrug(
        id: string,
        updateData: IUpdateDrugRequest,
        userRole: UserRole,
        userBranchId?: string,
    ): Promise<IDrug> {
        // Only super admin can update drugs
        if (userRole !== UserRole.SUPER_ADMIN) {
            throw new ForbiddenError('Only super admin can update drugs');
        }

        // Get the existing drug first to verify access
        const drug = await this.getDrugById(id, userRole, userBranchId);

        // If batch number is being updated, check for duplicates in the same branch
        if (
            updateData.batchNumber &&
            updateData.batchNumber !== drug.batchNumber
        ) {
            const existingDrug = await Drug.findOne({
                batchNumber: updateData.batchNumber,
                branch: drug.branch, // Check within the same branch
            });

            if (existingDrug && existingDrug.id !== id) {
                throw new BadRequestError(
                    `Drug with batch number ${updateData.batchNumber} already exists in this branch`,
                );
            }
        }

        // Validate costPrice if present
        if (updateData.costPrice !== undefined && updateData.costPrice <= 0) {
            throw new BadRequestError('Cost price must be greater than 0');
        }

        // Backward compatibility: assign default costPrice if missing
        if (
            updateData.costPrice === undefined &&
            (drug as any).costPrice === undefined
        ) {
            updateData.costPrice = 0.01;
        }

        // If updating branchId, ensure it's valid
        const finalUpdateData: any = { ...updateData };
        if (updateData.branchId) {
            finalUpdateData.branch = updateData.branchId;
            delete finalUpdateData.branchId; // Remove branchId since we're using branch
        }

        // Update and return the drug
        const updatedDrug = await Drug.findByIdAndUpdate(id, finalUpdateData, {
            new: true,
            runValidators: true,
        });

        return updatedDrug!;
    }

    /**
     * Delete a drug
     * @param id The drug ID
     * @param userRole The role of the user deleting the drug
     * @param userBranchId The branch ID of the user deleting the drug
     */
    async deleteDrug(
        id: string,
        userRole: UserRole,
        userBranchId?: string,
    ): Promise<void> {
        // Only super admin can delete drugs
        if (userRole !== UserRole.SUPER_ADMIN) {
            throw new ForbiddenError('Only super admin can delete drugs');
        }

        // Verify drug exists and user has access
        await this.getDrugById(id, userRole, userBranchId);

        const result = await Drug.findByIdAndDelete(id);

        if (!result) {
            throw new NotFoundError(`Drug with ID ${id} not found`);
        }
    }

    /**
     * Get a paginated list of drugs with search and filtering
     * @param params Search parameters
     * @param userRole The role of the user requesting drugs
     * @param userBranchId The branch ID of the user requesting drugs
     * @returns Paginated drugs with metadata
     */
    async getDrugs(
        params: IDrugSearchParams,
        userRole?: UserRole,
        userBranchId?: string,
    ): Promise<IPaginatedDrugsResponse> {
        const {
            page = 1,
            limit = 10,
            search = '',
            category,
            requiresPrescription,
            sortBy = 'name',
            sortOrder = 'asc',
            expiryBefore,
            expiryAfter,
        } = params;

        // Build query
        const query: any = {};

        // Branch filtering - super admin sees all, others see only their branch
        if (userRole && userRole !== UserRole.SUPER_ADMIN && userBranchId) {
            query.branch = userBranchId;
        }

        // Text search
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { brand: { $regex: search, $options: 'i' } },
                { category: { $regex: search, $options: 'i' } },
                { batchNumber: { $regex: search, $options: 'i' } },
            ];
        }

        // Category filter
        if (category) {
            query.category = category;
        }

        // Prescription requirement filter
        if (requiresPrescription !== undefined) {
            query.requiresPrescription = requiresPrescription;
        }

        // Expiry date filters
        if (expiryBefore || expiryAfter) {
            query.expiryDate = {};

            if (expiryBefore) {
                query.expiryDate.$lte = new Date(expiryBefore);
            }

            if (expiryAfter) {
                query.expiryDate.$gte = new Date(expiryAfter);
            }
        }

        // Calculate pagination
        const skip = (page - 1) * limit;

        // Build sort options
        const sort: any = {};
        sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

        // Execute query with pagination
        const drugs = await Drug.find(query).sort(sort).skip(skip).limit(limit);

        // Get total count for pagination metadata
        const totalCount = await Drug.countDocuments(query);

        // Calculate total pages
        const totalPages = Math.ceil(totalCount / limit);

        return {
            drugs: drugs.map((drug) => this.mapDrugToResponse(drug)),
            totalCount,
            page,
            limit,
            totalPages,
        };
    }

    /**
     * Get list of unique drug categories
     * @param userRole The role of the user requesting categories
     * @param userBranchId The branch ID of the user requesting categories
     * @returns Array of category names
     */
    async getCategories(
        userRole?: UserRole,
        userBranchId?: string,
    ): Promise<string[]> {
        // Build filter for branch-based access
        const filter: any = {};
        if (userRole && userRole !== UserRole.SUPER_ADMIN && userBranchId) {
            filter.branch = userBranchId;
        }

        const categories = await Drug.distinct('category', filter);
        return categories;
    }

    /**
     * Check if drugs are about to expire
     * @param days Number of days to check
     * @param userRole The role of the user requesting expiring drugs
     * @param userBranchId The branch ID of the user requesting expiring drugs
     * @returns List of drugs expiring in the specified days
     */
    async getExpiringDrugs(
        days: number,
        userRole?: UserRole,
        userBranchId?: string,
    ): Promise<IDrug[]> {
        const today = new Date();
        const futureDate = new Date();
        futureDate.setDate(today.getDate() + days);

        // Build query with branch filtering
        const query: any = {
            expiryDate: {
                $gte: today,
                $lte: futureDate,
            },
        };

        // Add branch filter for non-super admin users
        if (userRole && userRole !== UserRole.SUPER_ADMIN && userBranchId) {
            query.branch = userBranchId;
        }

        const expiringDrugs = await Drug.find(query);
        return expiringDrugs;
    }

    /**
     * Helper method to map Drug document to response object
     */
    /**
     * Map Drug document to response object with all relevant fields
     */
    private mapDrugToResponse(drug: IDrug): any {
        return {
            id: drug._id,
            name: drug.name,
            brand: drug.brand,
            category: drug.category,
            dosageForm: drug.dosageForm,
            ableToSell: drug.ableToSell,
            drugsInCarton: drug.drugsInCarton,
            unitsPerCarton: drug.unitsPerCarton,
            packsPerCarton: drug.packsPerCarton,
            quantity: drug.quantity,
            pricePerUnit: drug.pricePerUnit,
            pricePerPack: drug.pricePerPack,
            pricePerCarton: drug.pricePerCarton,
            costPrice: drug.costPrice,
            expiryDate: drug.expiryDate,
            batchNumber: drug.batchNumber,
            requiresPrescription: drug.requiresPrescription,
            supplier: drug.supplier,
            location: drug.location,
            createdAt: drug.createdAt,
            updatedAt: drug.updatedAt,
        };
    }
}
