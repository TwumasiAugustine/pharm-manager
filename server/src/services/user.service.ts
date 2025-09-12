import User from '../models/user.model';
import Branch from '../models/branch.model';
import { NotFoundError, ConflictError, BadRequestError } from '../utils/errors';
import { IUser } from '../types/user.types';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

// Extended interface for user operations that include branchId
interface IUserWithBranchId extends Partial<IUser> {
    branchId?: string;
}

function normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
}

export class UserService {
    async getUsers({
        page = 1,
        limit = 10,
        search = '',
    }: {
        page?: number;
        limit?: number;
        search?: string;
    }) {
        const query: any = {};
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

    async createUser(data: IUserWithBranchId) {
        if (!data.name || !data.email || !data.password || !data.role) {
            throw new BadRequestError(
                'Name, email, password, and role are required',
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
        }

        // Normalize email
        const normalizedEmail = normalizeEmail(data.email);
        // Prevent duplicate emails
        const existing = await User.findOne({ email: normalizedEmail });
        if (existing)
            throw new ConflictError('A user with this email already exists');
        const hashedPassword = await bcrypt.hash(data.password, 10);

        const userData: any = {
            ...data,
            email: normalizedEmail,
            password: hashedPassword,
            isFirstSetup: data.role === 'admin' ? true : false,
        };

        // Convert branchId to branch field for MongoDB
        if (data.branchId) {
            userData.branch = new mongoose.Types.ObjectId(data.branchId);
            delete userData.branchId; // Remove branchId as we use 'branch' in the model
        }

        const user = await User.create(userData);

        // Populate branch info in response
        await user.populate('branch', 'name address _id');
        const populatedUser = user.toObject({ versionKey: false }) as any;
        const { password: _, ...userResponse } = populatedUser;

        return userResponse;
    }

    async updateUser(id: string, data: IUserWithBranchId) {
        const user = await User.findById(id);
        if (!user) throw new NotFoundError('User not found');

        // Validate branch assignment if provided
        if (data.branchId) {
            if (!mongoose.Types.ObjectId.isValid(data.branchId)) {
                throw new BadRequestError('Invalid branch ID format');
            }
            const branch = await Branch.findById(data.branchId);
            if (!branch) {
                throw new NotFoundError('Branch not found');
            }
        }

        // Normalize email if present
        if (data.email) {
            data.email = normalizeEmail(data.email);
            // Prevent duplicate emails (except for self)
            const existing = await User.findOne({ email: data.email });
            if (existing && existing._id.toString() !== id) {
                throw new ConflictError(
                    'A user with this email already exists',
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
        if (data.branchId) {
            updateData.branch = new mongoose.Types.ObjectId(data.branchId);
            delete updateData.branchId; // Remove branchId as we use 'branch' in the model
        } else if (data.branchId === null || data.branchId === '') {
            updateData.branch = null; // Remove branch assignment
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

    async deleteUser(id: string) {
        const user = await User.findById(id);
        if (!user) throw new NotFoundError('User not found');
        await user.deleteOne();
        return true;
    }
}
