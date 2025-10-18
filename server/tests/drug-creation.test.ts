// Test script to verify the drug creation functionality
// This would be run to ensure the new many-to-many relationship works

import { DrugService } from '../services/drug.service';
import { UserRole } from '../types/user.types';

async function testDrugCreation() {
    const drugService = new DrugService();

    // Test data for a new drug
    const testDrugData = {
        name: 'Test Drug',
        brand: 'Test Brand',
        category: 'Pain Relief',
        dosageForm: 'tablet',
        ableToSell: true,
        drugsInCarton: 100,
        unitsPerCarton: 20,
        packsPerCarton: 5,
        quantity: 100,
        pricePerUnit: 5.0,
        pricePerPack: 100.0,
        pricePerCarton: 500.0,
        expiryDate: new Date('2025-12-31'),
        batchNumber: 'TEST001',
        requiresPrescription: false,
        costPrice: 2.5,
        selectedBranches: ['branch1_id', 'branch2_id'], // Multi-branch selection
    };

    try {
        // Test creating a drug with multiple branch associations
        console.log('Testing drug creation with multiple branches...');
        const createdDrug = await drugService.createDrug(
            testDrugData,
            UserRole.ADMIN,
            undefined,
            'pharmacy_id',
        );

        console.log('✅ Drug created successfully:', createdDrug);
        console.log('✅ Should have associations with multiple branches');

        return createdDrug;
    } catch (error) {
        console.error('❌ Error creating drug:', error);
        throw error;
    }
}

// Export for testing
export { testDrugCreation };
