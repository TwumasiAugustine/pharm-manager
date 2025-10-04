#!/usr/bin/env node

/**
 * API Endpoint Test Script
 * Tests the drug update API endpoint directly
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import jwt from 'jsonwebtoken';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

import { Drug } from '../models/drug.model';
import User from '../models/user.model';
import { UserRole } from '../src/types/user.types';

async function testDrugUpdateAPI(): Promise<void> {
    try {
        console.log('🧪 Testing drug update API endpoint...');

        if (!process.env.MONGO_URI) {
            throw new Error('MONGO_URI environment variable is required');
        }

        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Find an existing drug and super admin user
        const existingDrug = await Drug.findOne();
        const superAdmin = await User.findOne({ role: UserRole.SUPER_ADMIN });

        if (!existingDrug) {
            console.log('❌ No existing drugs found to test update');
            return;
        }

        if (!superAdmin) {
            console.log('❌ No super admin user found');
            return;
        }

        console.log('📦 Found existing drug to update:');
        console.log(`   ID: ${existingDrug._id}`);
        console.log(`   Name: ${existingDrug.name}`);
        console.log(`   Quantity: ${existingDrug.quantity}`);

        console.log('👤 Found super admin user:');
        console.log(`   ID: ${superAdmin._id}`);
        console.log(`   Email: ${superAdmin.email}`);

        // Generate JWT token for authentication
        const token = jwt.sign(
            {
                id: superAdmin._id,
                email: superAdmin.email,
                role: superAdmin.role,
                branchId: superAdmin.branch,
            },
            process.env.JWT_SECRET!,
            { expiresIn: '1h' },
        );

        console.log('\n🔑 Generated JWT token for API testing');

        // Test data for update
        const updateData = {
            quantity: existingDrug.quantity + 200,
            costPrice: 3.5,
            pricePerUnit: 4.0,
            supplier: 'API Test Supplier',
        };

        console.log('\n🌐 Making API request...');
        console.log('Update data:', updateData);

        // Make HTTP request to the update endpoint
        const response = await fetch(
            `http://localhost:5000/api/drugs/${existingDrug._id}`,
            {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(updateData),
            },
        );

        console.log(`📡 Response status: ${response.status}`);
        console.log(`📡 Response status text: ${response.statusText}`);

        const responseBody = await response.text();
        console.log('\n📄 Response body:');
        console.log(responseBody);

        if (response.ok) {
            console.log('\n✅ API update request successful!');

            try {
                const jsonResponse = JSON.parse(responseBody);
                if (jsonResponse.data && jsonResponse.data.drug) {
                    const updatedDrug = jsonResponse.data.drug;
                    console.log('Updated drug from API:');
                    console.log(`   Quantity: ${updatedDrug.quantity}`);
                    console.log(`   Cost Price: ${updatedDrug.costPrice}`);
                    console.log(
                        `   Price Per Unit: ${updatedDrug.pricePerUnit}`,
                    );
                    console.log(`   Supplier: ${updatedDrug.supplier}`);
                }
            } catch (parseError) {
                console.log('⚠️  Could not parse JSON response');
            }
        } else {
            console.log('\n❌ API update request failed!');
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
    testDrugUpdateAPI()
        .then(() => {
            console.log('\n✨ API update test completed');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n💥 API update test failed:', error.message);
            process.exit(1);
        });
}

export default testDrugUpdateAPI;
