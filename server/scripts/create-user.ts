#!/usr/bin/env node

/**
 * Advanced User Creation Script
 *
 * This script provides advanced functionality for creating users including:
 * - Super admin users
 * - Admin users with pharmacy assignment
 * - Regular users with branch assignment
 * - Batch user creation from JSON file
 *
 * Usage:
 *   npm run create-user -- --type super-admin --name "Admin" --email "admin@test.com" --password "password"
 *   npm run create-user -- --type admin --name "Pharmacy Admin" --email "p.admin@test.com" --password "password" --pharmacy-id "pharmacyId"
 *   npm run create-user -- --batch users.json
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

// Import models
import User from '../models/user.model';
import PharmacyInfo from '../models/pharmacy-info.model';
import Branch from '../models/branch.model';
import { UserRole } from '../src/types/user.types';

interface UserCreateOptions {
    type: 'super-admin' | 'admin' | 'pharmacist' | 'cashier';
    name: string;
    email: string;
    password: string;
    pharmacyId?: string;
    branchId?: string;
    permissions?: string[];
}

interface BatchUser {
    name: string;
    email: string;
    password: string;
    role: string;
    pharmacyId?: string;
    branchId?: string;
    permissions?: string[];
}

class AdvancedUserCreator {
    private async connectToDatabase(): Promise<void> {
        try {
            if (!process.env.MONGO_URI) {
                throw new Error('MONGO_URI environment variable is required');
            }

            await mongoose.connect(process.env.MONGO_URI, {
                serverSelectionTimeoutMS: 5000,
                socketTimeoutMS: 30000,
            });

            console.log('✅ Connected to MongoDB successfully');
        } catch (error) {
            console.error('❌ Database connection failed:', error);
            throw error;
        }
    }

    private async validateReferences(
        options: UserCreateOptions,
    ): Promise<void> {
        // Validate pharmacy if provided
        if (options.pharmacyId) {
            if (!mongoose.Types.ObjectId.isValid(options.pharmacyId)) {
                throw new Error('Invalid pharmacy ID format');
            }

            const pharmacy = await PharmacyInfo.findById(options.pharmacyId);
            if (!pharmacy) {
                throw new Error(
                    `Pharmacy with ID ${options.pharmacyId} not found`,
                );
            }
        }

        // Validate branch if provided
        if (options.branchId) {
            if (!mongoose.Types.ObjectId.isValid(options.branchId)) {
                throw new Error('Invalid branch ID format');
            }

            const branch = await Branch.findById(options.branchId);
            if (!branch) {
                throw new Error(`Branch with ID ${options.branchId} not found`);
            }

            // If both pharmacy and branch are provided, ensure they match
            if (
                options.pharmacyId &&
                branch.pharmacyId.toString() !== options.pharmacyId
            ) {
                throw new Error(
                    'Branch does not belong to the specified pharmacy',
                );
            }
        }
    }

    private getDefaultPermissions(type: string): string[] {
        switch (type) {
            case 'super-admin':
                return [
                    'CREATE_USER',
                    'UPDATE_USER',
                    'DELETE_USER',
                    'VIEW_USERS',
                    'MANAGE_PERMISSIONS',
                    'MANAGE_PHARMACY',
                    'MANAGE_BRANCHES',
                    'VIEW_REPORTS',
                    'MANAGE_DRUGS',
                    'MANAGE_CUSTOMERS',
                    'VIEW_SALES',
                ];
            case 'admin':
                return [
                    'CREATE_USER',
                    'UPDATE_USER',
                    'VIEW_USERS',
                    'MANAGE_PERMISSIONS',
                    'MANAGE_BRANCHES',
                    'VIEW_REPORTS',
                    'MANAGE_DRUGS',
                    'MANAGE_CUSTOMERS',
                    'VIEW_SALES',
                ];
            case 'pharmacist':
                return [
                    'VIEW_USERS',
                    'MANAGE_DRUGS',
                    'VIEW_SALES',
                    'FINALIZE_SALE',
                    'MANAGE_CUSTOMERS',
                ];
            case 'cashier':
                return ['VIEW_SALES', 'CREATE_SALE', 'VIEW_CUSTOMERS'];
            default:
                return [];
        }
    }

    private mapUserType(type: string): UserRole {
        switch (type) {
            case 'super-admin':
                return UserRole.SUPER_ADMIN;
            case 'admin':
                return UserRole.ADMIN;
            case 'pharmacist':
                return UserRole.PHARMACIST;
            case 'cashier':
                return UserRole.CASHIER;
            default:
                throw new Error(`Invalid user type: ${type}`);
        }
    }

    public async createUser(options: UserCreateOptions): Promise<string> {
        try {
            await this.connectToDatabase();

            // Validate input
            if (!options.name || !options.email || !options.password) {
                throw new Error('Name, email, and password are required');
            }

            if (options.password.length < 6) {
                throw new Error('Password must be at least 6 characters long');
            }

            const emailRegex = /^\S+@\S+\.\S+$/;
            if (!emailRegex.test(options.email)) {
                throw new Error('Invalid email format');
            }

            // Validate references
            await this.validateReferences(options);

            const normalizedEmail = options.email.trim().toLowerCase();

            // Check if user already exists
            const existingUser = await User.findOne({ email: normalizedEmail });
            if (existingUser) {
                throw new Error(
                    `User with email ${normalizedEmail} already exists`,
                );
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(options.password, 10);

            // Prepare user data
            const userData: any = {
                name: options.name.trim(),
                email: normalizedEmail,
                password: hashedPassword,
                role: this.mapUserType(options.type),
                permissions:
                    options.permissions ||
                    this.getDefaultPermissions(options.type),
                isFirstSetup: false,
            };

            // Add pharmacy reference if provided
            if (options.pharmacyId) {
                userData.pharmacyId = new mongoose.Types.ObjectId(
                    options.pharmacyId,
                );
            }

            // Add branch reference if provided
            if (options.branchId) {
                userData.branch = new mongoose.Types.ObjectId(options.branchId);
            }

            // Create user
            const user = new User(userData);
            await user.save();

            console.log('✅ User created successfully!');
            console.log(`👤 Name: ${options.name}`);
            console.log(`📧 Email: ${normalizedEmail}`);
            console.log(`🔑 Role: ${options.type}`);
            console.log(`🆔 User ID: ${user._id}`);

            if (options.pharmacyId) {
                console.log(`🏥 Pharmacy ID: ${options.pharmacyId}`);
            }

            if (options.branchId) {
                console.log(`🏢 Branch ID: ${options.branchId}`);
            }

            return user._id.toString();
        } catch (error) {
            console.error('❌ Failed to create user:', error);
            throw error;
        } finally {
            await mongoose.disconnect();
        }
    }

    public async createUsersFromBatch(filePath: string): Promise<string[]> {
        try {
            await this.connectToDatabase();

            // Read and parse JSON file
            const fileContent = fs.readFileSync(filePath, 'utf8');
            const batchUsers: BatchUser[] = JSON.parse(fileContent);

            if (!Array.isArray(batchUsers)) {
                throw new Error(
                    'Batch file must contain an array of user objects',
                );
            }

            const createdUserIds: string[] = [];

            console.log(
                `📦 Creating ${batchUsers.length} users from batch file...`,
            );
            console.log('━'.repeat(50));

            for (let i = 0; i < batchUsers.length; i++) {
                const userData = batchUsers[i];

                try {
                    console.log(
                        `\n👤 Creating user ${i + 1}/${batchUsers.length}: ${userData.name}`,
                    );

                    const options: UserCreateOptions = {
                        type: userData.role as UserCreateOptions['type'],
                        name: userData.name,
                        email: userData.email,
                        password: userData.password,
                        pharmacyId: userData.pharmacyId,
                        branchId: userData.branchId,
                        permissions: userData.permissions,
                    };

                    // Validate and create user (without connecting again)
                    await this.validateReferences(options);

                    const normalizedEmail = options.email.trim().toLowerCase();
                    const existingUser = await User.findOne({
                        email: normalizedEmail,
                    });
                    if (existingUser) {
                        console.log(
                            `⚠️  User with email ${normalizedEmail} already exists, skipping...`,
                        );
                        continue;
                    }

                    const hashedPassword = await bcrypt.hash(
                        options.password,
                        10,
                    );

                    const userDocument: any = {
                        name: options.name.trim(),
                        email: normalizedEmail,
                        password: hashedPassword,
                        role: this.mapUserType(options.type),
                        permissions:
                            options.permissions ||
                            this.getDefaultPermissions(options.type),
                        isFirstSetup: false,
                    };

                    if (options.pharmacyId) {
                        userDocument.pharmacyId = new mongoose.Types.ObjectId(
                            options.pharmacyId,
                        );
                    }

                    if (options.branchId) {
                        userDocument.branch = new mongoose.Types.ObjectId(
                            options.branchId,
                        );
                    }

                    const user = new User(userDocument);
                    await user.save();

                    createdUserIds.push(user._id.toString());
                    console.log(
                        `✅ Created: ${userData.name} (${normalizedEmail})`,
                    );
                } catch (error) {
                    console.error(
                        `❌ Failed to create user ${userData.name}:`,
                        error,
                    );
                }
            }

            console.log('\n━'.repeat(50));
            console.log(
                `🎉 Batch creation complete! Created ${createdUserIds.length} users.`,
            );

            return createdUserIds;
        } catch (error) {
            console.error('❌ Batch creation failed:', error);
            throw error;
        } finally {
            await mongoose.disconnect();
        }
    }
}

// Parse command line arguments
function parseArgs(): {
    mode: 'single' | 'batch';
    options?: UserCreateOptions;
    batchFile?: string;
} | null {
    const args = process.argv.slice(2);

    if (args.includes('--help')) {
        printHelp();
        return null;
    }

    if (args.includes('--batch')) {
        const batchIndex = args.indexOf('--batch');
        const batchFile = args[batchIndex + 1];
        if (!batchFile) {
            console.error('❌ Batch file path is required');
            return null;
        }
        return { mode: 'batch', batchFile };
    }

    // Parse single user creation
    const options: Partial<UserCreateOptions> = {};

    for (let i = 0; i < args.length; i += 2) {
        const flag = args[i];
        const value = args[i + 1];

        switch (flag) {
            case '--type':
                options.type = value as UserCreateOptions['type'];
                break;
            case '--name':
                options.name = value;
                break;
            case '--email':
                options.email = value;
                break;
            case '--password':
                options.password = value;
                break;
            case '--pharmacy-id':
                options.pharmacyId = value;
                break;
            case '--branch-id':
                options.branchId = value;
                break;
        }
    }

    if (!options.type || !options.name || !options.email || !options.password) {
        console.error('❌ Missing required arguments for single user creation');
        printHelp();
        return null;
    }

    return { mode: 'single', options: options as UserCreateOptions };
}

function printHelp(): void {
    console.log(`
👥 Advanced User Creation Script

Usage:
  # Create single user
  npm run create-user -- --type <type> --name "Name" --email "email" --password "password" [options]

  # Create users from batch file
  npm run create-user -- --batch users.json

User Types:
  super-admin    Super administrator (no pharmacy required)
  admin          Pharmacy administrator (pharmacy-id required)
  pharmacist     Pharmacist (pharmacy-id and/or branch-id)
  cashier        Cashier (pharmacy-id and/or branch-id)

Options:
  --type         User type (required for single creation)
  --name         User's full name (required)
  --email        User's email address (required)
  --password     User's password (required, min 6 chars)
  --pharmacy-id  Pharmacy ID (required for admin/pharmacist/cashier)
  --branch-id    Branch ID (optional, for branch-specific users)
  --batch        Path to JSON file with user data
  --help         Show this help message

Batch File Format (JSON):
[
  {
    "name": "John Admin",
    "email": "john@pharmacy.com",
    "password": "securepass123",
    "role": "admin",
    "pharmacyId": "60f0b1b5b0b9a40015b0b9a4",
    "permissions": ["CREATE_USER", "VIEW_REPORTS"]
  },
  {
    "name": "Jane Pharmacist",
    "email": "jane@pharmacy.com",
    "password": "anotherpass123",
    "role": "pharmacist",
    "pharmacyId": "60f0b1b5b0b9a40015b0b9a4",
    "branchId": "60f0b1b5b0b9a40015b0b9a5"
  }
]

Examples:
  # Create super admin
  npm run create-user -- --type super-admin --name "Super Admin" --email "super@test.com" --password "password123"

  # Create pharmacy admin
  npm run create-user -- --type admin --name "Pharmacy Admin" --email "admin@pharmacy.com" --password "adminpass" --pharmacy-id "60f0b1b5b0b9a40015b0b9a4"

  # Create pharmacist with branch
  npm run create-user -- --type pharmacist --name "John Pharmacist" --email "john@pharmacy.com" --password "pharmpass" --pharmacy-id "60f0b1b5b0b9a40015b0b9a4" --branch-id "60f0b1b5b0b9a40015b0b9a5"

  # Batch create from file
  npm run create-user -- --batch users.json
`);
}

// Main execution
if (require.main === module) {
    const parsed = parseArgs();

    if (parsed) {
        const creator = new AdvancedUserCreator();

        if (parsed.mode === 'single' && parsed.options) {
            creator
                .createUser(parsed.options)
                .then((userId) => {
                    console.log(`🎉 User created with ID: ${userId}`);
                    process.exit(0);
                })
                .catch((error) => {
                    console.error('💥 Script failed:', error.message);
                    process.exit(1);
                });
        } else if (parsed.mode === 'batch' && parsed.batchFile) {
            creator
                .createUsersFromBatch(parsed.batchFile)
                .then((userIds) => {
                    console.log(`🎉 Created ${userIds.length} users`);
                    process.exit(0);
                })
                .catch((error) => {
                    console.error('💥 Batch creation failed:', error.message);
                    process.exit(1);
                });
        }
    } else {
        process.exit(1);
    }
}

export default AdvancedUserCreator;
