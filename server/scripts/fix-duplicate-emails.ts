const mongoose = require('mongoose');
const Customer = require('../models/customer.model').default;
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

async function fixDuplicateEmails() {
    try {
        // Connect to MongoDB
        const mongoUri =
            process.env.MONGO_URI || 'mongodb://localhost:27017/pharm-manager';
        await mongoose.connect(mongoUri);
        console.log('Connected to MongoDB');

        // Find all customers with empty email strings
        const customersWithEmptyEmail = await Customer.find({ email: '' });
        console.log(
            `Found ${customersWithEmptyEmail.length} customers with empty email strings`,
        );

        // Update all customers with empty email strings to have undefined email
        const result = await Customer.updateMany(
            { email: '' },
            { $unset: { email: 1 } }, // Remove the email field entirely
        );

        console.log(`Updated ${result.modifiedCount} customers`);
        console.log('Duplicate email issue fixed!');

        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('Error fixing duplicate emails:', error);
        process.exit(1);
    }
}

fixDuplicateEmails();
