#!/usr/bin/env node

/**
 * Test Drug Creation Script
 * Tests the drug creation functionality with automatic pharmacy and branch assignment
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

import { DrugService } from '../services/drug.service';
import { UserRole } from '../types/auth.types';
import { ICreateDrugRequest } from '../types/drug.types';

async function testDrugCreation() {
    try {
        console.log('🧪 Testing drug creation with automatic assignment...');

        // Connect to database
        if (!process.env.MONGO_URI) {
            throw new Error('MONGO_URI environment variable is required');
        }

        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 30000,
        });

        console.log('✅ Connected to MongoDB successfully');

        // Create drug service instance
        const drugService = new DrugService();

        // Test drug data
        const testDrugData: ICreateDrugRequest = {
            name: 'Test Paracetamol',
            brand: 'TestBrand',
            category: 'Analgesics',
            dosageForm: 'tablet',
            ableToSell: true,
            drugsInCarton: 100,
            unitsPerCarton: 10,
            packsPerCarton: 10,
            quantity: 1000,
            pricePerUnit: 1.5,
            pricePerPack: 15.0,
            pricePerCarton: 150.0,
            expiryDate: new Date('2025-12-31'),
            batchNumber: 'TEST001',
            requiresPrescription: false,
            supplier: 'Test Supplier',
            location: 'A1-001',
            costPrice: 1.0,
            // Note: no branchId provided - should auto-assign
        };

        console.log('\n📦 Creating test drug...');
        console.log('Drug data:', {
            name: testDrugData.name,
            brand: testDrugData.brand,
            batchNumber: testDrugData.batchNumber,
            quantity: testDrugData.quantity,
            branchId: testDrugData.branchId || 'AUTO-ASSIGN',
        });

        // Create drug as super admin (no branch restriction)
        const createdDrug = await drugService.createDrug(
            testDrugData,
            UserRole.SUPER_ADMIN,
        );

        console.log('\n✅ Drug created successfully!');
        console.log('Created drug details:');
        console.log(`   ID: ${createdDrug._id}`);
        console.log(`   Name: ${createdDrug.name}`);
        console.log(`   Brand: ${createdDrug.brand}`);
        console.log(`   Batch Number: ${createdDrug.batchNumber}`);
        console.log(`   Quantity: ${createdDrug.quantity}`);
        console.log(`   Pharmacy ID: ${createdDrug.pharmacyId}`);
        console.log(`   Branch ID: ${createdDrug.branch}`);
        console.log(`   Cost Price: ${createdDrug.costPrice}`);
        console.log(`   Price Per Unit: ${createdDrug.pricePerUnit}`);
    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\n🔌 Database connection closed');
    }
}

// Run test if executed directly
if (require.main === module) {
    testDrugCreation()
        .then(() => {
            console.log('\n🎉 Test completed successfully!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n💥 Test failed:', error.message);
            process.exit(1);
        });
}

export default testDrugCreation;
