import User from '../models/user.model';
import { NotFoundError, ConflictError, BadRequestError } from '../utils/errors';
import { IUser } from '../types/user.types';
import bcrypt from 'bcryptjs';

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
            .select('-password');
        return {
            users,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    async createUser(data: Partial<IUser>) {
        if (!data.name || !data.email || !data.password || !data.role) {
            throw new BadRequestError(
                'Name, email, password, and role are required',
            );
        }
        // Normalize email
        const normalizedEmail = normalizeEmail(data.email);
        // Prevent duplicate emails
        const existing = await User.findOne({ email: normalizedEmail });
        if (existing)
            throw new ConflictError('A user with this email already exists');
        const hashedPassword = await bcrypt.hash(data.password, 10);
        const user = await User.create({
            ...data,
            email: normalizedEmail,
            password: hashedPassword,
            isFirstSetup: data.role === 'admin' ? true : false,
        });
        const { password, ...userWithoutPassword } = user.toObject({
            versionKey: false,
        });
        return userWithoutPassword;
    }

    async updateUser(id: string, data: Partial<IUser>) {
        const user = await User.findById(id);
        if (!user) throw new NotFoundError('User not found');
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
        Object.assign(user, data);
        await user.save();
        const { password, ...userObj } = user.toObject();
        return userObj;
    }

    async deleteUser(id: string) {
        const user = await User.findById(id);
        if (!user) throw new NotFoundError('User not found');
        await user.deleteOne();
        return true;
    }
}
