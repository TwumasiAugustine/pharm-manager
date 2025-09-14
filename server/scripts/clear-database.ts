#!/usr/bin/env node

/**
 * Database Clearing Script
 * Completely clears all collections in the database
 * Use with caution - this will delete ALL data!
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

async function clearDatabase(): Promise<void> {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error('MONGO_URI environment variable is required');
        }

        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 30000,
        });

        console.log('✅ Connected to MongoDB successfully');

        // Get database instance
        const db = mongoose.connection.db;

        if (!db) {
            throw new Error('Database connection not established');
        }

        // Get all collection names
        const collections = await db.listCollections().toArray();

        if (collections.length === 0) {
            console.log('📭 Database is already empty - no collections found');
            return;
        }

        console.log(`🗑️  Found ${collections.length} collections to clear:`);
        collections.forEach((collection, index) => {
            console.log(`   ${index + 1}. ${collection.name}`);
        });

        console.log('\n🧹 Clearing all collections...');

        // Drop all collections
        for (const collection of collections) {
            try {
                await db.collection(collection.name).drop();
                console.log(`   ✅ Cleared: ${collection.name}`);
            } catch (error: any) {
                // Collection might not exist or already dropped
                if (error.code === 26) {
                    console.log(`   ⚠️  Already empty: ${collection.name}`);
                } else {
                    console.log(
                        `   ❌ Failed to clear: ${collection.name} - ${error.message}`,
                    );
                }
            }
        }

        console.log('\n🎉 Database cleared successfully!');
        console.log(
            '💡 The database is now completely empty and ready for fresh setup.',
        );
    } catch (error) {
        console.error('❌ Database clearing failed:', error);
        throw error;
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Database connection closed');
    }
}

// Main execution
if (require.main === module) {
    clearDatabase()
        .then(() => {
            console.log('\n✨ Database clearing completed successfully');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n💥 Database clearing failed:', error.message);
            process.exit(1);
        });
}

export default clearDatabase;
