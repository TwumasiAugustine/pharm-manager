import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import mongoose from 'mongoose';
import User from '../models/user.model';
import Branch from '../models/branch.model';
import { generateTokens, verifyRefreshToken } from '../utils/jwt';
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
} from '../types/auth.types';
import { UserRole } from '../types/user.types';
import {
    hasPharmacyAccess,
    validatePharmacyAccess,
} from '../utils/pharmacy-access';

// Extended interface for user operations that include branchId
interface IUserWithBranchId extends Partial<IUser> {
    branchId?: string;
}

function normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
}

export class AuthService {
    private hashRefreshToken(token: string) {
        const secret =
            process.env.REFRESH_TOKEN_HASH_SECRET ??
            process.env.COOKIE_SECRET ??
            process.env.JWT_REFRESH_SECRET ??
            'pharm-default-refresh-secret';
        return crypto
            .createHmac('sha256', String(secret))
            .update(token)
            .digest('hex');
    }

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

        // Save hashed refresh token to database
        user.refreshToken = this.hashRefreshToken(tokens.refreshToken);
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

        // Save hashed refresh token to database
        user.refreshToken = this.hashRefreshToken(tokens.refreshToken);
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
        // First verify the refresh token is valid
        let decoded: ITokenPayload;
        try {
            decoded = verifyRefreshToken(refreshToken);
        } catch (error) {
            throw new UnauthorizedError('Invalid or expired refresh token');
        }

        // Find user by refresh token and verify it matches
        const hashed = this.hashRefreshToken(refreshToken);
        const user = await User.findOne({
            _id: decoded.id,
            refreshToken: hashed,
        });
        if (!user) {
            throw new UnauthorizedError(
                'Invalid refresh token or user not found',
            );
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

        // Save new hashed refresh token to database (rotation)
        user.refreshToken = this.hashRefreshToken(tokens.refreshToken);
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

        // Filter by branch for operational staff
        if (userRole && userBranchId) {
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

    async createUser(
        data: IUserWithBranchId,
        adminPharmacyId: string,
        adminId?: string,
    ) {
        if (!data.name || !data.email || !data.password || !data.role) {
            throw new BadRequestError(
                'Name, email, password, and role are required',
            );
        }

        // Use the provided pharmacy ID from admin
        const effectivePharmacyId = adminPharmacyId;

        // Validate that required assignments are provided
        if (!effectivePharmacyId && data.role !== UserRole.SUPER_ADMIN) {
            throw new BadRequestError(
                'Pharmacy assignment is required for all users except Super Admin',
            );
        }

        // Validate that pharmacy exists if provided
        if (effectivePharmacyId) {
            const pharmacy = await mongoose
                .model('PharmacyInfo')
                .findById(effectivePharmacyId);
            if (!pharmacy) {
                throw new BadRequestError(
                    `Pharmacy with ID ${effectivePharmacyId} not found`,
                );
            }
        }

        // Validate that branch exists if provided and belongs to pharmacy
        if (data.branchId) {
            const branch = await Branch.findById(data.branchId);
            if (!branch) {
                throw new BadRequestError(
                    `Branch with ID ${data.branchId} not found`,
                );
            }

            if (
                effectivePharmacyId &&
                branch.pharmacyId.toString() !== effectivePharmacyId
            ) {
                throw new BadRequestError(
                    'Branch does not belong to the specified pharmacy',
                );
            }
        }

        // Normalize email
        const normalizedEmail = normalizeEmail(data.email);

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
            ...data,
            email: normalizedEmail,
            password: data.password, // Let the model handle hashing
            isFirstSetup: data.role === UserRole.ADMIN ? true : false,
        };

        // Set pharmacyId if we have one
        if (effectivePharmacyId) {
            userData.pharmacyId = new mongoose.Types.ObjectId(
                effectivePharmacyId,
            );
        }

        // Super admin cannot have FINALIZE_SALE permission
        if (
            data.role === UserRole.SUPER_ADMIN &&
            data.permissions?.includes('FINALIZE_SALE')
        ) {
            userData.permissions = data.permissions.filter(
                (p: string) => p !== 'FINALIZE_SALE',
            );
        } else if (data.permissions) {
            userData.permissions = data.permissions;
        }

        // Convert branchId to branch field for MongoDB
        if (data.branchId) {
            userData.branch = new mongoose.Types.ObjectId(data.branchId);
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
        adminId?: string,
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

        // Validate admin has access to manage users in this pharmacy
        if (adminId && user.pharmacyId) {
            await validatePharmacyAccess(
                adminId,
                user.pharmacyId.toString(),
                'update users in this pharmacy',
            );
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
            (data.role === UserRole.SUPER_ADMIN ||
                user.role === UserRole.SUPER_ADMIN) &&
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

    async deleteUser(id: string, adminPharmacyId: string, adminId?: string) {
        // Build query based on whether we have pharmacyId or not (for super admin without pharmacy)
        const query: any = { _id: id };
        if (adminPharmacyId) {
            query.pharmacyId = adminPharmacyId;
        }

        const user = await User.findOne(query);
        if (!user) {
            throw new NotFoundError('User not found or access denied');
        }

        // Validate admin has access to delete users in this pharmacy
        if (adminId && user.pharmacyId) {
            await validatePharmacyAccess(
                adminId,
                user.pharmacyId.toString(),
                'delete users in this pharmacy',
            );
        }

        await user.deleteOne();
        return true;
    }

    async assignPermissions(
        userId: string,
        permissions: string[],
        adminPharmacyId: string,
        adminId?: string,
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

        // Validate admin has access to modify permissions in this pharmacy
        if (adminId && user.pharmacyId) {
            await validatePharmacyAccess(
                adminId,
                user.pharmacyId.toString(),
                'modify user permissions in this pharmacy',
            );
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

    /**
     * Check if a user has access to a specific pharmacy
     * Uses the pharmacy access utilities for comprehensive checking
     */
    async checkUserPharmacyAccess(
        userId: string,
        targetPharmacyId: string,
    ): Promise<boolean> {
        return await hasPharmacyAccess(userId, targetPharmacyId);
    }

    /**
     * Validate that a user has access to a pharmacy and throw error if not
     * Uses the pharmacy access utilities for validation
     */
    async validateUserPharmacyAccess(
        userId: string,
        targetPharmacyId: string,
        operation: string = 'access this pharmacy',
    ): Promise<void> {
        await validatePharmacyAccess(userId, targetPharmacyId, operation);
    }
}
