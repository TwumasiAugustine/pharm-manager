import { Drug, IDrug } from '../models/drug.model';
import {
    ICreateDrugRequest,
    IDrugSearchParams,
    IUpdateDrugRequest,
    IPaginatedDrugsResponse,
} from '../types/drug.types';
import { NotFoundError, BadRequestError } from '../utils/errors';

/**
 * Service for drug-related operations
 */
export class DrugService {
    /**
     * Create a new drug
     * @param drugData The drug data to create
     * @returns The created drug
     */
    async createDrug(drugData: ICreateDrugRequest): Promise<IDrug> {
        // Check if drug with same batch number already exists
        const existingDrug = await Drug.findOne({
            batchNumber: drugData.batchNumber,
        });

        if (existingDrug) {
            throw new BadRequestError(
                `Drug with batch number ${drugData.batchNumber} already exists`,
            );
        }

        // Create and return the new drug
        const drug = await Drug.create(drugData);
        return drug;
    }

    /**
     * Get a drug by ID
     * @param id The drug ID
     * @returns The drug
     */
    async getDrugById(id: string): Promise<IDrug> {
        const drug = await Drug.findById(id);

        if (!drug) {
            throw new NotFoundError(`Drug with ID ${id} not found`);
        }

        return drug;
    }

    /**
     * Update a drug
     * @param id The drug ID
     * @param updateData The data to update
     * @returns The updated drug
     */
    async updateDrug(
        id: string,
        updateData: IUpdateDrugRequest,
    ): Promise<IDrug> {
        // Check if drug exists
        const drug = await Drug.findById(id);

        if (!drug) {
            throw new NotFoundError(`Drug with ID ${id} not found`);
        }

        // If batch number is being updated, check for duplicates
        if (
            updateData.batchNumber &&
            updateData.batchNumber !== drug.batchNumber
        ) {
            const existingDrug = await Drug.findOne({
                batchNumber: updateData.batchNumber,
            });

            if (existingDrug && existingDrug.id !== id) {
                throw new BadRequestError(
                    `Drug with batch number ${updateData.batchNumber} already exists`,
                );
            }
        }

        // Update and return the drug
        const updatedDrug = await Drug.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true,
        });

        return updatedDrug!;
    }

    /**
     * Delete a drug
     * @param id The drug ID
     */
    async deleteDrug(id: string): Promise<void> {
        const result = await Drug.findByIdAndDelete(id);

        if (!result) {
            throw new NotFoundError(`Drug with ID ${id} not found`);
        }
    }

    /**
     * Get a paginated list of drugs with search and filtering
     * @param params Search parameters
     * @returns Paginated drugs with metadata
     */
    async getDrugs(
        params: IDrugSearchParams,
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
     * @returns Array of category names
     */
    async getCategories(): Promise<string[]> {
        const categories = await Drug.distinct('category');
        return categories;
    }

    /**
     * Check if drugs are about to expire
     * @param days Number of days to check
     * @returns List of drugs expiring in the specified days
     */
    async getExpiringDrugs(days: number): Promise<IDrug[]> {
        const today = new Date();
        const futureDate = new Date();
        futureDate.setDate(today.getDate() + days);

        const expiringDrugs = await Drug.find({
            expiryDate: {
                $gte: today,
                $lte: futureDate,
            },
        });

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
