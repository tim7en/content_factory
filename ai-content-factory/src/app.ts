import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { json, urlencoded } from 'body-parser';
import mongoose from 'mongoose';
import { createClient } from 'redis';
import cron from 'node-cron';
import { WorkflowController } from './controllers/workflow.controller';
import { AnalyticsController } from './controllers/analytics.controller';
import { MonetizationController } from './controllers/monetization.controller';
import { API_CONFIG } from './config/api.config';
import { logger } from './utils/logger';
import { errorHandler } from './utils/error-handler';

// Initialize the application
const app = express();

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
}));

// CORS configuration
app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? ['https://yourdomain.com'] 
        : ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(json({ limit: '50mb' }));
app.use(urlencoded({ extended: true, limit: '50mb' }));

// Request logging middleware
app.use((req, res, next) => {
    logger.info(`${req.method} ${req.path} - ${req.ip}`);
    next();
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV,
        version: process.env.npm_package_version || '1.0.0'
    });
});

// API status endpoint
app.get('/api/status', (req, res) => {
    res.status(200).json({
        api: 'AI Content Factory',
        version: '1.0.0',
        status: 'operational',
        features: {
            nicheDetection: true,
            contentGeneration: true,
            trendAnalysis: true,
            monetization: true,
            automation: true
        }
    });
});

// Initialize controllers
const workflowController = new WorkflowController();
const analyticsController = new AnalyticsController();
const monetizationController = new MonetizationController();

// Define API routes
app.get('/api/market/analyze', workflowController.analyzeMarket.bind(workflowController));
app.get('/api/niches/recommendations', workflowController.getNicheRecommendations.bind(workflowController));
app.post('/api/content/create', workflowController.createContent.bind(workflowController));
app.post('/api/workflow/start', workflowController.startAutomatedWorkflow.bind(workflowController));
app.get('/api/workflow/:workflowId/status', workflowController.getWorkflowStatus.bind(workflowController));
app.delete('/api/workflow/:workflowId', workflowController.stopAutomatedWorkflow.bind(workflowController));
app.get('/api/analytics/performance', workflowController.analyzePerformance.bind(workflowController));

// New interactive workflow routes
app.get('/api/workflow/:workflowId/progress', workflowController.getWorkflowProgress.bind(workflowController));
app.post('/api/workflow/:workflowId/control', workflowController.controlWorkflow.bind(workflowController));
app.get('/api/workflow/all', workflowController.getAllWorkflows.bind(workflowController));
app.post('/api/workflow/interactive/start', workflowController.startInteractiveWorkflow.bind(workflowController));

// Analytics routes
app.get('/api/analytics/dashboard', analyticsController.getDashboard.bind(analyticsController));
app.get('/api/analytics/reports', analyticsController.generateReport.bind(analyticsController));

// Monetization routes
app.get('/api/monetization/revenue', monetizationController.getRevenue.bind(monetizationController));
app.post('/api/monetization/setup', monetizationController.setupMonetization.bind(monetizationController));

// Static file serving for generated content
app.use('/content', express.static('generated_content'));

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: 'The requested resource was not found on this server.',
        path: req.path
    });
});

// Global error handler
app.use(errorHandler);

// Database connection
async function connectDatabase() {
    try {
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ai_content_factory';
        await mongoose.connect(mongoUri);
        logger.info('Connected to MongoDB');
    } catch (error) {
        logger.error('MongoDB connection failed:', error);
        process.exit(1);
    }
}

// Redis connection
async function connectRedis() {
    try {
        const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
        const redis = createClient({ url: redisUrl });
        
        redis.on('error', (err) => logger.error('Redis Client Error', err));
        redis.on('connect', () => logger.info('Connected to Redis'));
        
        await redis.connect();
        return redis;
    } catch (error) {
        logger.error('Redis connection failed:', error);
        // Continue without Redis if it's not available
        return null;
    }
}

// Automated job scheduling
function setupScheduledJobs() {
    // Daily market analysis at 6 AM
    cron.schedule('0 6 * * *', async () => {
        logger.info('Starting scheduled market analysis...');
        try {
            const controller = new WorkflowController();
            // Trigger market analysis
            // This would need to be adapted to work without HTTP request/response
        } catch (error) {
            logger.error('Scheduled market analysis failed:', error);
        }
    });

    // Content generation every 3 hours during business hours
    cron.schedule('0 9,12,15,18 * * *', async () => {
        logger.info('Starting scheduled content generation...');
        try {
            // Auto-generate content for trending niches
        } catch (error) {
            logger.error('Scheduled content generation failed:', error);
        }
    });

    // Performance tracking every hour
    cron.schedule('0 * * * *', async () => {
        logger.info('Running performance tracking...');
        try {
            // Track performance metrics
        } catch (error) {
            logger.error('Performance tracking failed:', error);
        }
    });

    logger.info('Scheduled jobs configured');
}

// Graceful shutdown handling
process.on('SIGTERM', async () => {
    logger.info('SIGTERM received, shutting down gracefully...');
    
    // Close database connections
    await mongoose.connection.close();
    logger.info('MongoDB connection closed');
    
    process.exit(0);
});

process.on('SIGINT', async () => {
    logger.info('SIGINT received, shutting down gracefully...');
    
    // Close database connections
    await mongoose.connection.close();
    logger.info('MongoDB connection closed');
    
    process.exit(0);
});

// Unhandled promise rejection handler
process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

// Uncaught exception handler
process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', error);
    process.exit(1);
});

// Start the server
async function startServer() {
    try {
        // Connect to databases
        await connectDatabase();
        const redis = await connectRedis();
        
        // Setup scheduled jobs
        setupScheduledJobs();
        
        // Start the HTTP server
        const PORT = parseInt(process.env.PORT || '3000');
        const server = app.listen(PORT, '0.0.0.0', () => {
            logger.info(`🚀 AI Content Factory server running on port ${PORT}`);
            logger.info(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
            logger.info(`🔗 Health check: http://localhost:${PORT}/health`);
            logger.info(`📊 API status: http://localhost:${PORT}/api/status`);
        });

        // Handle server errors
        server.on('error', (error: any) => {
            if (error.syscall !== 'listen') {
                throw error;
            }

            const bind = typeof PORT === 'string' ? 'Pipe ' + PORT : 'Port ' + PORT;

            switch (error.code) {
                case 'EACCES':
                    logger.error(`${bind} requires elevated privileges`);
                    process.exit(1);
                    break;
                case 'EADDRINUSE':
                    logger.error(`${bind} is already in use`);
                    process.exit(1);
                    break;
                default:
                    throw error;
            }
        });

        return server;
    } catch (error) {
        logger.error('Failed to start server:', error);
        process.exit(1);
    }
}

// Start the application
if (require.main === module) {
    startServer();
}

export default app;