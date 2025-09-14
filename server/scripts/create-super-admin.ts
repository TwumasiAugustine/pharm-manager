#!/usr/bin/env node

/**
 * Create Super Admin User Script
 *
 * This script creates a super admin user for the pharmacy management system.
 * It can be used for initial setup or to create additional super admin users.
 *
 * Usage:
 *   npm run create-super-admin
 *   or
 *   npx ts-node scripts/create-super-admin.ts
 *
 * Environment Variables Required:
 *   - MONGO_URI: MongoDB connection string
 *
 * Interactive prompts will ask for:
 *   - Name
 *   - Email
 *   - Password
 */

import * as readline from 'readline';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

// Import models after environment is loaded
import User from '../src/models/user.model';
import { UserRole } from '../src/types/auth.types';

interface SuperAdminData {
    name: string;
    email: string;
    password: string;
}

class SuperAdminCreator {
    private rl: readline.Interface;

    constructor() {
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });
    }

    private question(prompt: string): Promise<string> {
        return new Promise((resolve) => {
            this.rl.question(prompt, resolve);
        });
    }

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

    private validateEmail(email: string): boolean {
        const emailRegex = /^\S+@\S+\.\S+$/;
        return emailRegex.test(email);
    }

    private validatePassword(password: string): boolean {
        return password.length >= 6;
    }

    private async getUserInput(): Promise<SuperAdminData> {
        console.log('\n🔐 Creating Super Admin User');
        console.log('━'.repeat(40));

        let name: string;
        do {
            name = await this.question('Enter full name: ');
            if (!name.trim()) {
                console.log('❌ Name cannot be empty. Please try again.');
            }
        } while (!name.trim());

        let email: string;
        do {
            email = await this.question('Enter email address: ');
            if (!this.validateEmail(email)) {
                console.log('❌ Invalid email format. Please try again.');
            } else {
                // Check if email already exists
                const existingUser = await User.findOne({
                    email: email.trim().toLowerCase(),
                });
                if (existingUser) {
                    console.log(
                        '❌ Email already exists. Please use a different email.',
                    );
                    email = ''; // Reset to continue loop
                }
            }
        } while (!this.validateEmail(email));

        let password: string;
        do {
            password = await this.question(
                'Enter password (min 6 characters): ',
            );
            if (!this.validatePassword(password)) {
                console.log(
                    '❌ Password must be at least 6 characters. Please try again.',
                );
            }
        } while (!this.validatePassword(password));

        return {
            name: name.trim(),
            email: email.trim().toLowerCase(),
            password,
        };
    }

    private async createSuperAdmin(userData: SuperAdminData): Promise<void> {
        try {
            // Hash password
            const hashedPassword = await bcrypt.hash(userData.password, 10);

            // Create user document
            const user = new User({
                name: userData.name,
                email: userData.email,
                password: hashedPassword,
                role: UserRole.SUPER_ADMIN,
                isFirstSetup: false, // Set to true if this is for initial setup
                permissions: [
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
                ],
                // Note: pharmacyId is intentionally omitted for super admin during initial setup
            });

            await user.save();

            console.log('\n✅ Super Admin user created successfully!');
            console.log('━'.repeat(40));
            console.log(`👤 Name: ${userData.name}`);
            console.log(`📧 Email: ${userData.email}`);
            console.log(`🔑 Role: ${UserRole.SUPER_ADMIN}`);
            console.log(`🆔 User ID: ${user._id}`);
            console.log(
                '\n🎉 The super admin can now log in and set up the pharmacy.',
            );
        } catch (error) {
            console.error('❌ Failed to create super admin:', error);
            throw error;
        }
    }

    private async showExistingSuperAdmins(): Promise<void> {
        try {
            const superAdmins = await User.find({
                role: UserRole.SUPER_ADMIN,
            }).select('name email createdAt -_id');

            if (superAdmins.length > 0) {
                console.log('\n📋 Existing Super Admin Users:');
                console.log('━'.repeat(40));
                superAdmins.forEach((admin, index) => {
                    console.log(
                        `${index + 1}. ${admin.name} (${admin.email}) - Created: ${(admin as any).createdAt?.toLocaleDateString() || 'Unknown'}`,
                    );
                });
            } else {
                console.log('\n📋 No existing super admin users found.');
            }
        } catch (error) {
            console.error('❌ Failed to fetch existing super admins:', error);
        }
    }

    public async run(): Promise<void> {
        try {
            console.log('🚀 Super Admin Creation Script');
            console.log('━'.repeat(40));

            // Connect to database
            await this.connectToDatabase();

            // Show existing super admins
            await this.showExistingSuperAdmins();

            // Ask for confirmation to continue
            const shouldContinue = await this.question(
                '\nDo you want to create a new super admin? (y/N): ',
            );
            if (
                shouldContinue.toLowerCase() !== 'y' &&
                shouldContinue.toLowerCase() !== 'yes'
            ) {
                console.log('👋 Operation cancelled.');
                return;
            }

            // Get user input
            const userData = await this.getUserInput();

            // Confirm creation
            console.log('\n📋 Review Super Admin Details:');
            console.log('━'.repeat(40));
            console.log(`Name: ${userData.name}`);
            console.log(`Email: ${userData.email}`);
            console.log(`Role: ${UserRole.SUPER_ADMIN}`);

            const confirm = await this.question('\nConfirm creation? (y/N): ');
            if (
                confirm.toLowerCase() !== 'y' &&
                confirm.toLowerCase() !== 'yes'
            ) {
                console.log('👋 Operation cancelled.');
                return;
            }

            // Create super admin
            await this.createSuperAdmin(userData);
        } catch (error) {
            console.error('💥 Script failed:', error);
            process.exit(1);
        } finally {
            this.rl.close();
            await mongoose.disconnect();
            console.log('\n🔐 Database connection closed.');
            process.exit(0);
        }
    }
}

// Check if script is being run directly
if (require.main === module) {
    const creator = new SuperAdminCreator();
    creator.run().catch((error) => {
        console.error('💥 Unhandled error:', error);
        process.exit(1);
    });
}

export default SuperAdminCreator;
