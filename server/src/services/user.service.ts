import User from '../models/user.model';
import { NotFoundError, ConflictError, BadRequestError } from '../utils/errors';
import { IUser, UserRole } from '../types/user.types';
import bcrypt from 'bcryptjs';

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
        const existing = await User.findOne({ email: data.email });
        if (existing) throw new ConflictError('Email already exists');
        const hashedPassword = await bcrypt.hash(data.password, 10);
        const user = await User.create({ ...data, password: hashedPassword });
        const { password, ...userWithoutPassword } = user.toObject({
            versionKey: false,
        });
        return userWithoutPassword;
    }

    async updateUser(id: string, data: Partial<IUser>) {
        const user = await User.findById(id);
        if (!user) throw new NotFoundError('User not found');
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
