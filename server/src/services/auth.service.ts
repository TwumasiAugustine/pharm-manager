import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import User from '../models/user.model';
import Branch from '../models/branch.model';
import { AssignmentService } from './assignment.service';
import { generateTokens } from '../utils/jwt';
import {
    BadRequestError,
    ConflictError,
    NotFoundError,
    UnauthorizedError,
} from '../utils/errors';
import {
    IAuthResponse,
    ILoginRequest,
    ISignupRequest,
    ITokenPayload,
    IUser,
    UserRole,
} from '../types/auth.types';

// Extended interface for user operations that include branchId
interface IUserWithBranchId extends Partial<IUser> {
    branchId?: string;
}

function normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
}

export class AuthService {
    async signup(userData: ISignupRequest): Promise<IAuthResponse> {
        // Normalize email
        const normalizedEmail = normalizeEmail(userData.email);

        // Check if email already exists
        const existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser) {
            throw new ConflictError('Email already in use');
        }

        // Validate branch assignment if provided and get pharmacyId
        let pharmacyId: string | undefined;
        if (userData.branchId) {
            if (!mongoose.Types.ObjectId.isValid(userData.branchId)) {
                throw new BadRequestError('Invalid branch ID format');
            }
            const branch = await Branch.findById(userData.branchId).populate(
                'pharmacyId',
            );
            if (!branch) {
                throw new NotFoundError('Branch not found');
            }
            pharmacyId = branch.pharmacyId.toString();
        }

        // Check if this is the first user (super admin) signup
        const userCount = await User.countDocuments();
        const isFirstUser = userCount === 0;

        // For first user signup, allow without pharmacyId (will be set during pharmacy setup)
        // For subsequent users, require either branchId or pharmacyId
        if (!isFirstUser && !pharmacyId && !userData.pharmacyId) {
            throw new BadRequestError(
                'Either branchId or pharmacyId must be provided',
            );
        }

        if (!pharmacyId && userData.pharmacyId) {
            pharmacyId = userData.pharmacyId;
        }

        // Create new user
        const userCreateData: any = {
            name: userData.name,
            email: normalizedEmail,
            password: userData.password,
            role:
                userData.role ||
                (isFirstUser ? UserRole.SUPER_ADMIN : UserRole.CASHIER),
        };

        // Only set pharmacyId if we have one (not for first user)
        if (pharmacyId) {
            userCreateData.pharmacyId = new mongoose.Types.ObjectId(pharmacyId);
        }

        // Only set branch if branchId is provided
        if (userData.branchId) {
            userCreateData.branch = new mongoose.Types.ObjectId(
                userData.branchId,
            );
        }

        const user = await User.create(userCreateData);

        // Convert to object to get branchId transformation
        const userObj = user.toObject() as any;

        // Generate tokens
        const tokenPayload: ITokenPayload = {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
            pharmacyId: user.pharmacyId ? user.pharmacyId.toString() : '', // Handle undefined pharmacyId
            branchId:
                userObj.branchId ||
                (user.branch ? user.branch.toString() : undefined), // Include branch ID
            isFirstSetup: user.isFirstSetup,
            permissions: user.permissions || [],
        };

        const tokens = generateTokens(tokenPayload);

        // Save refresh token to database
        user.refreshToken = tokens.refreshToken;
        await user.save();

        return {
            user: {
                id: user._id.toString(),
                name: user.name,
                email: user.email,
                role: user.role,
                pharmacyId: user.pharmacyId ? user.pharmacyId.toString() : '', // Handle undefined pharmacyId
                branchId:
                    userObj.branchId ||
                    (user.branch ? user.branch.toString() : undefined), // Include branch ID in response
                isFirstSetup: user.isFirstSetup,
                permissions: user.permissions || [],
            },
            tokens,
        };
    }

    async login(loginData: ILoginRequest): Promise<IAuthResponse> {
        // Normalize email
        const normalizedEmail = normalizeEmail(loginData.email);

        // Find user by email
        const user = await User.findOne({ email: normalizedEmail });
        if (!user) {
            throw new UnauthorizedError('Invalid email or password');
        }

        // Check password
        const isPasswordValid = await user.comparePassword(loginData.password);
        if (!isPasswordValid) {
            throw new UnauthorizedError('Invalid email or password');
        }

        // Convert to object to get branchId transformation
        const userObj = user.toObject() as any;

        // Generate tokens (include permissions and branch)
        const tokenPayload: ITokenPayload = {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
            pharmacyId: user.pharmacyId ? user.pharmacyId.toString() : '', // Handle undefined pharmacyId
            branchId:
                userObj.branchId ||
                (user.branch ? user.branch.toString() : undefined), // Include branch ID
            isFirstSetup: user.isFirstSetup,
            permissions: user.permissions || [],
        };

        const tokens = generateTokens(tokenPayload);

        // Save refresh token to database
        user.refreshToken = tokens.refreshToken;
        await user.save();

        return {
            user: {
                id: user._id.toString(),
                name: user.name,
                email: user.email,
                role: user.role,
                pharmacyId: user.pharmacyId ? user.pharmacyId.toString() : '', // Handle undefined pharmacyId
                branchId:
                    userObj.branchId ||
                    (user.branch ? user.branch.toString() : undefined), // Include branch ID in response
                isFirstSetup: user.isFirstSetup,
                permissions: user.permissions || [],
            },
            tokens,
        };
    }

    async logout(userId: string): Promise<void> {
        // Clear refresh token from database
        const user = await User.findById(userId);
        if (!user) {
            throw new NotFoundError('User not found');
        }

        user.refreshToken = undefined;
        await user.save();
    }

    async refreshTokens(refreshToken: string): Promise<IAuthResponse> {
        // Find user by refresh token
        const user = await User.findOne({ refreshToken });
        if (!user) {
            throw new UnauthorizedError('Invalid refresh token');
        }

        // Convert to object to get branchId transformation
        const userObj = user.toObject() as any;

        // Generate new tokens
        const tokenPayload: ITokenPayload = {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
            pharmacyId: user.pharmacyId ? user.pharmacyId.toString() : '', // Handle undefined pharmacyId
            branchId:
                userObj.branchId ||
                (user.branch ? user.branch.toString() : undefined), // Include branch ID
            isFirstSetup: user.isFirstSetup,
            permissions: user.permissions || [],
        };

        const tokens = generateTokens(tokenPayload);

        // Save new refresh token to database
        user.refreshToken = tokens.refreshToken;
        await user.save();

        return {
            user: {
                id: user._id.toString(),
                name: user.name,
                email: user.email,
                role: user.role,
                pharmacyId: user.pharmacyId ? user.pharmacyId.toString() : '', // Handle undefined pharmacyId
                branchId:
                    userObj.branchId ||
                    (user.branch ? user.branch.toString() : undefined), // Include branch ID in response
                isFirstSetup: user.isFirstSetup,
                permissions: user.permissions || [],
            },
            tokens,
        };
    }

    // Admin User Management Methods
    async getUsers(
        {
            page = 1,
            limit = 10,
            search = '',
        }: {
            page?: number;
            limit?: number;
            search?: string;
        },
        userRole?: string,
        userBranchId?: string,
        pharmacyId?: string,
    ) {
        const query: any = {};

        // Always filter by pharmacy for data isolation
        if (pharmacyId) {
            query.pharmacyId = pharmacyId;
        }

        // If not super admin, filter by branch
        if (userRole && userRole !== 'super_admin' && userBranchId) {
            query.branch = userBranchId;
        }

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
            ];
        }

        const total = await User.countDocuments(query);
        const users = await User.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .select('-password')
            .populate('branch', 'name address _id');

        return {
            users,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    async createUser(data: IUserWithBranchId, adminPharmacyId: string) {
        if (!data.name || !data.email || !data.password || !data.role) {
            throw new BadRequestError(
                'Name, email, password, and role are required',
            );
        }

        // Auto-assign pharmacy and branch if not provided
        const autoAssignedData = await AssignmentService.autoAssignUserIds(
            data,
            ['pharmacist', 'cashier'].includes(data.role || ''), // Require branch for non-admin roles
        );

        // Use auto-assigned pharmacy ID if adminPharmacyId is not provided
        const effectivePharmacyId =
            adminPharmacyId || autoAssignedData.pharmacyId;

        // Validate assignments
        if (autoAssignedData.pharmacyId || autoAssignedData.branchId) {
            await AssignmentService.validateAssignments(
                autoAssignedData.pharmacyId,
                autoAssignedData.branchId,
            );
        }

        // Validate branch assignment if provided
        if (autoAssignedData.branchId) {
            if (!mongoose.Types.ObjectId.isValid(autoAssignedData.branchId)) {
                throw new BadRequestError('Invalid branch ID format');
            }
            const branch = await Branch.findById(autoAssignedData.branchId);
            if (!branch) {
                throw new NotFoundError('Branch not found');
            }
            // Ensure branch belongs to the same pharmacy (only if we have effectivePharmacyId)
            if (
                effectivePharmacyId &&
                branch.pharmacyId.toString() !== effectivePharmacyId
            ) {
                throw new UnauthorizedError(
                    'Cannot assign user to branch from different pharmacy',
                );
            }
        }

        // Normalize email
        const normalizedEmail = normalizeEmail(autoAssignedData.email);

        // Prevent duplicate emails within the same pharmacy
        const emailQuery: any = { email: normalizedEmail };
        if (effectivePharmacyId) {
            emailQuery.pharmacyId = effectivePharmacyId;
        }

        const existing = await User.findOne(emailQuery);
        if (existing) {
            throw new ConflictError(
                'A user with this email already exists' +
                    (effectivePharmacyId ? ' in this pharmacy' : ''),
            );
        }

        // Note: Password will be hashed by the User model's pre-save hook
        const userData: any = {
            ...autoAssignedData,
            email: normalizedEmail,
            password: autoAssignedData.password, // Let the model handle hashing
            isFirstSetup: autoAssignedData.role === 'admin' ? true : false,
        };

        // Set pharmacyId if we have one
        if (effectivePharmacyId) {
            userData.pharmacyId = new mongoose.Types.ObjectId(
                effectivePharmacyId,
            );
        }

        // Super admin cannot have FINALIZE_SALE permission
        if (
            autoAssignedData.role === 'super_admin' &&
            autoAssignedData.permissions?.includes('FINALIZE_SALE')
        ) {
            userData.permissions = autoAssignedData.permissions.filter(
                (p: string) => p !== 'FINALIZE_SALE',
            );
        } else if (autoAssignedData.permissions) {
            userData.permissions = autoAssignedData.permissions;
        }

        // Convert branchId to branch field for MongoDB
        if (autoAssignedData.branchId) {
            userData.branch = new mongoose.Types.ObjectId(
                autoAssignedData.branchId,
            );
            delete userData.branchId;
        }

        const user = await User.create(userData);

        // Populate branch info in response
        await user.populate('branch', 'name address _id');
        const populatedUser = user.toObject({ versionKey: false }) as any;
        const { password: _, ...userResponse } = populatedUser;

        return userResponse;
    }

    async updateUser(
        id: string,
        data: IUserWithBranchId,
        adminPharmacyId: string,
    ) {
        // Build query based on whether we have pharmacyId or not (for super admin without pharmacy)
        const query: any = { _id: id };
        if (adminPharmacyId) {
            query.pharmacyId = adminPharmacyId;
        }

        const user = await User.findOne(query);
        if (!user) {
            throw new NotFoundError('User not found or access denied');
        }

        // Validate branch assignment if provided
        if (data.branchId) {
            if (!mongoose.Types.ObjectId.isValid(data.branchId)) {
                throw new BadRequestError('Invalid branch ID format');
            }
            const branch = await Branch.findById(data.branchId);
            if (!branch) {
                throw new NotFoundError('Branch not found');
            }
            // Ensure branch belongs to the same pharmacy (only if we have adminPharmacyId)
            if (
                adminPharmacyId &&
                branch.pharmacyId.toString() !== adminPharmacyId
            ) {
                throw new UnauthorizedError(
                    'Cannot assign user to branch from different pharmacy',
                );
            }
        }

        // Normalize email if present
        if (data.email) {
            data.email = normalizeEmail(data.email);
            // Prevent duplicate emails within the same pharmacy (except for self)
            const emailQuery: any = {
                email: data.email,
                _id: { $ne: id },
            };
            if (adminPharmacyId) {
                emailQuery.pharmacyId = adminPharmacyId;
            }

            const existing = await User.findOne(emailQuery);
            if (existing) {
                throw new ConflictError(
                    'A user with this email already exists' +
                        (adminPharmacyId ? ' in this pharmacy' : ''),
                );
            }
        }

        if (data.password) {
            data.password = await bcrypt.hash(data.password, 10);
        } else {
            delete data.password;
        }

        // Handle branch assignment
        const updateData: any = { ...data };

        // Super admin cannot have FINALIZE_SALE permission
        if (
            (data.role === 'super_admin' || user.role === 'super_admin') &&
            data.permissions?.includes('FINALIZE_SALE')
        ) {
            updateData.permissions = data.permissions.filter(
                (p) => p !== 'FINALIZE_SALE',
            );
        } else if (data.permissions !== undefined) {
            updateData.permissions = data.permissions;
        }

        if (data.branchId) {
            updateData.branch = new mongoose.Types.ObjectId(data.branchId);
            delete updateData.branchId;
        } else if (data.branchId === null || data.branchId === '') {
            updateData.branch = null;
            delete updateData.branchId;
        }

        Object.assign(user, updateData);
        await user.save();

        // Populate branch info in response
        await user.populate('branch', 'name address _id');
        const populatedUser = user.toObject({ versionKey: false }) as any;
        const { password: _, ...userResponse } = populatedUser;

        return userResponse;
    }

    async deleteUser(id: string, adminPharmacyId: string) {
        // Build query based on whether we have pharmacyId or not (for super admin without pharmacy)
        const query: any = { _id: id };
        if (adminPharmacyId) {
            query.pharmacyId = adminPharmacyId;
        }

        const user = await User.findOne(query);
        if (!user) {
            throw new NotFoundError('User not found or access denied');
        }

        await user.deleteOne();
        return true;
    }

    async assignPermissions(
        userId: string,
        permissions: string[],
        adminPharmacyId: string,
    ) {
        // Build query based on whether we have pharmacyId or not (for super admin without pharmacy)
        const query: any = { _id: userId };
        if (adminPharmacyId) {
            query.pharmacyId = adminPharmacyId;
        }

        const user = await User.findOne(query);
        if (!user) {
            throw new NotFoundError('User not found or access denied');
        }

        // Prevent assigning FINALIZE_SALE permission to super admin or admin
        if (
            (user.role === UserRole.SUPER_ADMIN ||
                user.role === UserRole.ADMIN) &&
            permissions.includes('FINALIZE_SALE')
        ) {
            throw new BadRequestError(
                'Super admin and admin cannot have FINALIZE_SALE permission',
            );
        }

        user.permissions = permissions;
        await user.save();

        const userObj = user.toObject({ versionKey: false }) as any;
        const { password: _, ...userResponse } = userObj;
        return userResponse;
    }
}
