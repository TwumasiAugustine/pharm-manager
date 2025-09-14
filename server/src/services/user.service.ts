import User from '../models/user.model';
import Branch from '../models/branch.model';
import { NotFoundError, ConflictError, BadRequestError } from '../utils/errors';
import { IUser } from '../types/user.types';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { AuthService } from './auth.service';

// Extended interface for user operations that include branchId
interface IUserWithBranchId extends Partial<IUser> {
    branchId?: string;
}

function normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
}

export class UserService {
    private authService: AuthService;

    constructor() {
        this.authService = new AuthService();
    }
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
        // Delegate to auth service with pharmacy filtering
        return this.authService.getUsers(
            { page, limit, search },
            userRole,
            userBranchId,
            pharmacyId,
        );
    }

    async createUser(data: IUserWithBranchId, adminPharmacyId?: string) {
        // Allow super admin operations without pharmacy ID
        if (!adminPharmacyId && adminPharmacyId !== '') {
            // Fallback to original behavior if no pharmacy ID provided
            throw new BadRequestError('Pharmacy ID is required');
        }
        // Delegate to auth service with pharmacy filtering
        return this.authService.createUser(data, adminPharmacyId);
    }

    async updateUser(
        id: string,
        data: IUserWithBranchId,
        adminPharmacyId?: string,
    ) {
        // Allow super admin operations without pharmacy ID
        if (!adminPharmacyId && adminPharmacyId !== '') {
            // Fallback to original behavior if no pharmacy ID provided
            throw new BadRequestError('Pharmacy ID is required');
        }
        // Delegate to auth service with pharmacy filtering
        return this.authService.updateUser(id, data, adminPharmacyId);
    }

    async deleteUser(id: string, adminPharmacyId?: string) {
        // Allow super admin operations without pharmacy ID
        if (!adminPharmacyId && adminPharmacyId !== '') {
            // Fallback to original behavior if no pharmacy ID provided
            throw new BadRequestError('Pharmacy ID is required');
        }
        // Delegate to auth service with pharmacy filtering
        return this.authService.deleteUser(id, adminPharmacyId);
    }

    // Add assignment permissions method from auth service
    async assignPermissions(
        userId: string,
        permissions: string[],
        adminPharmacyId: string,
    ) {
        return this.authService.assignPermissions(
            userId,
            permissions,
            adminPharmacyId,
        );
    }
}
