import PharmacyInfo from '../models/pharmacy-info.model';
import User from '../models/user.model';
import Branch from '../models/branch.model';
import { UserRole } from '../types/user.types';
import {
    ICreatePharmacyRequest,
    IPharmacyFilters,
    IPharmacyStats,
    IAssignAdminRequest,
} from '../types/pharmacy.types';
import {
    NotFoundError,
    ConflictError,
    BadRequestError,
    UnauthorizedError,
} from '../utils/errors';
import mongoose from 'mongoose';

export class PharmacyManagementService {
    /**
     * Validate Super Admin access
     */
    private async validateSuperAdminAccess(userId: string) {
        const user = await User.findById(userId);
        if (!user || user.role !== UserRole.SUPER_ADMIN) {
            throw new UnauthorizedError(
                'Only Super Admin can perform this action',
            );
        }
        return user;
    }

    /**
     * Super Admin: Create a new pharmacy
     */
    async createPharmacy(
        pharmacyData: ICreatePharmacyRequest,
        createdBy: string,
    ) {
        // Validate Super Admin access
        await this.validateSuperAdminAccess(createdBy);
        // Check if pharmacy name already exists
        const existingPharmacy = await PharmacyInfo.findOne({
            name: { $regex: new RegExp(`^${pharmacyData.name}$`, 'i') },
        });

        if (existingPharmacy) {
            throw new ConflictError('Pharmacy with this name already exists');
        }

        // Check if registration number already exists
        const existingRegNumber = await PharmacyInfo.findOne({
            registrationNumber: pharmacyData.registrationNumber,
        });

        if (existingRegNumber) {
            throw new ConflictError(
                'Pharmacy with this registration number already exists',
            );
        }

        const pharmacy = new PharmacyInfo({
            ...pharmacyData,
            createdBy: new mongoose.Types.ObjectId(createdBy),
            isActive: true,
            admins: pharmacyData.adminId
                ? [new mongoose.Types.ObjectId(pharmacyData.adminId)]
                : [],
        });

        await pharmacy.save();

        // If an admin was assigned, update their pharmacy assignment
        if (pharmacyData.adminId) {
            await this.assignAdminToPharmacy({
                pharmacyId: (
                    pharmacy._id as mongoose.Types.ObjectId
                ).toString(),
                adminId: pharmacyData.adminId,
            });
        }

        return pharmacy;
    }

    /**
     * Super Admin: Get all pharmacies with filters and pagination
     */
    async getPharmacies(
        page: number = 1,
        limit: number = 10,
        filters: IPharmacyFilters = {},
    ) {
        const skip = (page - 1) * limit;

        let query: any = {};

        if (filters.search) {
            query.$or = [
                { name: { $regex: filters.search, $options: 'i' } },
                {
                    registrationNumber: {
                        $regex: filters.search,
                        $options: 'i',
                    },
                },
                { 'contact.email': { $regex: filters.search, $options: 'i' } },
            ];
        }

        if (filters.isActive !== undefined) {
            query.isActive = filters.isActive;
        }

        if (filters.createdBy) {
            query.createdBy = new mongoose.Types.ObjectId(filters.createdBy);
        }

        if (filters.hasAdmin !== undefined) {
            if (filters.hasAdmin) {
                query.admins = { $ne: [], $exists: true };
            } else {
                query.$or = [
                    { admins: { $size: 0 } },
                    { admins: { $exists: false } },
                ];
            }
        }

        const [pharmacies, total] = await Promise.all([
            PharmacyInfo.find(query)
                .populate('createdBy', 'name email role')
                .populate('admins', 'name email role')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            PharmacyInfo.countDocuments(query),
        ]);

        // Get branch and user counts for each pharmacy
        const pharmaciesWithCounts = await Promise.all(
            pharmacies.map(async (pharmacy) => {
                const [branchCount, userCount] = await Promise.all([
                    Branch.countDocuments({ pharmacyId: pharmacy._id }),
                    User.countDocuments({
                        pharmacyId: pharmacy._id,
                        role: { $in: [UserRole.PHARMACIST, UserRole.CASHIER] },
                    }),
                ]);

                return {
                    ...pharmacy,
                    branchCount,
                    userCount,
                };
            }),
        );

        return {
            pharmacies: pharmaciesWithCounts,
            pagination: {
                current: page,
                pages: Math.ceil(total / limit),
                total,
                limit,
            },
        };
    }

    /**
     * Role-aware: Get pharmacies based on requester's role and scope
     * - Super Admin: Gets all pharmacies
     * - Admin: Gets only their assigned pharmacy
     */
    async getPharmaciesByRole(
        requesterId: string,
        page: number = 1,
        limit: number = 10,
        filters: IPharmacyFilters = {},
    ) {
        const requester = await User.findById(requesterId);
        if (!requester) {
            throw new UnauthorizedError('Requester not found');
        }

        if (requester.role === UserRole.SUPER_ADMIN) {
            // Super Admin sees all pharmacies
            return this.getPharmacies(page, limit, filters);
        } else if (requester.role === UserRole.ADMIN) {
            // Admin sees only their assigned pharmacy
            if (!requester.pharmacyId) {
                return {
                    pharmacies: [],
                    pagination: { current: 1, pages: 0, total: 0, limit },
                };
            }

            const pharmacy = await PharmacyInfo.findById(requester.pharmacyId)
                .populate('createdBy', 'name email role')
                .populate('admins', 'name email role')
                .lean();

            if (!pharmacy) {
                return {
                    pharmacies: [],
                    pagination: { current: 1, pages: 0, total: 0, limit },
                };
            }

            // Get branch and user counts
            const [branchCount, userCount] = await Promise.all([
                Branch.countDocuments({ pharmacyId: pharmacy._id }),
                User.countDocuments({
                    pharmacyId: pharmacy._id,
                    role: { $in: [UserRole.PHARMACIST, UserRole.CASHIER] },
                }),
            ]);

            const pharmacyWithCounts = {
                ...pharmacy,
                branchCount,
                userCount,
            };

            return {
                pharmacies: [pharmacyWithCounts],
                pagination: { current: 1, pages: 1, total: 1, limit },
            };
        } else {
            throw new UnauthorizedError(
                'Insufficient permissions to view pharmacies',
            );
        }
    }

    /**
     * Super Admin: Delete pharmacy (soft delete)
     */
    async deletePharmacy(pharmacyId: string, deletedBy: string) {
        const pharmacy = await PharmacyInfo.findById(pharmacyId);

        if (!pharmacy) {
            throw new NotFoundError('Pharmacy not found');
        }

        // Check if pharmacy has active users or branches
        const [userCount, branchCount] = await Promise.all([
            User.countDocuments({ pharmacyId, isActive: true }),
            Branch.countDocuments({ pharmacyId }),
        ]);

        if (userCount > 0 || branchCount > 0) {
            throw new BadRequestError(
                'Cannot delete pharmacy with active users or branches. Please remove all users and branches first.',
            );
        }

        // Soft delete
        pharmacy.isActive = false;
        await pharmacy.save();

        // Remove pharmacy assignments from all admins
        await User.updateMany(
            { 'assignedPharmacies.pharmacyId': pharmacyId },
            { $pull: { assignedPharmacies: { pharmacyId } } },
        );

        return pharmacy;
    }

    /**
     * Super Admin: Assign admin to pharmacy
     */
    async assignAdminToPharmacy(assignmentData: IAssignAdminRequest) {
        const { pharmacyId, adminId, permissions = [] } = assignmentData;

        // Verify pharmacy exists
        const pharmacy = await PharmacyInfo.findById(pharmacyId);
        if (!pharmacy) {
            throw new NotFoundError('Pharmacy not found');
        }

        // Verify user exists and is an admin
        const admin = await User.findById(adminId);
        if (!admin) {
            throw new NotFoundError('Admin user not found');
        }

        if (admin.role !== UserRole.ADMIN) {
            throw new BadRequestError(
                'User must be an Admin to be assigned to a pharmacy',
            );
        }

        // Update pharmacy's admin list
        if (!pharmacy.admins?.includes(new mongoose.Types.ObjectId(adminId))) {
            pharmacy.admins = pharmacy.admins || [];
            pharmacy.admins.push(new mongoose.Types.ObjectId(adminId));
            await pharmacy.save();
        }

        // Update admin's pharmacy assignments (DO NOT overwrite primary pharmacyId)
        // Keep the admin's original primary pharmacy intact
        admin.assignedPharmacies = admin.assignedPharmacies || [];

        // Remove existing assignment if present
        admin.assignedPharmacies = admin.assignedPharmacies.filter(
            (assignment) => assignment.pharmacyId.toString() !== pharmacyId,
        );

        // Add new assignment
        admin.assignedPharmacies.push({
            pharmacyId,
            pharmacyName: pharmacy.name,
            assignedAt: new Date(),
            assignedBy: admin.createdBy?.toString() || '',
            isActive: true,
            permissions,
        });

        admin.canManageUsers = true;
        await admin.save();

        return { pharmacy, admin };
    }

    /**
     * Super Admin: Remove admin from pharmacy
     */
    async removeAdminFromPharmacy(pharmacyId: string, adminId: string) {
        const pharmacy = await PharmacyInfo.findById(pharmacyId);
        if (!pharmacy) {
            throw new NotFoundError('Pharmacy not found');
        }

        const admin = await User.findById(adminId);
        if (!admin) {
            throw new NotFoundError('Admin user not found');
        }

        // Remove admin from pharmacy
        pharmacy.admins =
            pharmacy.admins?.filter((id) => id.toString() !== adminId) || [];
        await pharmacy.save();

        // Remove pharmacy assignment from admin
        admin.assignedPharmacies =
            admin.assignedPharmacies?.filter(
                (assignment) => assignment.pharmacyId.toString() !== pharmacyId,
            ) || [];

        // If admin has no more pharmacy assignments, remove pharmacy management rights
        if (!admin.assignedPharmacies.length) {
            admin.pharmacyId = undefined;
            admin.canManageUsers = false;
        }

        await admin.save();

        return { pharmacy, admin };
    }

    /**
     * Super Admin: Remove admin from all pharmacies
     */
    async removeAdminFromAllPharmacies(adminId: string) {
        const admin = await User.findById(adminId);
        if (!admin) {
            throw new NotFoundError('Admin user not found');
        }

        if (admin.role !== UserRole.ADMIN) {
            throw new BadRequestError('User is not an admin');
        }

        // Get all pharmacies that have this admin assigned
        const pharmacies = await PharmacyInfo.find({
            admins: new mongoose.Types.ObjectId(adminId),
        });

        // Remove admin from all pharmacies
        const updatePromises = pharmacies.map(async (pharmacy) => {
            pharmacy.admins =
                pharmacy.admins?.filter((id) => id.toString() !== adminId) ||
                [];
            return pharmacy.save();
        });

        await Promise.all(updatePromises);

        // Clear all pharmacy assignments from admin
        admin.assignedPharmacies = [];
        admin.pharmacyId = undefined;
        admin.canManageUsers = false;

        await admin.save();

        return {
            admin,
            removedFromPharmacies: pharmacies.length,
            pharmacyNames: pharmacies.map((p) => p.name),
        };
    }

    /**
     * Get pharmacy statistics for Super Admin dashboard
     */
    async getPharmacyStats(): Promise<IPharmacyStats> {
        const [
            totalPharmacies,
            activePharmacies,
            pharmaciesWithAdmins,
            totalBranches,
            totalUsers,
        ] = await Promise.all([
            PharmacyInfo.countDocuments(),
            PharmacyInfo.countDocuments({ isActive: true }),
            PharmacyInfo.countDocuments({
                admins: { $ne: [], $exists: true },
            }),
            Branch.countDocuments(),
            User.countDocuments({
                role: {
                    $in: [
                        UserRole.ADMIN,
                        UserRole.PHARMACIST,
                        UserRole.CASHIER,
                    ],
                },
            }),
        ]);

        return {
            totalPharmacies,
            activePharmacies,
            pharmaciesWithAdmins,
            totalBranches,
            totalUsers,
        };
    }

    /**
     * Get pharmacy by ID with full details
     */
    async getPharmacyById(pharmacyId: string) {
        const pharmacy = await PharmacyInfo.findById(pharmacyId)
            .populate('createdBy', 'name email role')
            .populate('admins', 'name email role');

        if (!pharmacy) {
            throw new NotFoundError('Pharmacy not found');
        }

        // Get additional stats
        const [branchCount, userCount, branches] = await Promise.all([
            Branch.countDocuments({ pharmacyId }),
            User.countDocuments({
                pharmacyId,
                role: { $in: [UserRole.PHARMACIST, UserRole.CASHIER] },
            }),
            Branch.find({ pharmacyId }).sort({ name: 1 }),
        ]);

        return {
            ...pharmacy.toObject(),
            branchCount,
            userCount,
            branches,
        };
    }
}
