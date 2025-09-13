/**
 * Script to verify branch-pharmacy associations
 */

import mongoose from 'mongoose';
import Branch from '../models/branch.model';
import PharmacyInfo from '../models/pharmacy-info.model';

async function verifyBranchAssociations() {
    try {
        console.log('🔍 Verifying branch-pharmacy associations...');

        // Connect to MongoDB
        await mongoose.connect(
            process.env.MONGODB_URI ||
                'mongodb://localhost:27017/pharmacy-management',
        );

        // Get pharmacy info
        const pharmacy = await PharmacyInfo.findOne();
        if (!pharmacy) {
            console.log('❌ No pharmacy found!');
            return;
        }

        console.log(`✅ Pharmacy: ${pharmacy.name} (ID: ${pharmacy._id})`);

        // Get all branches
        const allBranches = await Branch.find();
        console.log(`📍 Total branches in database: ${allBranches.length}`);

        // Get branches associated with this pharmacy
        const pharmacyBranches = await Branch.find({
            pharmacyId: pharmacy._id,
        });
        console.log(
            `🏢 Branches associated with pharmacy: ${pharmacyBranches.length}`,
        );

        // Get branches without pharmacy association
        const orphanBranches = await Branch.find({
            $or: [{ pharmacyId: { $exists: false } }, { pharmacyId: null }],
        });
        console.log(
            `⚠️  Branches without pharmacy association: ${orphanBranches.length}`,
        );

        if (pharmacyBranches.length > 0) {
            console.log('\n📋 Associated branches:');
            pharmacyBranches.forEach((branch, index) => {
                console.log(
                    `   ${index + 1}. ${branch.name} (${branch.address.city})`,
                );
            });
        }

        if (orphanBranches.length > 0) {
            console.log('\n⚠️  Orphan branches (need migration):');
            orphanBranches.forEach((branch, index) => {
                console.log(
                    `   ${index + 1}. ${branch.name} (${branch.address.city})`,
                );
            });
        }

        console.log('\n✅ Verification completed!');

        if (
            orphanBranches.length === 0 &&
            allBranches.length === pharmacyBranches.length
        ) {
            console.log(
                '🎉 All branches are properly associated with the pharmacy!',
            );
        }

        await mongoose.disconnect();
        console.log('Database connection closed.');
    } catch (error) {
        console.error('Error during verification:', error);
        process.exit(1);
    }
}

// Run if executed directly
if (require.main === module) {
    verifyBranchAssociations();
}

export { verifyBranchAssociations };
