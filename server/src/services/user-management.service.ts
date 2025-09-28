import User from '../models/user.model';
import Branch from '../models/branch.model';
import PharmacyInfo from '../models/pharmacy-info.model';
import {
    UserRole,
    ICreateUserRequest,
    IUserHierarchy,
} from '../types/user.types';
import {
    NotFoundError,
    ConflictError,
    BadRequestError,
    UnauthorizedError,
} from '../utils/errors';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

export class UserManagementService {
    /**
     * Define role hierarchy and permissions
     */
    private getUserHierarchy(role: UserRole): IUserHierarchy {
        switch (role) {
            case UserRole.SUPER_ADMIN:
                return {
                    canCreateUsers: [
                        UserRole.ADMIN,
                        UserRole.PHARMACIST,
                        UserRole.CASHIER,
                    ],
                    canAssignRoles: [
                        UserRole.ADMIN,
                        UserRole.PHARMACIST,
                        UserRole.CASHIER,
                    ],
                    canManagePharmacies: true,
                    canManageBranches: true,
                    scopeLevel: 'global',
                };

            case UserRole.ADMIN:
                return {
                    canCreateUsers: [UserRole.PHARMACIST, UserRole.CASHIER],
                    canAssignRoles: [UserRole.PHARMACIST, UserRole.CASHIER],
                    canManagePharmacies: false,
                    canManageBranches: true,
                    scopeLevel: 'pharmacy',
                };

            case UserRole.PHARMACIST:
                return {
                    canCreateUsers: [],
                    canAssignRoles: [],
                    canManagePharmacies: false,
                    canManageBranches: false,
                    scopeLevel: 'branch',
                };

            case UserRole.CASHIER:
                return {
                    canCreateUsers: [],
                    canAssignRoles: [],
                    canManagePharmacies: false,
                    canManageBranches: false,
                    scopeLevel: 'branch',
                };

            default:
                throw new BadRequestError('Invalid user role');
        }
    }

    /**
     * Validate if creator can create user with specified role
     */
    private validateUserCreation(
        creatorRole: UserRole,
        targetRole: UserRole,
    ): boolean {
        const hierarchy = this.getUserHierarchy(creatorRole);
        return hierarchy.canCreateUsers.includes(targetRole);
    }

    /**
     * Super Admin: Create Admin user and optionally assign to pharmacy
     */
    async createAdminUser(
        adminData: ICreateUserRequest,
        createdBy: string,
        assignToPharmacy?: string,
    ) {
        // Validate creator is Super Admin
        const creator = await User.findById(createdBy);
        if (!creator || creator.role !== UserRole.SUPER_ADMIN) {
            throw new UnauthorizedError(
                'Only Super Admin can create Admin users',
            );
        }

        // Check if email already exists
        const existingUser = await User.findOne({
            email: adminData.email.toLowerCase(),
        });
        if (existingUser) {
            throw new ConflictError('User with this email already exists');
        }

        // Validate pharmacy if provided
        if (assignToPharmacy) {
            const pharmacy = await PharmacyInfo.findById(assignToPharmacy);
            if (!pharmacy) {
                throw new NotFoundError('Pharmacy not found');
            }
        }

        const admin = new User({
            name: adminData.name,
            email: adminData.email.toLowerCase(),
            password: adminData.password,
            role: UserRole.ADMIN,
            pharmacyId: assignToPharmacy
                ? new mongoose.Types.ObjectId(assignToPharmacy)
                : undefined,
            createdBy: new mongoose.Types.ObjectId(createdBy),
            canManageUsers: true,
            canManagePharmacies: false,
            isActive: true,
            permissions: adminData.permissions || [],
        });

        await admin.save();

        // If assigned to pharmacy, update pharmacy's admin list
        if (assignToPharmacy) {
            await PharmacyInfo.findByIdAndUpdate(assignToPharmacy, {
                $addToSet: { admins: admin._id },
            });
        }

        // Remove password from response
        const { password, ...adminResponse } = admin.toObject();

        return adminResponse;
    }

    /**
     * Super Admin: Get all admin users with pharmacy assignments
     */
    async getAllAdmins(requesterId: string) {
        // Validate requester is Super Admin
        const requester = await User.findById(requesterId);
        if (!requester || requester.role !== UserRole.SUPER_ADMIN) {
            throw new UnauthorizedError(
                'Only Super Admin can access all admin users',
            );
        }

        const admins = await User.find({ role: UserRole.ADMIN })
            .populate('pharmacyId', 'name')
            .populate('createdBy', 'name email')
            .select('-password -refreshToken')
            .sort({ createdAt: -1 })
            .lean();

        return admins;
    }

    /**
     * Super Admin: Create Admin without immediate pharmacy assignment
     */
    async createUnassignedAdmin(
        adminData: ICreateUserRequest,
        createdBy: string,
    ) {
        return this.createAdminUser(adminData, createdBy);
    }

    /**
     * Admin: Create Pharmacist or Cashier user within their pharmacy
     */
    async createPharmacyUser(userData: ICreateUserRequest, createdBy: string) {
        // Validate creator is Admin
        const creator = await User.findById(createdBy);
        if (!creator || creator.role !== UserRole.ADMIN) {
            throw new UnauthorizedError(
                'Only Admin can create Pharmacist/Cashier users',
            );
        }

        // Validate creator can create this role
        if (!this.validateUserCreation(creator.role, userData.role)) {
            throw new UnauthorizedError(
                `Admin cannot create ${userData.role} users`,
            );
        }

        // Admin must have a pharmacy assigned
        if (!creator.pharmacyId) {
            throw new BadRequestError(
                'Admin must be assigned to a pharmacy to create users',
            );
        }

        // Check if email already exists
        const existingUser = await User.findOne({
            email: userData.email.toLowerCase(),
        });
        if (existingUser) {
            throw new ConflictError('User with this email already exists');
        }

        // Validate branch if provided (required for Pharmacist/Cashier)
        if (userData.branchId) {
            const branch = await Branch.findOne({
                _id: userData.branchId,
                pharmacyId: creator.pharmacyId,
            });
            if (!branch) {
                throw new NotFoundError(
                    'Branch not found or not in your pharmacy',
                );
            }
        }

        const user = new User({
            name: userData.name,
            email: userData.email.toLowerCase(),
            password: userData.password,
            role: userData.role,
            pharmacyId: creator.pharmacyId,
            branch: userData.branchId
                ? new mongoose.Types.ObjectId(userData.branchId)
                : undefined,
            createdBy: new mongoose.Types.ObjectId(createdBy),
            canManageUsers: false,
            canManagePharmacies: false,
            isActive: true,
            permissions: userData.permissions || [],
        });

        await user.save();

        // Remove password from response
        const { password, ...userResponse } = user.toObject();

        return userResponse;
    }

    /**
     * Get users with role-based filtering
     */
    async getUsers(
        requesterId: string,
        page: number = 1,
        limit: number = 10,
        filters: {
            search?: string;
            role?: UserRole;
            branchId?: string;
            isActive?: boolean;
        } = {},
    ) {
        const requester = await User.findById(requesterId);
        if (!requester) {
            throw new UnauthorizedError('Invalid user');
        }

        const skip = (page - 1) * limit;
        let query: any = {};

        // Apply role-based access control
        switch (requester.role) {
            case UserRole.SUPER_ADMIN:
                // Super Admin can see all users
                break;

            case UserRole.ADMIN:
                // Admin can only see users in their pharmacy
                if (!requester.pharmacyId) {
                    throw new BadRequestError(
                        'Admin must be assigned to a pharmacy',
                    );
                }
                query.pharmacyId = requester.pharmacyId;
                // Admin cannot see other Super Admins or Admins
                query.role = { $in: [UserRole.PHARMACIST, UserRole.CASHIER] };
                break;

            case UserRole.PHARMACIST:
            case UserRole.CASHIER:
                // Pharmacist/Cashier can only see users in their branch
                if (!requester.branch) {
                    throw new BadRequestError(
                        'User must be assigned to a branch',
                    );
                }
                query.branch = requester.branch;
                query.role = { $in: [UserRole.PHARMACIST, UserRole.CASHIER] };
                break;

            default:
                throw new UnauthorizedError('Invalid user role');
        }

        // Apply filters
        if (filters.search) {
            query.$or = [
                { name: { $regex: filters.search, $options: 'i' } },
                { email: { $regex: filters.search, $options: 'i' } },
            ];
        }

        if (filters.role) {
            // Ensure role filter respects access control
            const allowedRoles = query.role?.$in || Object.values(UserRole);
            if (allowedRoles.includes(filters.role)) {
                query.role = filters.role;
            }
        }

        if (filters.branchId && requester.role === UserRole.ADMIN) {
            // Only Admin can filter by branch (within their pharmacy)
            const branch = await Branch.findOne({
                _id: filters.branchId,
                pharmacyId: requester.pharmacyId,
            });
            if (branch) {
                query.branch = new mongoose.Types.ObjectId(filters.branchId);
            }
        }

        if (filters.isActive !== undefined) {
            query.isActive = filters.isActive;
        }

        const [users, total] = await Promise.all([
            User.find(query)
                .populate('pharmacyId', 'name')
                .populate('branch', 'name')
                .populate('createdBy', 'name email')
                .select('-password -refreshToken')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            User.countDocuments(query),
        ]);

        return {
            users,
            pagination: {
                current: page,
                pages: Math.ceil(total / limit),
                total,
                limit,
            },
        };
    }

    /**
     * Update user with role-based access control
     */
    async updateUser(
        userId: string,
        updateData: Partial<ICreateUserRequest>,
        updatedBy: string,
    ) {
        const [user, updater] = await Promise.all([
            User.findById(userId),
            User.findById(updatedBy),
        ]);

        if (!user) {
            throw new NotFoundError('User not found');
        }

        if (!updater) {
            throw new UnauthorizedError('Invalid updater');
        }

        // Check permission to update user
        switch (updater.role) {
            case UserRole.SUPER_ADMIN:
                // Super Admin can update anyone
                break;

            case UserRole.ADMIN:
                // Admin can only update users in their pharmacy (except other Admins/Super Admins)
                if (
                    !updater.pharmacyId?.equals(user.pharmacyId) ||
                    [UserRole.ADMIN, UserRole.SUPER_ADMIN].includes(user.role)
                ) {
                    throw new UnauthorizedError('Cannot update this user');
                }
                break;

            default:
                // Pharmacist/Cashier cannot update other users
                throw new UnauthorizedError('Insufficient permissions');
        }

        // Prevent role escalation
        if (updateData.role && updateData.role !== user.role) {
            if (!this.validateUserCreation(updater.role, updateData.role)) {
                throw new UnauthorizedError('Cannot assign this role');
            }
        }

        // Update user
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                ...updateData,
                ...(updateData.password && {
                    password: await bcrypt.hash(updateData.password, 10),
                }),
            },
            { new: true, select: '-password -refreshToken' },
        )
            .populate('pharmacyId', 'name')
            .populate('branch', 'name')
            .populate('createdBy', 'name email');

        return updatedUser;
    }

    /**
     * Deactivate user
     */
    async deactivateUser(userId: string, deactivatedBy: string) {
        const [user, deactivator] = await Promise.all([
            User.findById(userId),
            User.findById(deactivatedBy),
        ]);

        if (!user) {
            throw new NotFoundError('User not found');
        }

        if (!deactivator) {
            throw new UnauthorizedError('Invalid deactivator');
        }

        // Check permission to deactivate user (same rules as update)
        switch (deactivator.role) {
            case UserRole.SUPER_ADMIN:
                break;

            case UserRole.ADMIN:
                if (
                    !deactivator.pharmacyId?.equals(user.pharmacyId) ||
                    [UserRole.ADMIN, UserRole.SUPER_ADMIN].includes(user.role)
                ) {
                    throw new UnauthorizedError('Cannot deactivate this user');
                }
                break;

            default:
                throw new UnauthorizedError('Insufficient permissions');
        }

        user.isActive = false;
        await user.save();

        return user;
    }

    /**
     * Get user statistics
     */
    async getUserStats(requesterId: string) {
        const requester = await User.findById(requesterId);
        if (!requester) {
            throw new UnauthorizedError('Invalid user');
        }

        let query: any = {};

        // Apply role-based filtering
        switch (requester.role) {
            case UserRole.SUPER_ADMIN:
                // No filter - see all
                break;

            case UserRole.ADMIN:
                query.pharmacyId = requester.pharmacyId;
                break;

            default:
                query.branch = requester.branch;
                break;
        }

        const [
            totalUsers,
            activeUsers,
            adminCount,
            pharmacistCount,
            cashierCount,
        ] = await Promise.all([
            User.countDocuments(query),
            User.countDocuments({ ...query, isActive: true }),
            User.countDocuments({ ...query, role: UserRole.ADMIN }),
            User.countDocuments({ ...query, role: UserRole.PHARMACIST }),
            User.countDocuments({ ...query, role: UserRole.CASHIER }),
        ]);

        return {
            totalUsers,
            activeUsers,
            roleDistribution: {
                admin: adminCount,
                pharmacist: pharmacistCount,
                cashier: cashierCount,
            },
        };
    }
}
