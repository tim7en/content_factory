import mongoose from 'mongoose';
import { config } from 'dotenv';
import { logger } from '../utils/logger';

config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ai_content_factory';

export const connectDatabase = async (): Promise<void> => {
    try {
        const connection = await mongoose.connect(MONGODB_URI, {
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });
        
        logger.info(`MongoDB connected: ${connection.connection.host}`);
    } catch (error) {
        logger.error('Database connection failed:', error);
        process.exit(1);
    }
};

export const disconnectDatabase = async (): Promise<void> => {
    try {
        await mongoose.disconnect();
        logger.info('MongoDB disconnected');
    } catch (error) {
        logger.error('Database disconnection failed:', error);
    }
};

// Handle connection events
mongoose.connection.on('error', (error) => {
    logger.error('MongoDB connection error:', error);
});

mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB disconnected');
});

export default mongoose;