import { Request, Response } from 'express';
import { TrendScanner, PlatformTrends } from '../services/niche-detection/trend-scanner';
import { KeywordAnalyzer, KeywordAnalysisResult } from '../services/niche-detection/keyword-analyzer';
import { PredictionModel, PredictionResult } from '../services/niche-detection/prediction-model';
import LyricGenerator from '../services/content-generation/lyric-generator';
import { MusicGenerator } from '../services/content-generation/music-generator';
import AvatarGenerator from '../services/content-generation/avatar-generator';
import { VideoAssembler } from '../services/content-generation/video-assembler';
import { PerformanceTracker } from '../services/analytics/performance-tracker';
import { EngagementAnalyzer } from '../services/analytics/engagement-analyzer';
import Niche, { INiche, NicheData } from '../models/niche.model';
import Content from '../models/content.model';
import { logger } from '../utils/logger';
import { ContentCreationRequest, AutomatedWorkflowConfig, WorkflowControlRequest } from '../types';
import { workflowProgressManager } from '../services/workflow/workflow-progress-manager';

export class WorkflowController {
    private trendScanner: TrendScanner;
    private keywordAnalyzer: KeywordAnalyzer;
    private predictionModel: PredictionModel;
    private lyricGenerator: LyricGenerator;
    private musicGenerator: MusicGenerator;
    private avatarGenerator: typeof AvatarGenerator;
    private videoAssembler: VideoAssembler;
    private performanceTracker: PerformanceTracker;
    private engagementAnalyzer: EngagementAnalyzer;

    constructor() {
        this.trendScanner = new TrendScanner();
        this.keywordAnalyzer = new KeywordAnalyzer();
        this.predictionModel = new PredictionModel();
        this.lyricGenerator = new LyricGenerator();
        this.musicGenerator = new MusicGenerator();
        this.avatarGenerator = AvatarGenerator; // Using the default export
        this.videoAssembler = new VideoAssembler();
        this.performanceTracker = new PerformanceTracker();
        this.engagementAnalyzer = new EngagementAnalyzer();
    }

    /**
     * Analyze current market trends and identify opportunities
     */
    public async analyzeMarket(req: Request, res: Response): Promise<void> {
        try {
            logger.info('Starting market analysis...');
            
            // Scan trends across all platforms
            const platformTrends = await this.trendScanner.scanAllTrends();
            
            // Analyze existing niches
            const existingNiches = await Niche.find().sort({ lastAnalyzed: 1 }).limit(100);
            
            // Get market predictions
            const marketPrediction = await this.predictionModel.predictMarketTrends(existingNiches, platformTrends);
            
            // Identify new potential niches
            const newNiches = await this.identifyNewNiches(platformTrends);
            
            // Update existing niche data
            await this.updateExistingNiches(existingNiches, platformTrends);

            res.json({
                success: true,
                data: {
                    marketPrediction,
                    newNiches,
                    platformTrends: platformTrends.map(p => ({
                        platform: p.platform,
                        trendCount: p.trends.length,
                        marketInsights: p.marketInsights
                    })),
                    analyzedAt: new Date()
                }
            });
        } catch (error) {
            logger.error('Error in market analysis:', error);
            res.status(500).json({ success: false, error: (error as Error).message });
        }
    }

    /**
     * Get niche recommendations based on current analysis
     */
    public async getNicheRecommendations(req: Request, res: Response): Promise<void> {
        try {
            const { category, minScore = 60, limit = 10 } = req.query;

            let query: any = { 'monetizationPotential.overallScore': { $gte: minScore } };
            
            if (category) {
                query.category = category;
            }

            const niches = await Niche.find(query)
                .sort({ 'monetizationPotential.overallScore': -1, trendScore: -1 })
                .limit(Number(limit));

            const recommendations = await Promise.all(
                niches.map(async (niche) => {
                    const nicheData: NicheData = {
                        name: niche.name,
                        category: niche.category,
                        trendScore: niche.trendScore,
                        keywordPopularity: niche.keywordPopularity,
                        competitionLevel: niche.competitionLevel,
                        engagementMetrics: this.calculateEngagementScore(niche.engagementMetrics)
                    };

                    const prediction = await this.predictionModel.predictNichePotential(nicheData);
                    
                    return {
                        niche: niche.name,
                        category: niche.category,
                        score: niche.monetizationPotential.overallScore,
                        prediction,
                        lastAnalyzed: niche.lastAnalyzed
                    };
                })
            );

            res.json({
                success: true,
                data: recommendations
            });
        } catch (error) {
            logger.error('Error getting niche recommendations:', error);
            res.status(500).json({ success: false, error: (error as Error).message });
        }
    }

    /**
     * Create content for a specific niche
     */
    public async createContent(req: Request, res: Response): Promise<void> {
        try {
            const request: ContentCreationRequest = req.body;
            
            logger.info(`Creating content for niche: ${request.niche}`);
            
            // Determine niche if not provided
            let targetNiche = request.niche;
            if (!targetNiche) {
                const topNiches = await Niche.findTrending(5);
                targetNiche = topNiches[0]?.name || 'general entertainment';
            }

            // Get niche data and trends
            const nicheData = await Niche.findOne({ name: targetNiche });
            const trendData = await this.trendScanner.scanTrendsByNiche(targetNiche);
            
            // Generate content components
            const lyrics = await this.lyricGenerator.generateLyrics({
                theme: request.theme || targetNiche,
                style: request.style || 'upbeat',
                niche: targetNiche
            });

            const music = await this.musicGenerator.generateMusic({
                lyrics: lyrics,
                style: request.style || 'pop',
                tempo: 'medium',
                mood: 'upbeat'
            });

            const avatar = await this.avatarGenerator.createAvatar({
                gender: 'neutral',
                age: 'adult',
                style: 'modern',
                description: `Avatar for ${targetNiche} content`
            });

            // Assemble video
            const video = await this.videoAssembler.assembleVideo({
                music: music,
                avatarUrl: avatar,
                lyrics: lyrics,
                style: request.style || 'music-video'
            });

            // Save content to database
            const content = new Content({
                title: `${targetNiche} content`,
                description: `AI-generated content for ${targetNiche} niche`,
                type: 'video',
                metadata: {
                    views: 0,
                    likes: 0,
                    shares: 0,
                    niche: targetNiche,
                    platforms: request.targetPlatforms || [],
                    style: request.style,
                    duration: request.duration,
                    lyrics: lyrics,
                    musicUrl: music,
                    avatarUrl: avatar,
                    videoUrl: video.videoUrl
                }
            });

            await content.save();

            // Auto-publish if requested
            if (request.autoPublish && request.targetPlatforms) {
                await this.publishContent(content, request.targetPlatforms);
            }

            res.json({
                success: true,
                data: {
                    contentId: content._id,
                    title: content.title,
                    components: {
                        lyrics: lyrics,
                        music: music,
                        avatar: avatar,
                        video: video
                    },
                    published: request.autoPublish
                }
            });

        } catch (error) {
            logger.error('Error creating content:', error);
            res.status(500).json({ success: false, error: (error as Error).message });
        }
    }

    /**
     * Start automated content factory
     */
    public async startAutomatedWorkflow(req: Request, res: Response): Promise<void> {
        try {
            const config: AutomatedWorkflowConfig = req.body;
            
            logger.info('Starting automated content workflow...');

            // Validate configuration
            if (!config.platforms || config.platforms.length === 0) {
                throw new Error('At least one platform must be specified');
            }

            // Store workflow configuration
            const workflowId = `workflow_${Date.now()}`;

            // Initialize progress tracking
            const progress = workflowProgressManager.initializeWorkflow(workflowId);

            // Schedule content creation
            const schedule = this.parseSchedule(config.schedule);
            
            // Start monitoring and content creation loop
            this.runAutomatedWorkflow(workflowId, config);

            res.json({
                success: true,
                data: {
                    workflowId,
                    config,
                    status: 'started',
                    nextExecution: schedule.next,
                    progress
                }
            });

        } catch (error) {
            logger.error('Error starting automated workflow:', error);
            res.status(500).json({ success: false, error: (error as Error).message });
        }
    }

    /**
     * Stop automated workflow
     */
    public async stopAutomatedWorkflow(req: Request, res: Response): Promise<void> {
        try {
            const { workflowId } = req.params;
            
            logger.info(`Stopping automated workflow: ${workflowId}`);

            // Stop the workflow (in a real implementation, you'd track running workflows)
            // For now, we'll just return success
            
            res.json({
                success: true,
                data: {
                    workflowId,
                    status: 'stopped',
                    stoppedAt: new Date()
                }
            });

        } catch (error) {
            logger.error('Error stopping automated workflow:', error);
            res.status(500).json({ success: false, error: (error as Error).message });
        }
    }

    /**
     * Get workflow status and metrics
     */
    public async getWorkflowStatus(req: Request, res: Response): Promise<void> {
        try {
            const { workflowId } = req.params;
            
            // Get recent content created by workflow
            const recentContent = await Content.find({
                'metadata.workflowId': workflowId,
                createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
            }).sort({ createdAt: -1 }).limit(20);

            // Calculate performance metrics
            const metrics = await this.calculateWorkflowMetrics(workflowId);

            res.json({
                success: true,
                data: {
                    workflowId,
                    status: 'running',
                    recentContent: recentContent.length,
                    metrics,
                    lastExecution: recentContent[0]?.createdAt || null
                }
            });

        } catch (error) {
            logger.error('Error getting workflow status:', error);
            res.status(500).json({ success: false, error: (error as Error).message });
        }
    }

    /**
     * Analyze performance of existing content
     */
    public async analyzePerformance(req: Request, res: Response): Promise<void> {
        try {
            const performanceData = await this.performanceTracker.trackMetrics();
            const engagementData = await this.engagementAnalyzer.analyzeEngagement();

            res.status(200).json({ 
                success: true,
                data: {
                    performanceData, 
                    engagementData 
                }
            });
        } catch (error) {
            logger.error('Error in performance analysis:', error);
            res.status(500).json({ success: false, error: 'Performance analysis failed' });
        }
    }

    /**
     * Get detailed workflow progress with step-by-step information
     */
    public async getWorkflowProgress(req: Request, res: Response): Promise<Response | void> {
        try {
            const { workflowId } = req.params;
            
            const progress = workflowProgressManager.getWorkflowProgress(workflowId);
            
            if (!progress) {
                return res.status(404).json({ 
                    success: false, 
                    error: 'Workflow not found' 
                });
            }

            res.json({
                success: true,
                data: progress
            });

        } catch (error) {
            logger.error('Error getting workflow progress:', error);
            res.status(500).json({ success: false, error: (error as Error).message });
        }
    }

    /**
     * Control workflow execution (pause, resume, go to step)
     */
    public async controlWorkflow(req: Request, res: Response): Promise<Response | void> {
        try {
            const { workflowId } = req.params;
            const controlRequest: WorkflowControlRequest = req.body;
            
            const progress = workflowProgressManager.controlWorkflow(workflowId, controlRequest);
            
            if (!progress) {
                return res.status(404).json({ 
                    success: false, 
                    error: 'Workflow not found' 
                });
            }

            res.json({
                success: true,
                data: progress,
                message: `Workflow ${controlRequest.action} successful`
            });

        } catch (error) {
            logger.error('Error controlling workflow:', error);
            res.status(500).json({ success: false, error: (error as Error).message });
        }
    }

    /**
     * Get all active workflows
     */
    public async getAllWorkflows(req: Request, res: Response): Promise<void> {
        try {
            const workflows = workflowProgressManager.getAllWorkflows();
            
            res.json({
                success: true,
                data: workflows
            });

        } catch (error) {
            logger.error('Error getting all workflows:', error);
            res.status(500).json({ success: false, error: (error as Error).message });
        }
    }

    /**
     * Start a new interactive workflow with step tracking
     */
    public async startInteractiveWorkflow(req: Request, res: Response): Promise<void> {
        try {
            const config: AutomatedWorkflowConfig = req.body;
            
            // Validate configuration
            if (!config.platforms || config.platforms.length === 0) {
                throw new Error('At least one platform must be specified');
            }

            const workflowId = `interactive_workflow_${Date.now()}`;
            
            // Initialize workflow progress tracking
            const progress = workflowProgressManager.initializeWorkflow(workflowId);
            
            // Start the workflow
            workflowProgressManager.startWorkflow(workflowId);
            
            // Begin the workflow execution
            this.runInteractiveWorkflow(workflowId, config);

            res.json({
                success: true,
                data: {
                    workflowId,
                    progress,
                    config
                }
            });

        } catch (error) {
            logger.error('Error starting interactive workflow:', error);
            res.status(500).json({ success: false, error: (error as Error).message });
        }
    }

    /**
     * Private helper methods
     */
    private async runInteractiveWorkflow(workflowId: string, config: AutomatedWorkflowConfig): Promise<void> {
        logger.info(`Starting interactive workflow ${workflowId}`);
        
        try {
            // Step 1: Market Analysis
            workflowProgressManager.updateStepProgress(workflowId, 'market-analysis', 10);
            const platformTrends = await this.trendScanner.scanAllTrends();
            workflowProgressManager.updateStepProgress(workflowId, 'market-analysis', 50);
            const existingNiches = await Niche.find().sort({ lastAnalyzed: 1 }).limit(100);
            workflowProgressManager.updateStepProgress(workflowId, 'market-analysis', 80);
            await this.updateExistingNiches(existingNiches, platformTrends);
            workflowProgressManager.completeStep(workflowId, 'market-analysis', { 
                trendsFound: platformTrends.length,
                nichesAnalyzed: existingNiches.length 
            });

            // Step 2: Niche Selection
            workflowProgressManager.updateStepProgress(workflowId, 'niche-selection', 20);
            const niches = await this.selectNichesForWorkflow(config);
            workflowProgressManager.completeStep(workflowId, 'niche-selection', { 
                selectedNiches: niches.length 
            });

            // Step 3: Content Planning
            workflowProgressManager.updateStepProgress(workflowId, 'content-planning', 30);
            const contentPlans = niches.map(niche => ({
                niche,
                theme: niche.themes?.[0] || niche.name,
                platforms: config.platforms
            }));
            workflowProgressManager.completeStep(workflowId, 'content-planning', { 
                contentPlans: contentPlans.length 
            });

            // Generate content for each plan
            for (let i = 0; i < Math.min(config.contentPerDay || 1, contentPlans.length); i++) {
                const plan = contentPlans[i];
                
                // Step 4: Lyric Generation
                workflowProgressManager.updateStepProgress(workflowId, 'lyric-generation', (i + 1) * 25);
                const lyrics = await this.generateMockLyrics(plan.theme);
                
                // Step 5: Music Generation  
                workflowProgressManager.updateStepProgress(workflowId, 'music-generation', (i + 1) * 25);
                const music = await this.generateMockMusic(lyrics);
                
                // Step 6: Avatar Creation
                workflowProgressManager.updateStepProgress(workflowId, 'avatar-creation', (i + 1) * 25);
                const avatar = await this.generateMockAvatar();
                
                // Step 7: Video Assembly
                workflowProgressManager.updateStepProgress(workflowId, 'video-assembly', (i + 1) * 25);
                const video = await this.assembleMockVideo();
                
                // Step 8: Publishing
                workflowProgressManager.updateStepProgress(workflowId, 'publishing', (i + 1) * 25);
                await this.publishContent({ music, video }, config.platforms);
                
                // Step 9: Analytics Setup
                workflowProgressManager.updateStepProgress(workflowId, 'analytics-tracking', (i + 1) * 25);
                await this.setupMockAnalytics();
            }
            
            // Complete remaining steps
            workflowProgressManager.completeStep(workflowId, 'lyric-generation');
            workflowProgressManager.completeStep(workflowId, 'music-generation');
            workflowProgressManager.completeStep(workflowId, 'avatar-creation');
            workflowProgressManager.completeStep(workflowId, 'video-assembly');
            workflowProgressManager.completeStep(workflowId, 'publishing');
            workflowProgressManager.completeStep(workflowId, 'analytics-tracking');
            
            logger.info(`Interactive workflow ${workflowId} completed successfully`);
            
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            logger.error(`Error in interactive workflow ${workflowId}:`, error);
            
            // Find current step and mark it as failed
            const progress = workflowProgressManager.getWorkflowProgress(workflowId);
            if (progress) {
                const currentStep = progress.steps[progress.currentStepIndex];
                if (currentStep) {
                    workflowProgressManager.failStep(workflowId, currentStep.id, errorMessage);
                }
            }
        }
    }

    private async identifyNewNiches(platformTrends: PlatformTrends[]): Promise<string[]> {
        const allKeywords: string[] = [];
        
        platformTrends.forEach(platform => {
            platform.trends.forEach(trend => {
                if (trend.volume > 10000 && trend.growth > 20) {
                    allKeywords.push(trend.keyword);
                }
            });
        });

        // Filter out existing niches
        const existingNiches = await Niche.find().distinct('name');
        const newNiches = allKeywords.filter(keyword => 
            !existingNiches.some(existing => 
                existing.toLowerCase().includes(keyword.toLowerCase()) ||
                keyword.toLowerCase().includes(existing.toLowerCase())
            )
        );

        return Array.from(new Set(newNiches)).slice(0, 20);
    }

    private async updateExistingNiches(niches: INiche[], platformTrends: PlatformTrends[]): Promise<void> {
        for (const niche of niches) {
            try {
                // Find relevant trends for this niche
                const relevantTrends = platformTrends.flatMap(platform =>
                    platform.trends.filter(trend =>
                        trend.keyword.toLowerCase().includes(niche.name.toLowerCase()) ||
                        niche.keywords.some(keyword => 
                            trend.keyword.toLowerCase().includes(keyword.toLowerCase())
                        )
                    )
                );

                if (relevantTrends.length > 0) {
                    // Update niche metrics
                    const avgVolume = relevantTrends.reduce((sum, trend) => sum + trend.volume, 0) / relevantTrends.length;
                    const avgGrowth = relevantTrends.reduce((sum, trend) => sum + trend.growth, 0) / relevantTrends.length;
                    
                    niche.trendScore = Math.min(100, (avgVolume / 10000) * 50 + avgGrowth);
                    niche.lastAnalyzed = new Date();
                    
                    // Update platform data
                    niche.platforms = platformTrends.map(platform => ({
                        platform: platform.platform,
                        volume: platform.trends.reduce((sum, trend) => sum + trend.volume, 0),
                        growth: platform.trends.reduce((sum, trend) => sum + trend.growth, 0) / platform.trends.length,
                        sentiment: platform.trends.reduce((sum, trend) => sum + trend.sentiment, 0) / platform.trends.length
                    }));

                    await niche.save();
                }
            } catch (error) {
                logger.error(`Error updating niche ${niche.name}:`, error);
            }
        }
    }

    private calculateEngagementScore(engagementMetrics: any): number {
        if (!engagementMetrics) return 0;
        
        const { averageLikes, averageShares, averageComments, averageViews } = engagementMetrics;
        const engagementRate = ((averageLikes + averageShares + averageComments) / Math.max(averageViews, 1)) * 100;
        
        return Math.min(100, engagementRate * 10);
    }

    private async publishContent(content: any, platforms: string[]): Promise<void> {
        logger.info(`Publishing content ${content._id} to platforms: ${platforms.join(', ')}`);
    }

    private parseSchedule(schedule: string): { next: Date } {
        const now = new Date();
        const next = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour from now
        return { next };
    }

    private async selectNichesForWorkflow(config: AutomatedWorkflowConfig): Promise<any[]> {
        try {
            // Select niches based on configuration
            let query: any = {};
            
            if (config.nicheSelection === 'trending') {
                query = { 'trendScore': { $gte: 70 } };
            } else if (config.nicheSelection === 'emerging') {
                query = { 'trendScore': { $gte: 50, $lt: 70 } };
            } else if (config.nicheSelection === 'stable') {
                query = { 'monetizationPotential.overallScore': { $gte: 60 } };
            } else if (config.nicheSelection === 'custom' && config.customNiches) {
                query = { 'name': { $in: config.customNiches } };
            }

            const niches = await Niche.find(query)
                .sort({ 'monetizationPotential.overallScore': -1 })
                .limit(10);

            return niches;
        } catch (error) {
            logger.error('Error selecting niches:', error);
            return [];
        }
    }

    private async calculateWorkflowMetrics(workflowId: string): Promise<any> {
        try {
            // Get content created by this workflow
            const content = await Content.find({ 'metadata.workflowId': workflowId });
            
            if (content.length === 0) {
                return {
                    totalContent: 0,
                    averageEngagement: 0,
                    totalViews: 0,
                    revenue: 0
                };
            }

            const totalViews = content.reduce((sum, c) => sum + (c.metadata?.views || 0), 0);
            const totalEngagement = content.reduce((sum, c) => sum + (c.metadata?.likes || 0), 0);
            const averageEngagement = totalEngagement / content.length;

            return {
                totalContent: content.length,
                averageEngagement,
                totalViews,
                revenue: 0 // Placeholder for revenue calculation
            };
        } catch (error) {
            logger.error('Error calculating workflow metrics:', error);
            return {
                totalContent: 0,
                averageEngagement: 0,
                totalViews: 0,
                revenue: 0
            };
        }
    }

    private async runAutomatedWorkflow(workflowId: string, config: AutomatedWorkflowConfig): Promise<void> {
        logger.info(`Running automated workflow ${workflowId}`);
        
        try {
            // 1. Analyze market and select niches
            const niches = await this.selectNichesForWorkflow(config);
            
            // 2. Create content for each niche
            for (let i = 0; i < (config.contentPerDay || 1); i++) {
                const niche = niches[i % niches.length];
                
                const contentRequest: ContentCreationRequest = {
                    niche: niche,
                    targetPlatforms: config.platforms,
                    contentType: 'music-video',
                    autoPublish: true
                };

                // Create content (this would be done asynchronously)
                setTimeout(() => {
                    this.createContentInternal(contentRequest, workflowId);
                }, i * 30000); // Stagger creation by 30 seconds
            }
            
        } catch (error) {
            logger.error(`Error in automated workflow ${workflowId}:`, error);
        }
    }

    private async createContentInternal(request: ContentCreationRequest, workflowId: string): Promise<void> {
        try {
            logger.info(`Creating automated content for workflow ${workflowId}, niche: ${request.niche}`);
        } catch (error) {
            logger.error(`Error creating automated content for workflow ${workflowId}:`, error);
        }
    }

    // Mock methods for demonstration (would be replaced with actual AI service calls)
    private async generateMockLyrics(theme: string): Promise<string> {
        // Simulate async operation
        await new Promise(resolve => setTimeout(resolve, 1000));
        return `Generated lyrics for theme: ${theme}\n\nVerse 1:\nThis is where the magic happens\nWith AI and creativity combined...\n\nChorus:\n${theme} is the way to go\nMaking content that will grow...`;
    }

    private async generateMockMusic(lyrics: string): Promise<{ audioUrl: string }> {
        await new Promise(resolve => setTimeout(resolve, 1500));
        return { audioUrl: `https://example.com/music/${Date.now()}.mp3` };
    }

    private async generateMockAvatar(): Promise<{ avatarUrl: string }> {
        await new Promise(resolve => setTimeout(resolve, 1200));
        return { avatarUrl: `https://example.com/avatar/${Date.now()}.png` };
    }

    private async assembleMockVideo(): Promise<{ videoUrl: string }> {
        await new Promise(resolve => setTimeout(resolve, 2000));
        return { videoUrl: `https://example.com/video/${Date.now()}.mp4` };
    }

    private async setupMockAnalytics(): Promise<void> {
        await new Promise(resolve => setTimeout(resolve, 500));
        logger.info('Analytics tracking setup completed');
    }
}