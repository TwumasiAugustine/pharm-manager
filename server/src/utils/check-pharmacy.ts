/**
 * Script to check pharmacy setup and create test pharmacy if needed
 */

import mongoose from 'mongoose';
import PharmacyInfo from '../models/pharmacy-info.model';

async function checkAndSetupPharmacy() {
    try {
        console.log('Checking pharmacy setup...');

        // Connect to MongoDB
        await mongoose.connect(
            process.env.MONGODB_URI ||
                'mongodb://localhost:27017/pharmacy-management',
        );

        // Check if pharmacy exists
        const pharmacy = await PharmacyInfo.findOne();

        if (pharmacy) {
            console.log('✅ Pharmacy found:');
            console.log(`   Name: ${pharmacy.name}`);
            console.log(`   ID: ${pharmacy._id}`);
            console.log(
                `   Address: ${pharmacy.address.street}, ${pharmacy.address.city}`,
            );
            console.log(`   Contact: ${pharmacy.contact.phone}`);
        } else {
            console.log('❌ No pharmacy found. Creating a test pharmacy...');

            // Create a test pharmacy
            const testPharmacy = await PharmacyInfo.create({
                name: 'Test Pharmacy',
                slogan: 'Your Health, Our Priority',
                address: {
                    street: '123 Medical Avenue',
                    city: 'Healthcare City',
                    state: 'HC',
                    postalCode: '12345',
                    country: 'Ghana',
                },
                contact: {
                    phone: '+233 XX XXX XXXX',
                    email: 'contact@testpharmacy.com',
                    website: 'www.testpharmacy.com',
                },
                registrationNumber: 'PHM-12345-REG',
                taxId: 'TAX-67890-ID',
                operatingHours: '8:00 AM - 8:00 PM, Mon-Sat',
                requireSaleShortCode: false,
            });

            console.log('✅ Test pharmacy created:');
            console.log(`   Name: ${testPharmacy.name}`);
            console.log(`   ID: ${testPharmacy._id}`);
        }

        await mongoose.disconnect();
        console.log('Database connection closed.');
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

// Run if executed directly
if (require.main === module) {
    checkAndSetupPharmacy();
}

export { checkAndSetupPharmacy };
