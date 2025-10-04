#!/usr/bin/env node

/**
 * Drug Update Test Script
 * Tests the drug update functionality to identify issues
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

import { Drug } from '../models/drug.model';
import { DrugService } from '../services/drug.service';
import { UserRole } from '../types/auth.types';

async function testDrugUpdate(): Promise<void> {
    try {
        console.log('🧪 Testing drug update functionality...');

        if (!process.env.MONGO_URI) {
            throw new Error('MONGO_URI environment variable is required');
        }

        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        const drugService = new DrugService();

        // First, find an existing drug to update
        const existingDrug = await Drug.findOne();
        if (!existingDrug) {
            console.log('❌ No existing drugs found to test update');
            return;
        }

        console.log('📦 Found existing drug to update:');
        console.log(`   ID: ${existingDrug._id}`);
        console.log(`   Name: ${existingDrug.name}`);
        console.log(`   Brand: ${existingDrug.brand}`);
        console.log(`   Quantity: ${existingDrug.quantity}`);
        console.log(`   Branch: ${existingDrug.branch}`);
        console.log(`   Pharmacy ID: ${existingDrug.pharmacyId}`);

        // Test update data
        const updateData = {
            quantity: existingDrug.quantity + 100,
            costPrice: 2.5,
            pricePerUnit: 3.0,
            supplier: 'Updated Test Supplier',
        };

        console.log('\n🔄 Attempting to update drug...');
        console.log('Update data:', updateData);

        try {
            const updatedDrug = await drugService.updateDrug(
                (existingDrug._id as any).toString(),
                updateData,
                UserRole.SUPER_ADMIN,
                (existingDrug.branch as any).toString(),
            );

            console.log('\n✅ Drug updated successfully!');
            console.log('Updated drug details:');
            console.log(`   ID: ${updatedDrug._id}`);
            console.log(`   Name: ${updatedDrug.name}`);
            console.log(`   Brand: ${updatedDrug.brand}`);
            console.log(`   Quantity: ${updatedDrug.quantity}`);
            console.log(`   Cost Price: ${updatedDrug.costPrice}`);
            console.log(`   Price Per Unit: ${updatedDrug.pricePerUnit}`);
            console.log(`   Supplier: ${updatedDrug.supplier}`);
            console.log(`   Branch: ${updatedDrug.branch}`);
            console.log(`   Pharmacy ID: ${updatedDrug.pharmacyId}`);
        } catch (updateError) {
            console.error('❌ Drug update failed:', updateError);

            // Additional debugging
            console.log('\n🔍 Debug information:');
            console.log('User role:', UserRole.SUPER_ADMIN);
            console.log('Drug ID:', (existingDrug._id as any).toString());
            console.log(
                'User branch ID:',
                (existingDrug.branch as any).toString(),
            );

            if (updateError instanceof Error) {
                console.log('Error message:', updateError.message);
                console.log('Error stack:', updateError.stack);
            }
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
    testDrugUpdate()
        .then(() => {
            console.log('\n✨ Drug update test completed');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n💥 Drug update test failed:', error.message);
            process.exit(1);
        });
}

export default testDrugUpdate;
