#!/usr/bin/env node

/**
 * Reset Multiple Users Password Script
 * Resets passwords for multiple users
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

import User from '../models/user.model';

async function resetMultiplePasswords(): Promise<void> {
    try {
        console.log('🔄 Resetting passwords for multiple users...');

        if (!process.env.MONGO_URI) {
            throw new Error('MONGO_URI environment variable is required');
        }

        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Read list from CLI JSON file or environment variable
        const args = process.argv.slice(2);
        let usersToReset: Array<{ email: string; newPassword: string }> = [];

        if (args[0]) {
            // Expect a path to a JSON file containing [{ email, newPassword }, ...]
            const filePath = args[0];
            const raw = require('fs').readFileSync(filePath, 'utf8');
            usersToReset = JSON.parse(raw) as Array<{
                email: string;
                newPassword: string;
            }>;
        } else if (process.env.RESET_USERS_JSON) {
            usersToReset = JSON.parse(process.env.RESET_USERS_JSON!);
        } else {
            console.log(
                'No users specified. Provide a JSON file path as the first argument or set RESET_USERS_JSON env var.',
            );
            return;
        }

        for (const userInfo of usersToReset) {
            console.log(`\n👤 Resetting password for: ${userInfo.email}`);

            // Find the user by email
            const user = await User.findOne({
                email: userInfo.email.toLowerCase(),
            });

            if (!user) {
                console.log('❌ User not found');
                continue;
            }

            console.log(`✅ Found user: ${user.name}`);

            // Update the password - this will trigger the pre-save hook to hash it
            user.password = userInfo.newPassword;
            await user.save();

            console.log('🔐 Password reset successful!');

            // Verify the password was set correctly
            const isPasswordCorrect = await user.comparePassword(
                userInfo.newPassword,
            );
            console.log(
                `✅ Password verification: ${isPasswordCorrect ? 'PASSED' : 'FAILED'}`,
            );
        }
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
    resetMultiplePasswords()
        .then(() => {
            console.log('\n✨ Multiple password reset completed');
            process.exit(0);
        })
        .catch((error) => {
            console.error(
                '\n💥 Multiple password reset failed:',
                error.message,
            );
            process.exit(1);
        });
}

export default resetMultiplePasswords;
