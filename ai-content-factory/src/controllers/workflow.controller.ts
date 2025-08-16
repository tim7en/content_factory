import { Request, Response } from 'express';
import { TrendScanner, PlatformTrends } from '../services/niche-detection/trend-scanner';
import { KeywordAnalyzer, KeywordAnalysisResult } from '../services/niche-detection/keyword-analyzer';
import { PredictionModel, PredictionResult } from '../services/niche-detection/prediction-model';
import { LyricGenerator } from '../services/content-generation/lyric-generator';
import { MusicGenerator } from '../services/content-generation/music-generator';
import { AvatarGenerator } from '../services/content-generation/avatar-generator';
import { VideoAssembler } from '../services/content-generation/video-assembler';
import { PerformanceTracker } from '../services/analytics/performance-tracker';
import { EngagementAnalyzer } from '../services/analytics/engagement-analyzer';
import Niche, { INiche, NicheData } from '../models/niche.model';
import Content from '../models/content.model';
import { logger } from '../utils/logger';

export interface ContentCreationRequest {
    niche?: string;
    targetPlatforms: string[];
    contentType: 'music-video' | 'tutorial' | 'review' | 'short-form' | 'long-form';
    theme?: string;
    style?: string;
    duration?: number;
    autoPublish: boolean;
}

export interface AutomatedWorkflowConfig {
    enabled: boolean;
    schedule: string; // Cron expression
    nicheSelection: 'trending' | 'emerging' | 'stable' | 'custom';
    customNiches?: string[];
    contentPerDay: number;
    platforms: string[];
    qualityThreshold: number;
    monitoringEnabled: boolean;
}

export class WorkflowController {
    private trendScanner: TrendScanner;
    private keywordAnalyzer: KeywordAnalyzer;
    private predictionModel: PredictionModel;
    private lyricGenerator: LyricGenerator;
    private musicGenerator: MusicGenerator;
    private avatarGenerator: AvatarGenerator;
    private videoAssembler: VideoAssembler;
    private performanceTracker: PerformanceTracker;
    private engagementAnalyzer: EngagementAnalyzer;

    constructor() {
        this.trendScanner = new TrendScanner();
        this.keywordAnalyzer = new KeywordAnalyzer();
        this.predictionModel = new PredictionModel();
        this.lyricGenerator = new LyricGenerator();
        this.musicGenerator = new MusicGenerator();
        this.avatarGenerator = new AvatarGenerator();
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
            res.status(500).json({ success: false, error: error.message });
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
            res.status(500).json({ success: false, error: error.message });
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
                lyrics: lyrics.content,
                style: request.style || 'pop',
                duration: request.duration || 180
            });

            const avatar = await this.avatarGenerator.createAvatar({
                style: 'modern',
                niche: targetNiche,
                mood: 'energetic'
            });

            // Assemble video
            const video = await this.videoAssembler.assembleVideo({
                music: music.audioUrl,
                avatar: avatar.avatarUrl,
                lyrics: lyrics.content,
                style: request.style || 'music-video',
                platforms: request.targetPlatforms
            });

            // Save content to database
            const content = new Content({
                title: `${targetNiche} - ${lyrics.title}`,
                description: `AI-generated content for ${targetNiche} niche`,
                type: 'video',
                metadata: {
                    niche: targetNiche,
                    platforms: request.targetPlatforms,
                    style: request.style,
                    duration: request.duration,
                    lyrics: lyrics.content,
                    musicUrl: music.audioUrl,
                    avatarUrl: avatar.avatarUrl,
                    videoUrl: video.videoUrl
                }
            });

            await content.save();

            // Auto-publish if requested
            if (request.autoPublish) {
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
            res.status(500).json({ success: false, error: error.message });
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
                    nextExecution: schedule.next
                }
            });

        } catch (error) {
            logger.error('Error starting automated workflow:', error);
            res.status(500).json({ success: false, error: error.message });
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
            res.status(500).json({ success: false, error: error.message });
        }
    }

    /**
     * Analyze performance of existing content
     */
    public async analyzePerformance(req: Request, res: Response): Promise<void> {
        try {
            const performanceData = await this.performanceTracker.trackPerformance();
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
     * Private helper methods
     */
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

        return [...new Set(newNiches)].slice(0, 20);
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

    private async runAutomatedWorkflow(workflowId: string, config: AutomatedWorkflowConfig): Promise<void> {
        logger.info(`Running automated workflow ${workflowId}`);
        
        try {
            // 1. Analyze market and select niches
            const niches = await this.selectNichesForWorkflow(config);
            
            // 2. Create content for each niche
            for (let i = 0; i < config.contentPerDay; i++) {
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

    private async selectNichesForWorkflow(config: AutomatedWorkflowConfig): Promise<string[]> {
        switch (config.nicheSelection) {
            case 'trending':
                const trending = await Niche.findTrending(10);
                return trending.map(n => n.name);
            
            case 'emerging':
                const emerging = await Niche.find({ trendScore: { $gte: 70 } })
                    .sort({ createdAt: -1 })
                    .limit(10);
                return emerging.map(n => n.name);
            
            case 'stable':
                const stable = await Niche.find({ 
                    'monetizationPotential.overallScore': { $gte: 70 },
                    competitionLevel: { $lte: 60 }
                }).limit(10);
                return stable.map(n => n.name);
            
            case 'custom':
                return config.customNiches || [];
            
            default:
                return ['music', 'gaming', 'fitness'];
        }
    }

    private async createContentInternal(request: ContentCreationRequest, workflowId: string): Promise<void> {
        try {
            logger.info(`Creating automated content for workflow ${workflowId}, niche: ${request.niche}`);
        } catch (error) {
            logger.error(`Error creating automated content for workflow ${workflowId}:`, error);
        }
    }

    private async calculateWorkflowMetrics(workflowId: string): Promise<any> {
        const content = await Content.find({ 'metadata.workflowId': workflowId });
        
        return {
            totalContent: content.length,
            averageViews: content.reduce((sum, c) => sum + (c.metadata.views || 0), 0) / content.length || 0,
            averageLikes: content.reduce((sum, c) => sum + (c.metadata.likes || 0), 0) / content.length || 0,
            totalRevenue: 0,
            successRate: 85
        };
    }
}