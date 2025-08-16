import { Sequelize } from 'sequelize';

// Database configuration settings
const databaseConfig = {
    database: process.env.DB_NAME || 'your_database_name',
    username: process.env.DB_USER || 'your_database_user',
    password: process.env.DB_PASSWORD || 'your_database_password',
    host: process.env.DB_HOST || 'localhost',
    dialect: 'postgres', // or 'mysql', 'sqlite', etc.
};

// Create a new Sequelize instance
const sequelize = new Sequelize(databaseConfig.database, databaseConfig.username, databaseConfig.password, {
    host: databaseConfig.host,
    dialect: databaseConfig.dialect,
});

// Test the database connection
sequelize.authenticate()
    .then(() => {
        console.log('Database connection has been established successfully.');
    })
    .catch(err => {
        console.error('Unable to connect to the database:', err);
    });

export default sequelize;