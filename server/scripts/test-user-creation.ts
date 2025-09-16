#!/usr/bin/env node

/**
 * Test User Creation Script
 * Tests creating a new user and verifying the password works
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

import User from '../src/models/user.model';
import { UserService } from '../src/services/user.service';
import { UserRole } from '../src/types/user.types';

async function testUserCreation(): Promise<void> {
    try {
        console.log('🧪 Testing user creation...');

        if (!process.env.MONGO_URI) {
            throw new Error('MONGO_URI environment variable is required');
        }

        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Test user data
        const testUserData = {
            name: 'Password Test User',
            email: 'passwordtest@example.com',
            password: 'testpassword123',
            role: UserRole.CASHIER,
            branchId: '68c6e7d8ddd767160c288c7e', // Use existing branch ID
        };

        console.log('👤 Creating test user...');
        console.log(`   Name: ${testUserData.name}`);
        console.log(`   Email: ${testUserData.email}`);
        console.log(`   Password: ${testUserData.password}`);
        console.log(`   Role: ${testUserData.role}`);

        // Delete user if it already exists
        await User.deleteOne({ email: testUserData.email.toLowerCase() });

        // Create user using the service
        const userService = new UserService();
        const adminPharmacyId = '68c6e7d6ddd767160c288c73'; // Use existing pharmacy ID

        const createdUser = await userService.createUser(
            testUserData,
            adminPharmacyId,
        );

        console.log('\n✅ User created successfully!');
        console.log(`   ID: ${createdUser._id}`);
        console.log(`   Name: ${createdUser.name}`);
        console.log(`   Email: ${createdUser.email}`);

        // Now test the password
        console.log('\n🔐 Testing password...');
        const user = await User.findById(createdUser._id);

        if (!user) {
            console.log('❌ User not found after creation');
            return;
        }

        const isPasswordCorrect = await user.comparePassword(
            testUserData.password,
        );
        console.log(
            `Password verification: ${isPasswordCorrect ? '✅ CORRECT' : '❌ INCORRECT'}`,
        );

        // Test with wrong password
        const isWrongPasswordCorrect =
            await user.comparePassword('wrongpassword');
        console.log(
            `Wrong password test: ${isWrongPasswordCorrect ? '❌ FAILED (should be false)' : '✅ PASSED (correctly rejected)'}`,
        );

        // Clean up - delete the test user
        await User.deleteOne({ _id: createdUser._id });
        console.log('\n🧹 Test user deleted');
    } catch (error) {
        console.error('❌ Test failed:', error);
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
    testUserCreation()
        .then(() => {
            console.log('\n✨ User creation test completed');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n💥 User creation test failed:', error.message);
            process.exit(1);
        });
}

export default testUserCreation;
