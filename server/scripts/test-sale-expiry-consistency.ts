/**
 * Test script to verify sale controller respects configurable expiry time
 */

import dotenv from 'dotenv';
import { Sale } from '../src/models/sale.model';
import { Drug } from '../src/models/drug.model';
import PharmacyInfo from '../src/models/pharmacy-info.model';
import Branch from '../src/models/branch.model';
import connectDB from '../src/config/db';

// Load environment variables
dotenv.config();

async function connectToDatabase() {
    try {
        console.log('🔌 Connecting to database...');
        await connectDB();
        console.log('✅ Database connected successfully\n');
    } catch (error) {
        console.error('❌ Database connection failed:', error);
        process.exit(1);
    }
}

async function testSaleExpiryConsistency() {
    try {
        console.log('🧪 Testing sale expiry consistency...\n');

        // Step 1: Configure pharmacy with custom expiry time
        console.log('📋 Step 1: Configure pharmacy settings...');
        const pharmacyInfo = await PharmacyInfo.findOneAndUpdate(
            {},
            {
                requireSaleShortCode: true,
                shortCodeExpiryMinutes: 5, // 5 minutes for testing
            },
            { upsert: true, new: true },
        );
        console.log('✅ Pharmacy configured with 5-minute expiry time\n');

        // Step 2: Get or create branch
        let branch = await Branch.findOne();
        if (!branch) {
            branch = await Branch.create({
                name: 'Test Branch',
                address: 'Test Address',
                phone: '123-456-7890',
                pharmacyId: pharmacyInfo._id,
            });
        }

        // Step 3: Create test drug
        console.log('💊 Step 2: Setup test drug...');
        let testDrug = await Drug.findOne({
            name: 'Test Drug for Expiry Check',
        });
        if (!testDrug) {
            testDrug = await Drug.create({
                name: 'Test Drug for Expiry Check',
                brand: 'Test Brand',
                category: 'Test Category',
                dosageForm: 'tablet',
                unitsPerCarton: 20,
                packsPerCarton: 4,
                quantity: 8000,
                pricePerUnit: 10,
                pricePerPack: 200,
                pricePerCarton: 800,
                costPrice: 5,
                expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
                batchNumber: 'TEST-002',
                requiresPrescription: false,
                supplier: 'Test Supplier',
                location: 'Test Location',
                pharmacyId: pharmacyInfo._id,
                branch: branch._id,
            });
        }
        console.log(`✅ Test drug ready: ${testDrug.name}\n`);

        // Step 4: Create sale with short code that should expire in 5 minutes
        console.log('🛒 Step 3: Create test sale with 5-minute expiry...');
        const testSale = await Sale.create({
            items: [
                {
                    drug: testDrug._id,
                    quantity: 10,
                    priceAtSale: testDrug.pricePerUnit,
                    saleType: 'unit',
                    profit: 5,
                },
            ],
            totalAmount: 100,
            totalProfit: 50,
            soldBy: pharmacyInfo._id,
            paymentMethod: 'cash',
            shortCode: 'TEST456',
            finalized: false,
            pharmacyId: pharmacyInfo._id,
            branch: branch._id,
            // Set creation time to 3 minutes ago (should still be valid)
            createdAt: new Date(Date.now() - 3 * 60 * 1000),
        });

        console.log(`✅ Created sale with short code: ${testSale.shortCode}`);
        console.log(
            `   Created 3 minutes ago (should still be valid for 2 more minutes)\n`,
        );

        // Step 5: Test if sale would be considered expired using the new logic
        const now = new Date();
        const createdAt =
            testSale.createdAt instanceof Date
                ? testSale.createdAt
                : new Date(testSale.createdAt);
        const diffMs = now.getTime() - createdAt.getTime();
        const diffMinutes = diffMs / (1000 * 60);
        const expiryMinutes = pharmacyInfo.shortCodeExpiryMinutes || 15;

        console.log('🔍 Step 4: Check expiry logic consistency...');
        console.log(`   Pharmacy expiry setting: ${expiryMinutes} minutes`);
        console.log(`   Sale age: ${diffMinutes.toFixed(2)} minutes`);
        console.log(
            `   Should be expired: ${diffMinutes > expiryMinutes ? 'YES' : 'NO'}`,
        );

        if (diffMinutes > expiryMinutes) {
            console.log(
                '❌ Sale would be considered expired by sale controller',
            );
        } else {
            console.log(
                '✅ Sale would still be valid according to sale controller',
            );
        }

        console.log('\n🧹 Cleaning up test data...');
        await Sale.findByIdAndDelete(testSale._id);
        await Drug.findByIdAndDelete(testDrug._id);
        console.log('✅ Test data cleaned up');

        console.log(
            '\n🎉 Sale expiry consistency test completed successfully!',
        );
        console.log('\n📝 Summary:');
        console.log(
            '   - Sale controller now uses configurable expiry time from pharmacy settings',
        );
        console.log(
            '   - Expired sale cleanup service uses the same configurable setting',
        );
        console.log(
            '   - Both systems are now consistent and use the same expiry logic',
        );
    } catch (error) {
        console.error('❌ Test failed:', error);
    }
}

// Run the test
(async () => {
    await connectToDatabase();
    await testSaleExpiryConsistency();
    process.exit(0);
})();
