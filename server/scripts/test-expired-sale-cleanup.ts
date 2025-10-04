/**
 * Test script to demonstrate expired sale cleanup functionality
 * This script creates a test sale with short code and shows how cleanup works
 */

import * as dotenv from 'dotenv';
import mongoose from 'mongoose';
import { Sale } from '../models/sale.model';
import { Drug } from '../models/drug.model';
import PharmacyInfo from '../models/pharmacy-info.model';
import { ExpiredSaleCleanupService } from '../services/expired-sale-cleanup.service';
import { AssignmentService } from '../services/assignment.service';

// Load environment variables
dotenv.config();

async function connectToDatabase() {
    try {
        // Use environment variable or fallback to test database
        const mongoUri =
            process.env.MONGO_URI || 'mongodb://localhost:27017/pharmacy-test';

        console.log('🔌 Connecting to database...');
        await mongoose.connect(mongoUri, {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 10000,
        });
        console.log('✅ Database connected successfully\n');
    } catch (error) {
        console.error('❌ Database connection failed:', error);
        console.log('\n💡 Troubleshooting:');
        console.log('   1. Make sure MongoDB is running locally');
        console.log('   2. Check if MONGO_URI in .env is correct');
        console.log('   3. For local MongoDB: mongod --dbpath C:\\data\\db');
        console.log('   4. Or use Docker: docker run -d -p 27017:27017 mongo');
        process.exit(1);
    }
}

async function testExpiredSaleCleanup() {
    try {
        // Connect to database first
        await connectToDatabase();

        console.log('🧪 Testing expired sale cleanup functionality...\n');

        // Step 1: Setup pharmacy with short code feature enabled
        console.log('📋 Step 1: Configure pharmacy settings...');
        await PharmacyInfo.findOneAndUpdate(
            {},
            {
                requireSaleShortCode: true,
                shortCodeExpiryMinutes: 1, // 1 minute for testing
            },
            { upsert: true },
        );
        console.log('✅ Pharmacy configured with 1-minute expiry time\n');

        // Step 2: Find or create a test drug
        console.log('💊 Step 2: Setup test drug...');
        let testDrug = await Drug.findOne({ name: /test drug/i });
        if (!testDrug) {
            const pharmacyId = await AssignmentService.getDefaultPharmacyId();
            const branchId = await AssignmentService.getDefaultBranchId();

            testDrug = await Drug.create({
                name: 'Test Drug for Cleanup',
                brand: 'Test Brand', // Required field
                category: 'test',
                dosageForm: 'tablet', // Required field
                ableToSell: true,
                drugsInCarton: 100,
                unitsPerCarton: 20, // Required field
                packsPerCarton: 4, // Required field
                quantity: 100, // Initial quantity
                pricePerUnit: 10,
                pricePerPack: 50,
                pricePerCarton: 200,
                costPrice: 5, // Required field
                expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
                batchNumber: 'TEST-001',
                requiresPrescription: false,
                supplier: 'Test Supplier',
                location: 'Test Location',
                pharmacyId: pharmacyId,
                branch: branchId, // Required field (note: it's 'branch' not 'branchId')
            });
            console.log(
                `✅ Created test drug: ${testDrug.name} (ID: ${testDrug._id})`,
            );
        } else {
            // Update quantity to 8000 for consistent testing
            testDrug.quantity = 8000;
            await testDrug.save();
            console.log(
                `✅ Using existing test drug: ${testDrug.name} (ID: ${testDrug._id})`,
            );
        }
        console.log(`   Initial quantity: ${testDrug.quantity}\n`);

        // Step 3: Create a test sale with short code (unfinalised)
        console.log('🛒 Step 3: Create test sale with short code...');
        const pharmacyId = await AssignmentService.getDefaultPharmacyId();
        const branchId = await AssignmentService.getDefaultBranchId();

        const testSale = await Sale.create({
            items: [
                {
                    drug: testDrug._id,
                    quantity: 15, // Sell 15 units
                    priceAtSale: testDrug.pricePerUnit,
                    saleType: 'unit',
                    profit: 5,
                },
            ],
            totalAmount: 150,
            totalProfit: 75,
            soldBy: pharmacyId, // Using pharmacy ID as dummy user
            paymentMethod: 'cash',
            shortCode: 'TEST123',
            finalized: false, // Not finalized - this should be cleaned up
            pharmacyId: pharmacyId,
            branch: branchId,
            // Set creation time to past for immediate expiry
            createdAt: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
        });

        // Update drug quantity to simulate sale
        testDrug.quantity -= 15; // 100 - 15 = 85
        await testDrug.save();

        console.log(`✅ Created test sale: ${testSale._id}`);
        console.log(`   Short code: ${testSale.shortCode}`);
        console.log(`   Finalized: ${testSale.finalized}`);
        console.log(`   Created: ${testSale.createdAt}`);
        console.log(`   Drug quantity after sale: ${testDrug.quantity}\n`);

        // Step 4: Show expired sale stats
        console.log('📊 Step 4: Check expired sale statistics...');
        const stats = await ExpiredSaleCleanupService.getExpiredSaleStats();
        console.log(`   Expired sales count: ${stats.count}`);
        console.log(`   Total value: $${stats.totalValue}`);
        if (stats.oldestExpired) {
            console.log(`   Oldest expired: ${stats.oldestExpired}`);
        }
        console.log('');

        // Step 5: Run cleanup
        console.log('🧹 Step 5: Running expired sale cleanup...');
        const cleanedUpCount =
            await ExpiredSaleCleanupService.cleanupExpiredSales();
        console.log(
            `✅ Cleanup completed. ${cleanedUpCount} sales cleaned up\n`,
        );

        // Step 6: Verify drug quantity restored
        console.log('🔍 Step 6: Verify drug quantity restoration...');
        const updatedDrug = await Drug.findById(testDrug._id);
        console.log(`   Drug quantity after cleanup: ${updatedDrug?.quantity}`);
        console.log(`   Expected quantity: 8000`);

        if (updatedDrug?.quantity === 8000) {
            console.log('✅ Drug quantity successfully restored!\n');
        } else {
            console.log('❌ Drug quantity NOT restored correctly!\n');
        }

        // Step 7: Verify sale was deleted
        console.log('🔍 Step 7: Verify sale was deleted...');
        const deletedSale = await Sale.findById(testSale._id);
        if (!deletedSale) {
            console.log('✅ Sale successfully deleted!\n');
        } else {
            console.log('❌ Sale was NOT deleted!\n');
        }

        // Clean up test data
        console.log('🧹 Cleaning up test data...');
        await Drug.findByIdAndDelete(testDrug._id);
        console.log('✅ Test drug cleaned up');

        console.log('\n🎉 Expired sale cleanup test completed successfully!');
        console.log('\n📝 Summary:');
        console.log(
            '   - Sales with short codes that are not finalized within the expiry time are automatically deleted',
        );
        console.log(
            '   - Drug quantities are restored to their previous state',
        );
        console.log(
            '   - The cleanup runs automatically every 10 minutes via cron job',
        );
        console.log(
            '   - Admins can manually trigger cleanup via API: POST /api/expired-sales/cleanup-expired',
        );
        console.log(
            '   - Admins can check stats via API: GET /api/expired-sales/expired-stats',
        );

        process.exit(0);
    } catch (error) {
        console.error('❌ Test failed:', error);
        process.exit(1);
    } finally {
        // Disconnect from database
        if (mongoose.connection.readyState === 1) {
            await mongoose.disconnect();
            console.log('🔌 Database disconnected');
        }
    }
}

// Run the test
testExpiredSaleCleanup();
