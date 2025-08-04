import mongoose from 'mongoose';
import { logger } from '../utils/logger';

const connectDB = async (): Promise<void> => {
    try {
        // Add connection options for better performance and reliability
        const conn = await mongoose.connect(process.env.MONGO_URI as string, {
            serverSelectionTimeoutMS: 5000, // Timeout for server selection
            socketTimeoutMS: 30000, // Close sockets after 30 seconds of inactivity
            maxPoolSize: 15, // Maintain up to 15 socket connections
            autoIndex: true, // Always create indexes in development
            autoCreate: true, // Auto-create collections
            // Additional transaction-related options
            retryWrites: true, // Retry write operations on transient network errors
            retryReads: true, // Retry read operations on transient network errors
            maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
            heartbeatFrequencyMS: 10000, // Check server status every 10 seconds
        });

        // Add event listeners for monitoring connection issues
        mongoose.connection.on('error', (err) => {
            logger.error(`MongoDB connection error: ${err}`);
        });

        mongoose.connection.on('disconnected', () => {
            logger.warn('MongoDB disconnected, attempting to reconnect...');
        });

        mongoose.connection.on('reconnected', () => {
            logger.info('MongoDB reconnected successfully');
        });

        logger.info(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        logger.error(
            `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
        process.exit(1);
    }
};

export default connectDB;
