import { Drug, IDrug } from '../models/drug.model';
import { DrugBranch, IDrugBranch } from '../models/drug-branch.model';
import Branch from '../models/branch.model';
import PharmacyInfo from '../models/pharmacy-info.model';
import {
    ICreateDrugRequest,
    IDrugSearchParams,
    IUpdateDrugRequest,
    IPaginatedDrugsResponse,
} from '../types/drug.types';
import { UserRole } from '../types/user.types';
import { ITokenPayload } from '../types/auth.types';
import { getBranchScopingFilter } from '../utils/data-scoping';
import {
    NotFoundError,
    BadRequestError,
    ForbiddenError,
} from '../utils/errors';
import mongoose, { Types } from 'mongoose';

/**
 * Service for drug-related operations
 */
export class DrugService {
    /**
     * Create a new drug with many-to-many branch associations
     * @param drugData The drug data to create
     * @param userRole The role of the user creating the drug
     * @param userBranchId The branch ID of the user creating the drug
     * @param pharmacyId The pharmacy ID
     * @returns The created drug with branch associations
     */
    async createDrug(
        drugData: ICreateDrugRequest & { selectedBranches?: string[] },
        userRole: UserRole,
        userBranchId?: string,
        pharmacyId?: string,
    ): Promise<any> {
        // Only admin or super admin can create drugs
        if (userRole !== UserRole.ADMIN && userRole !== UserRole.SUPER_ADMIN) {
            throw new ForbiddenError('Only admin can create drugs');
        }

        // Require pharmacy ID for drug creation
        if (!pharmacyId) {
            throw new BadRequestError(
                'Pharmacy ID is required for drug creation',
            );
        }

        // Validate costPrice
        if (typeof drugData.costPrice !== 'number' || drugData.costPrice <= 0) {
            throw new BadRequestError(
                'Cost price must be a number greater than 0',
            );
        }

        // Determine which branches to associate the drug with
        let branchesToAssociate: string[] = [];

        if (drugData.selectedBranches && drugData.selectedBranches.length > 0) {
            // Use explicitly selected branches
            branchesToAssociate = drugData.selectedBranches;
        } else if (drugData.branchId) {
            // Backward compatibility: use single branch
            branchesToAssociate = [drugData.branchId];
        } else {
            // Default: associate with all branches (admin privilege)
            const allBranches = await Branch.find().select('_id');
            branchesToAssociate = allBranches.map((b) =>
                (b._id as mongoose.Types.ObjectId).toString(),
            );
        }

        if (branchesToAssociate.length === 0) {
            throw new BadRequestError('At least one branch must be selected');
        }

        // Check if drug with same batch number already exists in any of the selected branches
        const existingDrugBranches = await DrugBranch.aggregate([
            {
                $lookup: {
                    from: 'drugs',
                    localField: 'drugId',
                    foreignField: '_id',
                    as: 'drug',
                },
            },
            {
                $unwind: '$drug',
            },
            {
                $match: {
                    'drug.batchNumber': drugData.batchNumber,
                    branchId: {
                        $in: branchesToAssociate.map(
                            (id) => new mongoose.Types.ObjectId(id),
                        ),
                    },
                },
            },
        ]);

        if (existingDrugBranches.length > 0) {
            throw new BadRequestError(
                `Drug with batch number ${drugData.batchNumber} already exists in one or more selected branches`,
            );
        }

        // Create the main drug record (without branch association)
        const drugCreateData = {
            name: drugData.name,
            brand: drugData.brand,
            category: drugData.category,
            dosageForm: drugData.dosageForm,
            ableToSell: drugData.ableToSell,
            drugsInCarton: drugData.drugsInCarton,
            unitsPerCarton: drugData.unitsPerCarton,
            packsPerCarton: drugData.packsPerCarton,
            quantity: drugData.quantity || 0, // This will be managed per branch
            pricePerUnit: drugData.pricePerUnit,
            pricePerPack: drugData.pricePerPack,
            pricePerCarton: drugData.pricePerCarton,
            expiryDate: drugData.expiryDate,
            batchNumber: drugData.batchNumber,
            requiresPrescription: drugData.requiresPrescription,
            supplier: drugData.supplier,
            location: drugData.location,
            costPrice: drugData.costPrice,
            pharmacyId: pharmacyId,
        };

        const drug = await Drug.create(drugCreateData);

        // Create drug-branch associations
        const drugBranchAssociations = branchesToAssociate.map((branchId) => ({
            drugId: drug._id,
            branchId: new mongoose.Types.ObjectId(branchId),
            pharmacyId: new mongoose.Types.ObjectId(pharmacyId),
            quantity: drugData.quantity || 0,
            location: drugData.location,
        }));

        await DrugBranch.insertMany(drugBranchAssociations);

        // Return the drug with branch information using the first branch for backward compatibility
        const createdDrug = await Drug.findById(drug._id);
        if (!createdDrug) {
            throw new BadRequestError('Failed to retrieve created drug');
        }

        // Get the first branch association for backward compatibility
        const firstBranchAssociation = await DrugBranch.findOne({
            drugId: drug._id,
        }).populate('branchId', 'name _id');

        // Set the branch field for backward compatibility
        if (firstBranchAssociation && firstBranchAssociation.branchId) {
            // Update the drug document to include the branch reference
            createdDrug.branch = (firstBranchAssociation.branchId as any)._id;

            // For response mapping, temporarily set the populated branch
            (createdDrug as any).branch = firstBranchAssociation.branchId;
        }

        return this.mapDrugToResponse(createdDrug);
    }

    /**
     * Get a drug by ID
     * @param id The drug ID
     * @param user The authenticated user (for data scoping)
     * @returns The drug
     */
    async getDrugById(id: string, user: ITokenPayload): Promise<any> {
        let query: any = { _id: id };

        // Apply data scoping based on user role and pharmacy/branch assignment
        const scopingFilter = getBranchScopingFilter(user);
        Object.assign(query, scopingFilter);

        const drug = await Drug.findOne(query);

        if (!drug) {
            throw new NotFoundError(`Drug with ID ${id} not found`);
        }

        // Get branch association from DrugBranch junction table
        const branchAssociation = await DrugBranch.findOne({
            drugId: id,
        }).populate('branchId', 'name _id');

        // Set branch data for backward compatibility
        if (branchAssociation && branchAssociation.branchId) {
            (drug as any).branch = branchAssociation.branchId;
        }

        return this.mapDrugToResponse(drug);
    }

    /**
     * Update a drug
     * @param id The drug ID
     * @param updateData The data to update
     * @param user The authenticated user (for data scoping)
     * @returns The updated drug
     */
    async updateDrug(
        id: string,
        updateData: IUpdateDrugRequest,
        user: ITokenPayload,
    ): Promise<any> {
        // Only admin or super admin can update drugs
        if (
            user.role !== UserRole.ADMIN &&
            user.role !== UserRole.SUPER_ADMIN
        ) {
            throw new ForbiddenError('Only admin can update drugs');
        }

        // Get the existing drug first to verify access (this now returns mapped response)
        const existingDrug = await this.getDrugById(id, user);

        // Convert the mapped response back to get the raw branch for batch number check
        const rawDrug = await Drug.findById(id);
        if (!rawDrug) {
            throw new NotFoundError(`Drug with ID ${id} not found`);
        }

        // If batch number is being updated, check for duplicates in the same branch
        if (
            updateData.batchNumber &&
            updateData.batchNumber !== rawDrug.batchNumber
        ) {
            const existingDrug = await Drug.findOne({
                batchNumber: updateData.batchNumber,
                branch: rawDrug.branch, // Check within the same branch
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
            (rawDrug as any).costPrice === undefined
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

        if (!updatedDrug) {
            throw new NotFoundError(
                `Drug with ID ${id} not found after update`,
            );
        }

        // Handle branch associations
        if (updateData.branchId) {
            // Remove existing associations for this drug
            await DrugBranch.deleteMany({ drugId: id });

            // Create new association
            await DrugBranch.create({
                drugId: id,
                branchId: updateData.branchId,
                pharmacyId: user.pharmacyId,
                quantity: updatedDrug.quantity || 0,
                location: updatedDrug.location,
            });

            // Set the branch field for backward compatibility
            updatedDrug.branch = updateData.branchId as any;
        } else {
            // If no branchId in update, try to get existing branch association
            const existingAssociation = await DrugBranch.findOne({
                drugId: id,
            }).populate('branchId', 'name _id');

            if (existingAssociation && existingAssociation.branchId) {
                updatedDrug.branch = existingAssociation.branchId as any;
            }
        }

        return this.mapDrugToResponse(updatedDrug);
    }

    /**
     * Delete a drug
     * @param id The drug ID
     * @param user The authenticated user (for data scoping)
     */
    async deleteDrug(id: string, user: ITokenPayload): Promise<void> {
        // Only admin can delete drugs
        if (user.role !== UserRole.ADMIN) {
            throw new ForbiddenError('Only admin can delete drugs');
        }

        // Verify drug exists and user has access
        await this.getDrugById(id, user);

        const result = await Drug.findByIdAndDelete(id);

        if (!result) {
            throw new NotFoundError(`Drug with ID ${id} not found`);
        }
    }

    /**
     * Get a paginated list of drugs with search and filtering
     * @param params Search parameters
     * @param user The authenticated user (for data scoping)
     * @returns Paginated drugs with metadata
     */
    async getDrugs(
        params: IDrugSearchParams,
        user: ITokenPayload,
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
            branchId,
        } = params;

        // Build query with proper data scoping
        const query: any = {};

        // Apply data scoping based on user role and pharmacy/branch assignment
        const scopingFilter = getBranchScopingFilter(user);
        Object.assign(query, scopingFilter);

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

        // Filter drugs by branch if branchId is specified
        let filteredDrugs;
        let totalCount;

        if (branchId) {
            // Get drugs that have associations with the specified branch
            const branchAssociations = await DrugBranch.find({
                branchId: branchId,
            }).select('drugId');

            const associatedDrugIds = branchAssociations.map(
                (assoc) => assoc.drugId,
            );

            // Add branch filter to the query
            query._id = { $in: associatedDrugIds };

            // Execute query with branch filtering and pagination
            filteredDrugs = await Drug.find(query)
                .sort(sort)
                .skip(skip)
                .limit(limit);

            // Get total count for branch-filtered drugs
            totalCount = await Drug.countDocuments(query);
        } else {
            // Execute query without branch filtering
            filteredDrugs = await Drug.find(query)
                .sort(sort)
                .skip(skip)
                .limit(limit);

            // Get total count for pagination metadata
            totalCount = await Drug.countDocuments(query);
        }

        // Get branch associations for filtered drugs
        const drugIds = filteredDrugs.map((drug) => drug._id as Types.ObjectId);
        const branchAssociations = await DrugBranch.find({
            drugId: { $in: drugIds },
        }).populate('branchId', 'name _id');

        // Create a map of drugId to branch data for quick lookup
        const branchMap = new Map();
        branchAssociations.forEach((association) => {
            if (association.branchId) {
                branchMap.set(
                    (association.drugId as Types.ObjectId).toString(),
                    association.branchId,
                );
            }
        });

        // Add branch data to drugs
        const drugsWithBranches = filteredDrugs.map((drug) => {
            const drugId = (drug._id as Types.ObjectId).toString();
            const branchData = branchMap.get(drugId);
            if (branchData) {
                (drug as any).branch = branchData;
            }
            return drug;
        });

        // Calculate total pages
        const totalPages = Math.ceil(totalCount / limit);

        return {
            drugs: drugsWithBranches.map((drug) =>
                this.mapDrugToResponse(drug),
            ),
            totalCount,
            page,
            limit,
            totalPages,
        };
    }

    /**
     * Get list of unique drug categories
     * @param user The authenticated user (for data scoping)
     * @returns Array of category names
     */
    async getCategories(user: ITokenPayload): Promise<string[]> {
        // Apply data scoping based on user role and pharmacy/branch assignment
        const scopingFilter = getBranchScopingFilter(user);

        const categories = await Drug.distinct('category', scopingFilter);
        return categories;
    }

    /**
     * Check if drugs are about to expire
     * @param days Number of days to check
     * @param user The authenticated user (for data scoping)
     * @returns List of drugs expiring in the specified days
     */
    async getExpiringDrugs(
        days: number,
        user: ITokenPayload,
    ): Promise<IDrug[]> {
        const today = new Date();
        const futureDate = new Date();
        futureDate.setDate(today.getDate() + days);

        // Build query with data scoping
        const query: any = {
            expiryDate: {
                $gte: today,
                $lte: futureDate,
            },
        };

        // Apply data scoping based on user role and pharmacy/branch assignment
        const scopingFilter = getBranchScopingFilter(user);
        Object.assign(query, scopingFilter);

        const expiringDrugs = await Drug.find(query).populate(
            'branch',
            'name _id',
        );
        return expiringDrugs.map((drug) => this.mapDrugToResponse(drug));
    }

    /**
     * Helper method to map Drug document to response object
     */
    /**
     * Map Drug document to response object with all relevant fields
     */
    private mapDrugToResponse(drug: IDrug): any {
        // Handle populated vs unpopulated branch
        const branchInfo = drug.branch as any; // Allow any type for populated fields
        let branchData = null;
        let branchId = null;

        if (branchInfo) {
            if (typeof branchInfo === 'object' && 'name' in branchInfo) {
                // Branch is populated
                branchData = {
                    id: branchInfo._id,
                    name: branchInfo.name,
                    _id: branchInfo._id,
                };
                branchId = branchInfo._id;
            } else {
                // Branch is just an ObjectId
                branchId = branchInfo;
            }
        }

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
            branch: branchData, // Populated branch object or null
            branchId: branchId, // Branch ObjectId for compatibility
            createdAt: drug.createdAt,
            updatedAt: drug.updatedAt,
        };
    }

    /**
     * Create a drug in all available branches
     * @param drugData The drug data to create
     * @param userRole The role of the user creating the drug
     * @returns Array of created drugs
     */
}
