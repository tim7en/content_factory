import express from 'express';
import { json } from 'body-parser';
import { workflowController } from './controllers/workflow.controller';
import { analyticsController } from './controllers/analytics.controller';
import { monetizationController } from './controllers/monetization.controller';
import { apiConfig } from './config/api.config';
import { databaseConfig } from './config/database.config';

// Initialize the application
const app = express();

// Middleware setup
app.use(json());

// Define routes
app.use('/api/workflow', workflowController);
app.use('/api/analytics', analyticsController);
app.use('/api/monetization', monetizationController);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});