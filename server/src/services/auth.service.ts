import User from '../models/user.model';
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

export class AuthService {
    async signup(userData: ISignupRequest): Promise<IAuthResponse> {
        // Normalize email
        const normalizedEmail = userData.email.trim().toLowerCase();
        // Check if email already exists
        const existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser) {
            throw new ConflictError('Email already in use');
        }

        // Create new user
        const user = await User.create({
            name: userData.name,
            email: normalizedEmail,
            password: userData.password,
            role: userData.role || UserRole.CASHIER,
        });

        // Generate tokens
        const tokenPayload: ITokenPayload = {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            isFirstSetup: user.isFirstSetup,
            permissions: user.permissions || [],
        };

        const tokens = generateTokens(tokenPayload);

        // Save refresh token to database
        user.refreshToken = tokens.refreshToken;
        await user.save();

        return {
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isFirstSetup: user.isFirstSetup,
            },
            tokens,
        };
    }

    async login(loginData: ILoginRequest): Promise<IAuthResponse> {
        // Normalize email
        const normalizedEmail = loginData.email.trim().toLowerCase();
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

        // Generate tokens
        const tokenPayload: ITokenPayload = {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            isFirstSetup: user.isFirstSetup,
        };

        const tokens = generateTokens(tokenPayload);

        // Save refresh token to database
        user.refreshToken = tokens.refreshToken;
        await user.save();

        return {
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isFirstSetup: user.isFirstSetup,
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

        // Generate new tokens
        const tokenPayload: ITokenPayload = {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            isFirstSetup: user.isFirstSetup,
        };

        const tokens = generateTokens(tokenPayload);

        // Save new refresh token to database
        user.refreshToken = tokens.refreshToken;
        await user.save();

        return {
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isFirstSetup: user.isFirstSetup,
            },
            tokens,
        };
    }
}
