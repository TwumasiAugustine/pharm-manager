/**
 * Assignment Service for automatic pharmacy and branch assignments
 * Provides helper functions to automatically assign pharmacy and branch IDs
 * during user and entity creation to reduce manual setup requirements.
 */

import mongoose, { Types } from 'mongoose';
import PharmacyInfo from '../models/pharmacy-info.model';
import Branch from '../models/branch.model';
import { BadRequestError } from '../utils/errors';
import { UserRole } from '../types/user.types';

export class AssignmentService {
    /**
     * Get the default pharmacy ID (first/only pharmacy in the system)
     * @returns The pharmacy ID or throws error if no pharmacy exists
     */
    static async getDefaultPharmacyId(): Promise<string> {
        const pharmacy = await PharmacyInfo.findOne().sort({ createdAt: 1 });
        if (!pharmacy) {
            throw new BadRequestError(
                'No pharmacy setup found. Please configure pharmacy first.',
            );
        }
        return (pharmacy._id as Types.ObjectId).toString();
    }

    /**
     * Get the default branch ID (first branch or create a default one)
     * @returns The branch ID or throws error if no branches exist and can't create default
     */
    static async getDefaultBranchId(): Promise<string> {
        // Try to find existing branch
        let defaultBranch = await Branch.findOne().sort({ createdAt: 1 });

        if (!defaultBranch) {
            // No branches exist, create a default one
            try {
                const pharmacyId = await this.getDefaultPharmacyId();
                const pharmacy = await PharmacyInfo.findById(pharmacyId);

                if (!pharmacy) {
                    throw new BadRequestError(
                        'Pharmacy not found for default branch creation',
                    );
                }

                defaultBranch = await Branch.create({
                    name: 'Main Branch',
                    pharmacyId: pharmacyId,
                    address: {
                        street: pharmacy.address?.street || '123 Main Street',
                        city: pharmacy.address?.city || 'Default City',
                        state: pharmacy.address?.state || 'Default State',
                        postalCode: pharmacy.address?.postalCode || '12345',
                        country: pharmacy.address?.country || 'Ghana',
                    },
                    contact: {
                        phone: pharmacy.contact?.phone || '+233 XX XXX XXXX',
                        email: pharmacy.contact?.email || 'branch@pharmacy.com',
                    },
                });

                console.log(
                    `✅ Created default branch: ${defaultBranch.name} (ID: ${defaultBranch._id})`,
                );
            } catch (error) {
                throw new BadRequestError(
                    'No branches available and unable to create default branch. Please create a branch first.',
                );
            }
        }

        return (defaultBranch._id as Types.ObjectId).toString();
    }

    /**
     * Auto-assign pharmacy and branch to user data if not provided
     * @param userData User data that may need pharmacy/branch assignment
     * @param requireBranch Whether to require branch assignment (default: false)
     * @returns Updated user data with assignments
     */
    static async autoAssignUserIds(
        userData: any,
        requireBranch: boolean = false,
    ): Promise<any> {
        const updatedData = { ...userData };

        // Auto-assign pharmacy ID if not provided
        if (!updatedData.pharmacyId) {
            try {
                updatedData.pharmacyId = await this.getDefaultPharmacyId();
                console.log(
                    `🏥 Auto-assigned pharmacy ID: ${updatedData.pharmacyId}`,
                );
            } catch (error) {
                // Don't fail if pharmacy assignment fails for super admin
                if (updatedData.role !== UserRole.SUPER_ADMIN) {
                    throw error;
                }
            }
        }

        // Auto-assign branch ID if required and not provided
        if (requireBranch && !updatedData.branchId) {
            try {
                updatedData.branchId = await this.getDefaultBranchId();
                console.log(
                    `🏢 Auto-assigned branch ID: ${updatedData.branchId}`,
                );
            } catch (error) {
                // Don't fail if branch assignment fails for admin
                if (
                    updatedData.role !== UserRole.ADMIN
                ) {
                    throw error;
                }
            }
        }

        return updatedData;
    }

    /**
     * Get pharmacy and branch information for display
     * @returns Object with pharmacy and branch details
     */
    static async getAssignmentInfo(): Promise<{
        pharmacy: any;
        branches: any[];
        defaultBranch: any;
    }> {
        const pharmacy = await PharmacyInfo.findOne();
        const branches = await Branch.find().sort({ createdAt: 1 });
        const defaultBranch = branches.length > 0 ? branches[0] : null;

        return {
            pharmacy,
            branches,
            defaultBranch,
        };
    }

    /**
     * Validate that pharmacy and branch IDs exist and are related
     * @param pharmacyId The pharmacy ID to validate
     * @param branchId The branch ID to validate (optional)
     * @returns True if valid, throws error if not
     */
    static async validateAssignments(
        pharmacyId?: string,
        branchId?: string,
    ): Promise<boolean> {
        if (pharmacyId) {
            const pharmacy = await PharmacyInfo.findById(pharmacyId);
            if (!pharmacy) {
                throw new BadRequestError(
                    `Pharmacy with ID ${pharmacyId} not found`,
                );
            }
        }

        if (branchId) {
            const branch = await Branch.findById(branchId);
            if (!branch) {
                throw new BadRequestError(
                    `Branch with ID ${branchId} not found`,
                );
            }

            // If both IDs provided, ensure branch belongs to pharmacy
            if (pharmacyId && branch.pharmacyId.toString() !== pharmacyId) {
                throw new BadRequestError(
                    'Branch does not belong to the specified pharmacy',
                );
            }
        }

        return true;
    }
}
