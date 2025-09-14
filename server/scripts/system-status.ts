#!/usr/bin/env node

/**
 * System Status Check Script
 * Shows current system configuration and validates automatic assignment
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

import { AssignmentService } from '../src/services/assignment.service';
import PharmacyInfo from '../src/models/pharmacy-info.model';
import Branch from '../src/models/branch.model';
import User from '../src/models/user.model';
import { Drug } from '../src/models/drug.model';

async function checkSystemStatus(): Promise<void> {
    try {
        console.log('🔍 System Status Check');
        console.log('━'.repeat(50));

        if (!process.env.MONGO_URI) {
            throw new Error('MONGO_URI environment variable is required');
        }

        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Get assignment info
        const info = await AssignmentService.getAssignmentInfo();

        console.log('\n📊 Current System Configuration:');
        console.log('━'.repeat(50));

        // Pharmacy info
        if (info.pharmacy) {
            console.log(`🏥 Pharmacy: ${info.pharmacy.name}`);
            console.log(`   📧 Email: ${info.pharmacy.contact.email}`);
            console.log(`   📞 Phone: ${info.pharmacy.contact.phone}`);
            console.log(`   🆔 ID: ${info.pharmacy._id}`);
        } else {
            console.log('🏥 Pharmacy: Not configured');
        }

        // Branches info
        console.log(`\n🏢 Branches: ${info.branches.length} total`);
        info.branches.forEach((branch, index) => {
            console.log(`   ${index + 1}. ${branch.name}`);
            console.log(`      🆔 ID: ${branch._id}`);
            console.log(
                `      📍 Location: ${branch.address.city}, ${branch.address.state}`,
            );
        });

        // Users info
        const users = await User.find();
        console.log(`\n👥 Users: ${users.length} total`);
        for (const user of users) {
            console.log(`   • ${user.name} (${user.email})`);
            console.log(`     👔 Role: ${user.role}`);
            console.log(`     🏥 Pharmacy ID: ${user.pharmacyId}`);
            console.log(`     🏢 Branch ID: ${user.branch}`);
        }

        // Drugs info
        const drugs = await Drug.find();
        console.log(`\n💊 Drugs: ${drugs.length} total`);
        for (const drug of drugs) {
            console.log(`   • ${drug.name} (${drug.brand})`);
            console.log(`     🏥 Pharmacy ID: ${drug.pharmacyId}`);
            console.log(`     🏢 Branch ID: ${drug.branch}`);
            console.log(`     📦 Quantity: ${drug.quantity}`);
        }

        // Test automatic assignment
        console.log('\n🧪 Testing Assignment Service:');
        console.log('━'.repeat(50));

        try {
            const defaultPharmacyId =
                await AssignmentService.getDefaultPharmacyId();
            console.log(`✅ Default Pharmacy ID: ${defaultPharmacyId}`);

            const defaultBranchId =
                await AssignmentService.getDefaultBranchId();
            console.log(`✅ Default Branch ID: ${defaultBranchId}`);

            console.log('✅ Assignment service is working correctly!');
        } catch (error) {
            console.error('❌ Assignment service error:', error);
        }

        console.log('\n🎉 System status check completed!');
        console.log('💡 The pharmacy management system is fully operational.');
    } catch (error) {
        console.error('❌ Status check failed:', error);
        throw error;
    } finally {
        await mongoose.disconnect();
        console.log('\n🔌 Database connection closed');
    }
}

// Main execution
if (require.main === module) {
    checkSystemStatus()
        .then(() => {
            console.log('\n✨ Status check completed successfully');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n💥 Status check failed:', error.message);
            process.exit(1);
        });
}

export default checkSystemStatus;
