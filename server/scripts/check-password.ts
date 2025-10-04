#!/usr/bin/env node

/**
 * Password Check Script
 * Checks if a user's password matches the provided password
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

import User from '../models/user.model';

async function checkPassword(
    email: string,
    passwordToCheck: string,
): Promise<void> {
    try {
        console.log('🔍 Checking password for user...');
        console.log(`📧 Email: ${email}`);

        if (!process.env.MONGO_URI) {
            throw new Error('MONGO_URI environment variable is required');
        }

        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Find the user by email
        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            console.log('❌ User not found with this email');
            return;
        }

        console.log('👤 Found user:');
        console.log(`   ID: ${user._id}`);
        console.log(`   Name: ${user.name}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Role: ${user.role}`);

        // Check if the password matches
        const isPasswordCorrect = await user.comparePassword(passwordToCheck);

        console.log('\n🔐 Password Check Result:');
        if (isPasswordCorrect) {
            console.log(
                '✅ Password matches! The provided password is correct.',
            );
        } else {
            console.log(
                '❌ Password does not match. The provided password is incorrect.',
            );
        }
    } catch (error) {
        console.error('❌ Password check failed:', error);
        if (error instanceof Error) {
            console.error('Error details:', error.message);
        }
    } finally {
        await mongoose.disconnect();
        console.log('\n🔌 Database connection closed');
    }
}

// Main execution
if (require.main === module) {
    const email = 'superadmin@medicare.com';
    const passwordToCheck = 'example';

    checkPassword(email, passwordToCheck)
        .then(() => {
            console.log('\n✨ Password check completed');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n💥 Password check failed:', error.message);
            process.exit(1);
        });
}

export default checkPassword;
