#!/usr/bin/env node

/**
 * Password Reset Script
 * Resets a user's password to a new value
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

import User from '../src/models/user.model';

async function resetPassword(
    email: string,
    newPassword: string,
): Promise<void> {
    try {
        console.log('🔄 Resetting password for user...');
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

        // Update the password - this will trigger the pre-save hook to hash it
        user.password = newPassword;
        await user.save();

        console.log('\n🔐 Password Reset Result:');
        console.log('✅ Password has been successfully reset!');
        console.log(`🔑 New password: "${newPassword}"`);

        // Verify the password was set correctly
        const isPasswordCorrect = await user.comparePassword(newPassword);
        console.log(
            `✅ Password verification: ${isPasswordCorrect ? 'PASSED' : 'FAILED'}`,
        );
    } catch (error) {
        console.error('❌ Password reset failed:', error);
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
    const newPassword = 'example';

    resetPassword(email, newPassword)
        .then(() => {
            console.log('\n✨ Password reset completed');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n💥 Password reset failed:', error.message);
            process.exit(1);
        });
}

export default resetPassword;
