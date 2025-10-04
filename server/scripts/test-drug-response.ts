#!/usr/bin/env node

/**
 * Test Drug Response Format
 * Tests if the updated mapDrugToResponse includes branchId field
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

import { Drug } from '../models/drug.model';
import { DrugService } from '../services/drug.service';
import { UserRole } from '../src/types/user.types';

async function testDrugResponseFormat(): Promise<void> {
    try {
        console.log('🧪 Testing drug response format...');

        if (!process.env.MONGO_URI) {
            throw new Error('MONGO_URI environment variable is required');
        }

        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        const drugService = new DrugService();

        // Find an existing drug
        const existingDrug = await Drug.findOne();
        if (!existingDrug) {
            console.log('❌ No existing drugs found to test');
            return;
        }

        console.log('📦 Testing response format for drug:');
        console.log(`   ID: ${existingDrug._id}`);
        console.log(`   Name: ${existingDrug.name}`);
        console.log(`   Raw branch field: ${existingDrug.branch}`);

        // Test getDrugById (this uses mapDrugToResponse internally)
        const drugFromService = await drugService.getDrugById(
            (existingDrug._id as any).toString(),
            UserRole.SUPER_ADMIN,
        );

        console.log('\n📋 Service response format:');
        console.log('Raw drug from service:');
        console.log(JSON.stringify(drugFromService, null, 2));

        // Test the private method indirectly by checking if response has branchId
        console.log('\n🔍 Checking for required fields:');
        console.log(`✅ Has id: ${drugFromService.id ? 'YES' : 'NO'}`);
        console.log(`✅ Has name: ${drugFromService.name ? 'YES' : 'NO'}`);
        console.log(`✅ Has branch: ${drugFromService.branch ? 'YES' : 'NO'}`);
        console.log(
            `✅ Has branchId: ${(drugFromService as any).branchId ? 'YES' : 'NO'}`,
        );

        if ((drugFromService as any).branchId) {
            console.log(
                `   branchId value: ${(drugFromService as any).branchId}`,
            );
        }

        // Test update response format
        console.log('\n🔄 Testing update response format...');
        const updateResult = await drugService.updateDrug(
            (existingDrug._id as any).toString(),
            { supplier: 'Response Format Test Supplier' },
            UserRole.SUPER_ADMIN,
        );

        console.log('Update response format:');
        console.log(`✅ Update has id: ${updateResult.id ? 'YES' : 'NO'}`);
        console.log(
            `✅ Update has branch: ${updateResult.branch ? 'YES' : 'NO'}`,
        );
        console.log(
            `✅ Update has branchId: ${(updateResult as any).branchId ? 'YES' : 'NO'}`,
        );

        if ((updateResult as any).branchId) {
            console.log(
                `   Update branchId value: ${(updateResult as any).branchId}`,
            );
        }
    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\n🔌 Database connection closed');
    }
}

// Main execution
if (require.main === module) {
    testDrugResponseFormat()
        .then(() => {
            console.log('\n✨ Response format test completed');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n💥 Response format test failed:', error.message);
            process.exit(1);
        });
}

export default testDrugResponseFormat;
