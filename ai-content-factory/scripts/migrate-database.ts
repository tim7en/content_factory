import { createConnection } from 'typeorm';
import { databaseConfig } from '../config/database.config';

async function migrateDatabase() {
    try {
        const connection = await createConnection(databaseConfig);
        console.log('Database connection established.');

        // Run migrations
        await connection.runMigrations();
        console.log('Database migrations completed successfully.');

        await connection.close();
        console.log('Database connection closed.');
    } catch (error) {
        console.error('Error during database migration:', error);
    }
}

migrateDatabase();