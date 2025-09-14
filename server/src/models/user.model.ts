import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import { UserRole } from '../types/auth.types';

import { IBranch } from '../types/branch.types';

// Interface for the user document that matches mongoose expectations
interface IUserDoc extends Document {
    _id: mongoose.Types.ObjectId;
    name: string;
    email: string;
    password: string;
    role: UserRole;
    pharmacyId?: mongoose.Types.ObjectId; // Optional for first user signup
    branch?: mongoose.Types.ObjectId | IBranch;
    isFirstSetup: boolean;
    refreshToken?: string;
    permissions?: string[];
    comparePassword(enteredPassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUserDoc>(
    {
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true,
            maxlength: [50, 'Name cannot be more than 50 characters'],
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            trim: true,
            lowercase: true,
            match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
            minlength: [6, 'Password must be at least 6 characters'],
        },
        role: {
            type: String,
            enum: Object.values(UserRole),
            default: UserRole.CASHIER,
        },
        refreshToken: {
            type: String,
        },
        isFirstSetup: {
            type: Boolean,
            default: false,
        },
        pharmacyId: {
            type: Schema.Types.ObjectId,
            ref: 'PharmacyInfo',
            required: false, // Allow first user signup without pharmacy
        },
        branch: {
            type: Schema.Types.ObjectId,
            ref: 'Branch',
            required: false, // Admins may not be branch-specific
        },
        permissions: {
            type: [String],
            default: [],
        },
    },
    {
        timestamps: true,
        toJSON: {
            transform: function (doc: any, ret: any) {
                // Add branchId for frontend compatibility
                if (ret.branch) {
                    // Handle populated branch object
                    if (typeof ret.branch === 'object' && '_id' in ret.branch) {
                        ret.branchId = ret.branch._id.toString();
                    }
                    // Handle branch object with transformed id field
                    else if (
                        typeof ret.branch === 'object' &&
                        'id' in ret.branch
                    ) {
                        ret.branchId = ret.branch.id.toString();
                    }
                    // Handle ObjectId or string
                    else if (typeof ret.branch === 'string') {
                        ret.branchId = ret.branch;
                    }
                    // Handle any other case (ObjectId, etc.)
                    else if (
                        ret.branch &&
                        typeof ret.branch.toString === 'function'
                    ) {
                        ret.branchId = ret.branch.toString();
                    }
                }
                return ret;
            },
        },
        toObject: {
            transform: function (doc: any, ret: any) {
                // Add branchId for frontend compatibility
                if (ret.branch) {
                    // Handle populated branch object
                    if (typeof ret.branch === 'object' && '_id' in ret.branch) {
                        ret.branchId = ret.branch._id.toString();
                    }
                    // Handle branch object with transformed id field
                    else if (
                        typeof ret.branch === 'object' &&
                        'id' in ret.branch
                    ) {
                        ret.branchId = ret.branch.id.toString();
                    }
                    // Handle ObjectId or string
                    else if (typeof ret.branch === 'string') {
                        ret.branchId = ret.branch;
                    }
                    // Handle any other case (ObjectId, etc.)
                    else if (
                        ret.branch &&
                        typeof ret.branch.toString === 'function'
                    ) {
                        ret.branchId = ret.branch.toString();
                    }
                }
                return ret;
            },
        },
    },
);

// Hash password before saving
userSchema.pre<IUserDoc>('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        if (error instanceof Error) {
            next(error);
        } else {
            next(new Error('Password hashing failed'));
        }
    }
});

// Compare password method
userSchema.methods.comparePassword = async function (
    enteredPassword: string,
): Promise<boolean> {
    return bcrypt.compare(enteredPassword, this.password);
};

// Indexes for better query performance
userSchema.index({ pharmacyId: 1 });
userSchema.index({ email: 1 }); // Unique index already handled by schema
userSchema.index({ pharmacyId: 1, role: 1 }); // Compound index for pharmacy filtering with role

const User = mongoose.model<IUserDoc>('User', userSchema);

export type { IUserDoc };
export default User;
