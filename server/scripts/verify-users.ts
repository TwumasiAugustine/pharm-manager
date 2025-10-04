#!/usr/bin/env node

/**
 * User Verification Script
 * Checks specific users and their login credentials
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

import User from '../models/user.model';

async function verifyUsers(): Promise<void> {
    try {
        console.log('🔍 Verifying user credentials...');

        if (!process.env.MONGO_URI) {
            throw new Error('MONGO_URI environment variable is required');
        }

        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        const testUsers = [
            { email: 'example@test.com', password: 'example', name: 'Example' },
            {
                email: 'manaspharm@gmail.com',
                password: 'example',
                name: 'Test User',
            },
        ];

        console.log('\n📋 Checking users...');

        for (const testUser of testUsers) {
            console.log(
                `\n👤 Checking user: ${testUser.name} (${testUser.email})`,
            );

            // Find the user by email
            const user = await User.findOne({
                email: testUser.email.toLowerCase(),
            });

            if (!user) {
                console.log('❌ User not found in database');
                continue;
            }

            console.log('✅ User found in database:');
            console.log(`   ID: ${user._id}`);
            console.log(`   Name: ${user.name}`);
            console.log(`   Email: ${user.email}`);
            console.log(`   Role: ${user.role}`);
            console.log(`   Pharmacy ID: ${user.pharmacyId || 'Not set'}`);
            console.log(`   Branch ID: ${user.branch || 'Not set'}`);
            console.log(`   Is First Setup: ${user.isFirstSetup}`);

            // Check if the password matches
            const isPasswordCorrect = await user.comparePassword(
                testUser.password,
            );
            console.log(
                `🔐 Password check: ${isPasswordCorrect ? '✅ CORRECT' : '❌ INCORRECT'}`,
            );

            // Check password hash info
            console.log(
                `🔑 Password hash starts with: ${user.password.substring(0, 20)}...`,
            );
            console.log(`📏 Password hash length: ${user.password.length}`);
        }

        // Also list all users to see what's in the database
        console.log('\n📊 All users in database:');
        const allUsers = await User.find({}).select(
            'name email role pharmacyId branch',
        );

        if (allUsers.length === 0) {
            console.log('❌ No users found in database');
        } else {
            allUsers.forEach((user, index) => {
                console.log(
                    `${index + 1}. ${user.name} (${user.email}) - Role: ${user.role}`,
                );
                console.log(
                    `   ID: ${user._id}, Pharmacy: ${user.pharmacyId || 'None'}, Branch: ${user.branch || 'None'}`,
                );
            });
        }
    } catch (error) {
        console.error('❌ Verification failed:', error);
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
    verifyUsers()
        .then(() => {
            console.log('\n✨ User verification completed');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n💥 User verification failed:', error.message);
            process.exit(1);
        });
}

export default verifyUsers;
