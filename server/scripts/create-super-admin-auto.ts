#!/usr/bin/env node

/**
 * Create Super Admin User - Non-Interactive Script
 *
 * This script creates a super admin user programmatically without user interaction.
 * Useful for automated deployments or CI/CD pipelines.
 *
 * Usage:
 *   npx ts-node scripts/create-super-admin-auto.ts --name "Admin Name" --email "admin@example.com" --password "securepassword"
 *
 * Or with environment variables:
 *   ADMIN_NAME="Admin Name" ADMIN_EMAIL="admin@example.com" ADMIN_PASSWORD="securepassword" npx ts-node scripts/create-super-admin-auto.ts
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

// Import models after environment is loaded
import User from '../src/models/user.model';
import { UserRole } from '../src/types/auth.types';
import {
    USER_PERMISSIONS,
    PHARMACY_PERMISSIONS,
    BRANCH_PERMISSIONS,
    REPORT_PERMISSIONS,
    DRUG_PERMISSIONS,
    CUSTOMER_PERMISSIONS,
    SALES_PERMISSIONS,
} from '../src/constants/permissions';

interface CreateSuperAdminOptions {
    name: string;
    email: string;
    password: string;
    force?: boolean; // Skip existence check
}

class AutoSuperAdminCreator {
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

    private validateInput(options: CreateSuperAdminOptions): void {
        if (!options.name || !options.name.trim()) {
            throw new Error('Name is required');
        }

        if (!options.email || !options.email.trim()) {
            throw new Error('Email is required');
        }

        const emailRegex = /^\S+@\S+\.\S+$/;
        if (!emailRegex.test(options.email)) {
            throw new Error('Invalid email format');
        }

        if (!options.password || options.password.length < 6) {
            throw new Error('Password must be at least 6 characters long');
        }
    }

    public async createSuperAdmin(
        options: CreateSuperAdminOptions,
    ): Promise<string> {
        try {
            await this.connectToDatabase();

            this.validateInput(options);

            const normalizedEmail = options.email.trim().toLowerCase();

            // Check if user already exists
            const existingUser = await User.findOne({
                email: normalizedEmail,
            });

            if (existingUser) {
                if (!options.force) {
                    throw new Error(
                        `User with email ${normalizedEmail} already exists`,
                    );
                } else {
                    // Delete existing user when force is true
                    await User.deleteOne({ email: normalizedEmail });
                    console.log(
                        `🗑️  Deleted existing user: ${normalizedEmail}`,
                    );
                }
            }

            // Create user document (password will be hashed by pre-save middleware)
            const user = new User({
                name: options.name.trim(),
                email: normalizedEmail,
                password: options.password, // Let pre-save middleware handle hashing
                role: UserRole.SUPER_ADMIN,
                isFirstSetup: false,
                permissions: [
                    USER_PERMISSIONS.CREATE_USER,
                    USER_PERMISSIONS.UPDATE_USER,
                    USER_PERMISSIONS.DELETE_USER,
                    USER_PERMISSIONS.VIEW_USERS,
                    USER_PERMISSIONS.MANAGE_PERMISSIONS,
                    PHARMACY_PERMISSIONS.MANAGE_PHARMACY,
                    PHARMACY_PERMISSIONS.VIEW_PHARMACY_INFO,
                    PHARMACY_PERMISSIONS.UPDATE_PHARMACY_SETTINGS,
                    BRANCH_PERMISSIONS.MANAGE_BRANCHES,
                    REPORT_PERMISSIONS.VIEW_REPORTS,
                    DRUG_PERMISSIONS.MANAGE_DRUGS,
                    CUSTOMER_PERMISSIONS.MANAGE_CUSTOMERS,
                    SALES_PERMISSIONS.VIEW_SALES,
                ],
                // pharmacyId is intentionally omitted for super admin during initial setup
            });

            await user.save();

            console.log('✅ Super Admin user created successfully!');
            console.log(`👤 Name: ${options.name}`);
            console.log(`📧 Email: ${normalizedEmail}`);
            console.log(`🆔 User ID: ${user._id}`);

            return user._id.toString();
        } catch (error) {
            console.error('❌ Failed to create super admin:', error);
            throw error;
        } finally {
            await mongoose.disconnect();
        }
    }
}

// Parse command line arguments
function parseArgs(): CreateSuperAdminOptions | null {
    const args = process.argv.slice(2);

    // Check for environment variables first
    const envName = process.env.ADMIN_NAME;
    const envEmail = process.env.ADMIN_EMAIL;
    const envPassword = process.env.ADMIN_PASSWORD;

    if (envName && envEmail && envPassword) {
        return {
            name: envName,
            email: envEmail,
            password: envPassword,
            force: process.env.FORCE === 'true',
        };
    }

    // Parse command line arguments
    const options: Partial<CreateSuperAdminOptions> = {};

    for (let i = 0; i < args.length; i += 2) {
        const flag = args[i];
        const value = args[i + 1];

        switch (flag) {
            case '--name':
                options.name = value;
                break;
            case '--email':
                options.email = value;
                break;
            case '--password':
                options.password = value;
                break;
            case '--force':
                options.force = true;
                i--; // No value for this flag
                break;
            case '--help':
                printHelp();
                return null;
        }
    }

    if (!options.name || !options.email || !options.password) {
        console.error('❌ Missing required arguments');
        printHelp();
        return null;
    }

    return options as CreateSuperAdminOptions;
}

function printHelp(): void {
    console.log(`
🔐 Create Super Admin User - Automated Script

Usage:
  npx ts-node scripts/create-super-admin-auto.ts --name "Admin Name" --email "admin@example.com" --password "securepassword"

Options:
  --name      Admin user's full name
  --email     Admin user's email address
  --password  Admin user's password (min 6 characters)
  --force     Skip existence check and overwrite if user exists
  --help      Show this help message

Environment Variables (alternative to command line args):
  ADMIN_NAME      Admin user's full name
  ADMIN_EMAIL     Admin user's email address
  ADMIN_PASSWORD  Admin user's password
  FORCE          Set to 'true' to skip existence check

Examples:
  # Using command line arguments
  npx ts-node scripts/create-super-admin-auto.ts \\
    --name "John Admin" \\
    --email "john@pharmacy.com" \\
    --password "mySecurePassword123"

  # Using environment variables
  ADMIN_NAME="Jane Admin" \\
  ADMIN_EMAIL="jane@pharmacy.com" \\
  ADMIN_PASSWORD="anotherSecurePassword" \\
  npx ts-node scripts/create-super-admin-auto.ts
`);
}

// Main execution
if (require.main === module) {
    const options = parseArgs();

    if (options) {
        const creator = new AutoSuperAdminCreator();
        creator
            .createSuperAdmin(options)
            .then((userId) => {
                console.log(`🎉 Super admin created with ID: ${userId}`);
                process.exit(0);
            })
            .catch((error) => {
                console.error('💥 Script failed:', error.message);
                process.exit(1);
            });
    } else {
        process.exit(1);
    }
}

export default AutoSuperAdminCreator;
