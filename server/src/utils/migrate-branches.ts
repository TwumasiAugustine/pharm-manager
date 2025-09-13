/**
 * Migration script to associate existing branches with pharmacy
 * Run this once when deploying the pharmacy-branch relationship feature
 */

import mongoose from 'mongoose';
import Branch from '../models/branch.model';
import PharmacyInfo from '../models/pharmacy-info.model';

export async function migrateBranchesToPharmacy() {
    try {
        console.log('Starting branch migration to pharmacy association...');

        // Get the pharmacy info
        const pharmacy = await PharmacyInfo.findOne();
        if (!pharmacy) {
            console.log(
                'No pharmacy found. Please set up pharmacy information first.',
            );
            return;
        }

        // Find all branches without pharmacyId
        const branchesWithoutPharmacy = await Branch.find({
            $or: [{ pharmacyId: { $exists: false } }, { pharmacyId: null }],
        });

        if (branchesWithoutPharmacy.length === 0) {
            console.log('All branches are already associated with pharmacy.');
            return;
        }

        console.log(
            `Found ${branchesWithoutPharmacy.length} branches to migrate`,
        );

        // Update all branches to include pharmacyId
        const updateResult = await Branch.updateMany(
            {
                $or: [{ pharmacyId: { $exists: false } }, { pharmacyId: null }],
            },
            {
                $set: { pharmacyId: pharmacy._id },
            },
        );

        console.log(
            `Successfully migrated ${updateResult.modifiedCount} branches to pharmacy ${pharmacy.name}`,
        );
        console.log('Branch migration completed successfully!');
    } catch (error) {
        console.error('Error during branch migration:', error);
        throw error;
    }
}

// Function to run migration if this file is executed directly
if (require.main === module) {
    async function runMigration() {
        try {
            // Connect to MongoDB (adjust connection string as needed)
            await mongoose.connect(
                process.env.MONGODB_URI ||
                    'mongodb://localhost:27017/pharmacy-management',
            );

            await migrateBranchesToPharmacy();

            await mongoose.disconnect();
            console.log('Migration completed and database connection closed.');
        } catch (error) {
            console.error('Migration failed:', error);
            process.exit(1);
        }
    }

    runMigration();
}
