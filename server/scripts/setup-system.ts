#!/usr/bin/env node

/**
 * Complete System Setup Script
 * Automatically sets up pharmacy, creates default branch, and creates super admin
 * This script provides a comprehensive setup for new pharmacy systems
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import readline from 'readline';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

import PharmacyInfo from '../src/models/pharmacy-info.model';
import Branch from '../src/models/branch.model';
import User from '../src/models/user.model';
import { UserRole } from '../src/types/auth.types';
import { AssignmentService } from '../src/services/assignment.service';
import {
    USER_PERMISSIONS,
    PHARMACY_PERMISSIONS,
    BRANCH_PERMISSIONS,
    REPORT_PERMISSIONS,
    DRUG_PERMISSIONS,
    CUSTOMER_PERMISSIONS,
    SALES_PERMISSIONS,
} from '../src/constants/permissions';

interface SetupOptions {
    pharmacyName?: string;
    pharmacyEmail?: string;
    pharmacyPhone?: string;
    branchName?: string;
    adminName?: string;
    adminEmail?: string;
    adminPassword?: string;
    force?: boolean;
}

class SystemSetup {
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

    private async setupPharmacy(options: SetupOptions): Promise<any> {
        console.log('\n🏥 Setting up pharmacy information...');

        const pharmacyName =
            options.pharmacyName ||
            (await this.question('Enter pharmacy name: '));
        const pharmacyEmail =
            options.pharmacyEmail ||
            (await this.question('Enter pharmacy email: '));
        const pharmacyPhone =
            options.pharmacyPhone ||
            (await this.question('Enter pharmacy phone: '));

        // Check if pharmacy already exists
        const existingPharmacy = await PharmacyInfo.findOne();
        if (existingPharmacy && !options.force) {
            console.log(
                `⚠️  Pharmacy already exists: ${existingPharmacy.name}`,
            );
            return existingPharmacy;
        }

        if (existingPharmacy && options.force) {
            await PharmacyInfo.deleteOne({ _id: existingPharmacy._id });
            console.log('🗑️  Deleted existing pharmacy');
        }

        const pharmacy = await PharmacyInfo.create({
            name: pharmacyName,
            slogan: 'Your Health, Our Priority',
            address: {
                street: '123 Medical Avenue',
                city: 'Healthcare City',
                state: 'HC',
                postalCode: '12345',
                country: 'Ghana',
            },
            contact: {
                phone: pharmacyPhone,
                email: pharmacyEmail,
                website: '',
            },
            registrationNumber: 'PHM-12345-REG',
            taxId: 'TAX-67890-ID',
            operatingHours: '8:00 AM - 8:00 PM, Mon-Sat',
            requireSaleShortCode: false,
        });

        console.log(
            `✅ Pharmacy created: ${pharmacy.name} (ID: ${pharmacy._id})`,
        );
        return pharmacy;
    }

    private async setupBranch(
        pharmacy: any,
        options: SetupOptions,
    ): Promise<any> {
        console.log('\n🏢 Setting up default branch...');

        const branchName =
            options.branchName ||
            (await this.question(
                'Enter branch name (or press Enter for "Main Branch"): ',
            )) ||
            'Main Branch';

        // Check if branch already exists
        const existingBranch = await Branch.findOne({
            pharmacyId: pharmacy._id,
        });
        if (existingBranch && !options.force) {
            console.log(`⚠️  Branch already exists: ${existingBranch.name}`);
            return existingBranch;
        }

        if (existingBranch && options.force) {
            await Branch.deleteMany({ pharmacyId: pharmacy._id });
            console.log('🗑️  Deleted existing branches');
        }

        const branch = await Branch.create({
            name: branchName,
            pharmacyId: pharmacy._id,
            address: {
                street: pharmacy.address.street,
                city: pharmacy.address.city,
                state: pharmacy.address.state,
                postalCode: pharmacy.address.postalCode,
                country: pharmacy.address.country,
            },
            contact: {
                phone: pharmacy.contact.phone,
                email: pharmacy.contact.email,
            },
        });

        console.log(`✅ Branch created: ${branch.name} (ID: ${branch._id})`);
        return branch;
    }

    private async setupSuperAdmin(
        pharmacy: any,
        branch: any,
        options: SetupOptions,
    ): Promise<any> {
        console.log('\n👤 Setting up super admin user...');

        const adminName =
            options.adminName || (await this.question('Enter admin name: '));
        const adminEmail =
            options.adminEmail || (await this.question('Enter admin email: '));
        const adminPassword =
            options.adminPassword ||
            (await this.question('Enter admin password: '));

        // Check if super admin already exists
        const existingSuperAdmin = await User.findOne({
            role: UserRole.SUPER_ADMIN,
        });
        if (existingSuperAdmin && !options.force) {
            console.log(
                `⚠️  Super admin already exists: ${existingSuperAdmin.name}`,
            );
            return existingSuperAdmin;
        }

        if (existingSuperAdmin && options.force) {
            await User.deleteMany({ role: UserRole.SUPER_ADMIN });
            console.log('🗑️  Deleted existing super admin users');
        }

        const user = new User({
            name: adminName,
            email: adminEmail.toLowerCase(),
            password: adminPassword, // Will be hashed by pre-save middleware
            role: UserRole.SUPER_ADMIN,
            pharmacyId: pharmacy._id,
            branch: branch._id,
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
        });

        await user.save();

        console.log(`✅ Super admin created: ${user.name} (ID: ${user._id})`);
        return user;
    }

    private async showSystemStatus(): Promise<void> {
        console.log('\n📊 System Status:');
        console.log('━'.repeat(50));

        try {
            const info = await AssignmentService.getAssignmentInfo();

            if (info.pharmacy) {
                console.log(`🏥 Pharmacy: ${info.pharmacy.name}`);
                console.log(`   📧 Email: ${info.pharmacy.contact.email}`);
                console.log(`   📞 Phone: ${info.pharmacy.contact.phone}`);
            } else {
                console.log('🏥 Pharmacy: Not configured');
            }

            console.log(`🏢 Branches: ${info.branches.length} total`);
            info.branches.forEach((branch, index) => {
                console.log(
                    `   ${index + 1}. ${branch.name} (${branch.address.city})`,
                );
            });

            const users = await User.find();
            console.log(`👥 Users: ${users.length} total`);

            const usersByRole = users.reduce(
                (acc, user) => {
                    acc[user.role] = (acc[user.role] || 0) + 1;
                    return acc;
                },
                {} as Record<string, number>,
            );

            Object.entries(usersByRole).forEach(([role, count]) => {
                console.log(`   ${role}: ${count}`);
            });
        } catch (error) {
            console.error('❌ Error checking system status:', error);
        }
    }

    public async run(options: SetupOptions = {}): Promise<void> {
        try {
            console.log('🚀 Pharmacy Management System Setup');
            console.log('━'.repeat(50));

            await this.connectToDatabase();

            // Show current status
            await this.showSystemStatus();

            console.log('\n🔧 Starting setup process...');

            // Setup pharmacy
            const pharmacy = await this.setupPharmacy(options);

            // Setup default branch
            const branch = await this.setupBranch(pharmacy, options);

            // Setup super admin
            const superAdmin = await this.setupSuperAdmin(
                pharmacy,
                branch,
                options,
            );

            console.log('\n🎉 Setup completed successfully!');
            console.log('━'.repeat(50));
            console.log('📋 Summary:');
            console.log(`   🏥 Pharmacy: ${pharmacy.name}`);
            console.log(`   🏢 Branch: ${branch.name}`);
            console.log(
                `   👤 Super Admin: ${superAdmin.name} (${superAdmin.email})`,
            );
            console.log(
                '\n✨ Your pharmacy management system is ready to use!',
            );
            console.log('💡 You can now:');
            console.log('   • Login with super admin credentials');
            console.log('   • Create additional users and branches');
            console.log('   • Add drugs to your inventory');
            console.log('   • Start processing sales');
        } catch (error) {
            console.error('❌ Setup failed:', error);
            throw error;
        } finally {
            await mongoose.disconnect();
            this.rl.close();
        }
    }
}

// Parse command line arguments for non-interactive setup
function parseArgs(): SetupOptions {
    const args = process.argv.slice(2);
    const options: SetupOptions = {};

    for (let i = 0; i < args.length; i += 2) {
        const flag = args[i];
        const value = args[i + 1];

        switch (flag) {
            case '--pharmacy-name':
                options.pharmacyName = value;
                break;
            case '--pharmacy-email':
                options.pharmacyEmail = value;
                break;
            case '--pharmacy-phone':
                options.pharmacyPhone = value;
                break;
            case '--branch-name':
                options.branchName = value;
                break;
            case '--admin-name':
                options.adminName = value;
                break;
            case '--admin-email':
                options.adminEmail = value;
                break;
            case '--admin-password':
                options.adminPassword = value;
                break;
            case '--force':
                options.force = true;
                i--; // No value for this flag
                break;
        }
    }

    return options;
}

// Main execution
if (require.main === module) {
    const options = parseArgs();
    const setup = new SystemSetup();

    setup
        .run(options)
        .then(() => {
            console.log('\n🔌 Database connection closed');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n💥 Setup failed:', error.message);
            process.exit(1);
        });
}

export default SystemSetup;
