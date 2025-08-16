import { NicheData, INiche } from '../../models/niche.model';
import { TrendData, PlatformTrends } from './trend-scanner';
import { KeywordAnalysisResult } from './keyword-analyzer';
import { logger } from '../../utils/logger';

export interface PredictionResult {
    nicheName: string;
    viralPotential: number;
    monetizationScore: number;
    competitionLevel: number;
    sustainabilityScore: number;
    overallScore: number;
    confidence: number;
    recommendedActions: string[];
    risks: string[];
    opportunities: string[];
    timeframe: {
        shortTerm: number; // 1-3 months
        mediumTerm: number; // 3-6 months
        longTerm: number; // 6+ months
    };
    platformRecommendations: {
        platform: string;
        priority: number;
        reasoning: string;
    }[];
}

export interface MarketPrediction {
    emergingNiches: {
        niche: string;
        growthPotential: number;
        timeToTrend: number;
    }[];
    decliningNiches: {
        niche: string;
        declineRate: number;
        timeToObsolescence: number;
    }[];
    stableNiches: {
        niche: string;
        consistencyScore: number;
        longevityPrediction: number;
    }[];
}

export class PredictionModel {
    private weights: {
        trendScore: number;
        keywordPopularity: number;
        competitionLevel: number;
        engagementMetrics: number;
        seasonality: number;
        platformDiversity: number;
        sentiment: number;
        growthRate: number;
    };

    constructor() {
        // Initialize weights for different factors
        this.weights = {
            trendScore: 0.25,
            keywordPopularity: 0.20,
            competitionLevel: -0.15, // Negative because high competition is bad
            engagementMetrics: 0.20,
            seasonality: 0.05,
            platformDiversity: 0.10,
            sentiment: 0.10,
            growthRate: 0.15
        };
    }

    public async predictNichePotential(
        nicheData: NicheData,
        trendData?: PlatformTrends[],
        keywordData?: KeywordAnalysisResult[]
    ): Promise<PredictionResult> {
        try {
            const features = this.extractFeatures(nicheData, trendData, keywordData);
            
            const viralPotential = this.calculateViralPotential(features);
            const monetizationScore = this.calculateMonetizationScore(features);
            const competitionLevel = features.competitionLevel;
            const sustainabilityScore = this.calculateSustainabilityScore(features);
            
            const overallScore = this.calculateOverallScore({
                viralPotential,
                monetizationScore,
                competitionLevel,
                sustainabilityScore
            });

            const confidence = this.calculateConfidence(features);
            const timeframe = this.predictTimeframe(features);
            const platformRecommendations = this.generatePlatformRecommendations(features, trendData);
            const recommendations = this.generateRecommendations(features);
            const risks = this.identifyRisks(features);
            const opportunities = this.identifyOpportunities(features);

            return {
                nicheName: nicheData.name,
                viralPotential,
                monetizationScore,
                competitionLevel,
                sustainabilityScore,
                overallScore,
                confidence,
                recommendedActions: recommendations,
                risks,
                opportunities,
                timeframe,
                platformRecommendations
            };
        } catch (error) {
            logger.error(`Error predicting niche potential for ${nicheData.name}:`, error);
            throw error;
        }
    }

    public async predictMarketTrends(
        allNiches: INiche[],
        trendData: PlatformTrends[]
    ): Promise<MarketPrediction> {
        const emerging: any[] = [];
        const declining: any[] = [];
        const stable: any[] = [];

        for (const niche of allNiches) {
            const nicheData: NicheData = {
                name: niche.name,
                category: niche.category,
                trendScore: niche.trendScore,
                keywordPopularity: niche.keywordPopularity,
                competitionLevel: niche.competitionLevel,
                engagementMetrics: this.calculateEngagementScore(niche.engagementMetrics)
            };

            const prediction = await this.predictNichePotential(nicheData, trendData);
            
            if (prediction.timeframe.shortTerm > 70 && niche.trendScore < 50) {
                emerging.push({
                    niche: niche.name,
                    growthPotential: prediction.viralPotential,
                    timeToTrend: this.estimateTimeToTrend(prediction)
                });
            } else if (prediction.sustainabilityScore < 30) {
                declining.push({
                    niche: niche.name,
                    declineRate: 100 - prediction.sustainabilityScore,
                    timeToObsolescence: this.estimateObsolescence(prediction)
                });
            } else if (prediction.sustainabilityScore > 70) {
                stable.push({
                    niche: niche.name,
                    consistencyScore: prediction.sustainabilityScore,
                    longevityPrediction: prediction.timeframe.longTerm
                });
            }
        }

        return {
            emergingNiches: emerging.sort((a, b) => b.growthPotential - a.growthPotential),
            decliningNiches: declining.sort((a, b) => b.declineRate - a.declineRate),
            stableNiches: stable.sort((a, b) => b.consistencyScore - a.consistencyScore)
        };
    }

    public async predictContentPerformance(
        niche: string,
        contentType: string,
        platform: string,
        trendData: PlatformTrends[]
    ): Promise<{
        expectedViews: number;
        expectedEngagement: number;
        bestTimeToPost: string;
        recommendedDuration: number;
        suggestedHashtags: string[];
    }> {
        const platformData = trendData.find(t => t.platform.toLowerCase() === platform.toLowerCase());
        const nicheRelevantTrends = platformData?.trends.filter(trend => 
            trend.keyword.toLowerCase().includes(niche.toLowerCase())
        ) || [];

        const avgViews = nicheRelevantTrends.reduce((sum, trend) => sum + trend.engagement.views, 0) / nicheRelevantTrends.length || 10000;
        const avgEngagement = nicheRelevantTrends.reduce((sum, trend) => 
            sum + trend.engagement.likes + trend.engagement.comments + trend.engagement.shares, 0
        ) / nicheRelevantTrends.length || 500;

        // Apply content type multipliers
        const contentMultipliers: Record<string, number> = {
            'short-form-video': 1.5,
            'long-form-video': 0.8,
            'music-video': 2.0,
            'tutorial': 1.2,
            'review': 1.0,
            'live-stream': 0.7
        };

        const multiplier = contentMultipliers[contentType] || 1.0;

        return {
            expectedViews: Math.round(avgViews * multiplier),
            expectedEngagement: Math.round(avgEngagement * multiplier),
            bestTimeToPost: this.predictOptimalPostTime(platform, niche),
            recommendedDuration: this.recommendContentDuration(platform, contentType),
            suggestedHashtags: this.generateHashtagSuggestions(niche, nicheRelevantTrends)
        };
    }

    private extractFeatures(
        nicheData: NicheData,
        trendData?: PlatformTrends[],
        keywordData?: KeywordAnalysisResult[]
    ): any {
        const platformMetrics = this.aggregatePlatformMetrics(trendData);
        const keywordMetrics = this.aggregateKeywordMetrics(keywordData);
        
        return {
            trendScore: nicheData.trendScore,
            keywordPopularity: nicheData.keywordPopularity,
            competitionLevel: nicheData.competitionLevel,
            engagementMetrics: nicheData.engagementMetrics,
            platformDiversity: platformMetrics.diversity,
            averageSentiment: platformMetrics.sentiment,
            growthRate: platformMetrics.growth,
            seasonality: this.calculateSeasonality(nicheData),
            keywordVolume: keywordMetrics.totalVolume,
            keywordDifficulty: keywordMetrics.avgDifficulty,
            contentOpportunities: keywordMetrics.opportunities
        };
    }

    private calculateViralPotential(features: any): number {
        const viralFactors = {
            highEngagement: features.engagementMetrics > 70 ? 20 : 0,
            lowCompetition: features.competitionLevel < 30 ? 15 : 0,
            highGrowthRate: features.growthRate > 50 ? 15 : 0,
            positiveSentiment: features.averageSentiment > 0.6 ? 10 : 0,
            trendingKeywords: features.keywordVolume > 50000 ? 20 : 0,
            platformDiversity: features.platformDiversity > 3 ? 10 : 0,
            seasonalPeak: features.seasonality > 80 ? 10 : 0
        };

        return Math.min(100, Object.values(viralFactors).reduce((sum, value) => sum + value, 0));
    }

    private calculateMonetizationScore(features: any): number {
        const monetizationFactors = {
            highEngagement: features.engagementMetrics * 0.3,
            sustainableTrend: features.trendScore * 0.25,
            lowCompetition: (100 - features.competitionLevel) * 0.2,
            keywordValue: Math.min(features.keywordVolume / 1000, 50) * 0.15,
            contentOpportunities: features.contentOpportunities * 0.1
        };

        return Math.min(100, Object.values(monetizationFactors).reduce((sum, value) => sum + value, 0));
    }

    private calculateSustainabilityScore(features: any): number {
        const sustainabilityFactors = {
            consistentTrend: features.trendScore > 40 && features.trendScore < 90 ? 25 : 0,
            moderateCompetition: features.competitionLevel > 20 && features.competitionLevel < 70 ? 20 : 0,
            diversePlatforms: features.platformDiversity > 2 ? 20 : 0,
            stableGrowth: features.growthRate > 10 && features.growthRate < 200 ? 15 : 0,
            lowSeasonality: features.seasonality < 60 ? 20 : 0
        };

        return Math.min(100, Object.values(sustainabilityFactors).reduce((sum, value) => sum + value, 0));
    }

    private calculateOverallScore(scores: {
        viralPotential: number;
        monetizationScore: number;
        competitionLevel: number;
        sustainabilityScore: number;
    }): number {
        const weights = {
            viral: 0.3,
            monetization: 0.35,
            competition: -0.15, // Negative weight
            sustainability: 0.3
        };

        return Math.max(0, Math.min(100,
            scores.viralPotential * weights.viral +
            scores.monetizationScore * weights.monetization +
            scores.competitionLevel * weights.competition +
            scores.sustainabilityScore * weights.sustainability
        ));
    }

    private calculateConfidence(features: any): number {
        const dataQualityFactors = {
            hasTrendData: features.trendScore > 0 ? 20 : 0,
            hasKeywordData: features.keywordVolume > 0 ? 20 : 0,
            hasEngagementData: features.engagementMetrics > 0 ? 20 : 0,
            platformCoverage: Math.min(features.platformDiversity * 10, 30),
            dataRecency: 10 // Assume recent data for now
        };

        return Math.min(100, Object.values(dataQualityFactors).reduce((sum, value) => sum + value, 0));
    }

    private predictTimeframe(features: any): {
        shortTerm: number;
        mediumTerm: number;
        longTerm: number;
    } {
        const baseScore = features.trendScore;
        const growthMultiplier = Math.max(0.5, features.growthRate / 50);
        const competitionPenalty = features.competitionLevel / 100;

        return {
            shortTerm: Math.min(100, baseScore * growthMultiplier * (1 - competitionPenalty * 0.3)),
            mediumTerm: Math.min(100, baseScore * (1 - competitionPenalty * 0.5)),
            longTerm: Math.min(100, baseScore * 0.8 * (1 - competitionPenalty * 0.7))
        };
    }

    private generatePlatformRecommendations(
        features: any,
        trendData?: PlatformTrends[]
    ): { platform: string; priority: number; reasoning: string; }[] {
        if (!trendData) return [];

        return trendData.map(platformData => {
            const relevantTrends = platformData.trends.filter(trend => 
                trend.volume > 1000 && trend.sentiment > 0.3
            );
            
            const avgVolume = relevantTrends.reduce((sum, trend) => sum + trend.volume, 0) / relevantTrends.length || 0;
            const avgGrowth = relevantTrends.reduce((sum, trend) => sum + trend.growth, 0) / relevantTrends.length || 0;
            
            const priority = Math.min(100, (avgVolume / 10000) * 30 + avgGrowth * 0.7);
            
            return {
                platform: platformData.platform,
                priority,
                reasoning: this.generatePlatformReasoning(platformData.platform, avgVolume, avgGrowth)
            };
        }).sort((a, b) => b.priority - a.priority);
    }

    private generateRecommendations(features: any): string[] {
        const recommendations: string[] = [];

        if (features.competitionLevel > 70) {
            recommendations.push("Focus on long-tail keywords to avoid high competition");
        }

        if (features.platformDiversity < 2) {
            recommendations.push("Expand to more platforms to increase reach");
        }

        if (features.engagementMetrics < 40) {
            recommendations.push("Improve content quality to boost engagement");
        }

        if (features.growthRate > 100) {
            recommendations.push("Act quickly - this niche is rapidly growing");
        }

        if (features.seasonality > 80) {
            recommendations.push("Plan content around seasonal peaks");
        }

        return recommendations;
    }

    private identifyRisks(features: any): string[] {
        const risks: string[] = [];

        if (features.competitionLevel > 80) {
            risks.push("Very high competition may limit growth potential");
        }

        if (features.growthRate > 200) {
            risks.push("Extremely rapid growth may indicate a short-lived trend");
        }

        if (features.seasonality > 90) {
            risks.push("High seasonality may lead to inconsistent performance");
        }

        if (features.platformDiversity < 2) {
            risks.push("Platform dependency risk - diversify content distribution");
        }

        return risks;
    }

    private identifyOpportunities(features: any): string[] {
        const opportunities: string[] = [];

        if (features.competitionLevel < 30) {
            opportunities.push("Low competition - good opportunity for market entry");
        }

        if (features.growthRate > 50 && features.growthRate < 150) {
            opportunities.push("Strong growth momentum - ideal timing for content creation");
        }

        if (features.contentOpportunities > 70) {
            opportunities.push("Multiple content formats available for experimentation");
        }

        if (features.keywordVolume > 100000) {
            opportunities.push("High search volume indicates strong audience demand");
        }

        return opportunities;
    }

    private aggregatePlatformMetrics(trendData?: PlatformTrends[]): any {
        if (!trendData || trendData.length === 0) {
            return { diversity: 0, sentiment: 0.5, growth: 0 };
        }

        const totalTrends = trendData.reduce((sum, platform) => sum + platform.trends.length, 0);
        const avgSentiment = trendData.reduce((sum, platform) => {
            const platformSentiment = platform.trends.reduce((s, trend) => s + trend.sentiment, 0) / platform.trends.length;
            return sum + (platformSentiment || 0.5);
        }, 0) / trendData.length;

        const avgGrowth = trendData.reduce((sum, platform) => {
            const platformGrowth = platform.trends.reduce((s, trend) => s + trend.growth, 0) / platform.trends.length;
            return sum + (platformGrowth || 0);
        }, 0) / trendData.length;

        return {
            diversity: trendData.length,
            sentiment: avgSentiment,
            growth: avgGrowth
        };
    }

    private aggregateKeywordMetrics(keywordData?: KeywordAnalysisResult[]): any {
        if (!keywordData || keywordData.length === 0) {
            return { totalVolume: 0, avgDifficulty: 50, opportunities: 0 };
        }

        const totalVolume = keywordData.reduce((sum, keyword) => sum + keyword.searchVolume, 0);
        const avgDifficulty = keywordData.reduce((sum, keyword) => sum + keyword.difficulty, 0) / keywordData.length;
        const opportunities = keywordData.reduce((sum, keyword) => sum + keyword.contentOpportunities.length, 0);

        return { totalVolume, avgDifficulty, opportunities };
    }

    private calculateEngagementScore(engagementMetrics: any): number {
        if (!engagementMetrics) return 0;
        
        const { averageLikes, averageShares, averageComments, averageViews } = engagementMetrics;
        const engagementRate = ((averageLikes + averageShares + averageComments) / Math.max(averageViews, 1)) * 100;
        
        return Math.min(100, engagementRate * 10);
    }

    private calculateSeasonality(nicheData: NicheData): number {
        // This would typically analyze historical data
        // For now, return a default based on niche category
        const seasonalNiches: Record<string, number> = {
            'fitness': 85, // High in January, summer
            'gaming': 30, // Relatively stable
            'food': 70, // Holiday spikes
            'fashion': 90, // Seasonal collections
            'travel': 95 // Very seasonal
        };

        return seasonalNiches[nicheData.category] || 50;
    }

    private predictOptimalPostTime(platform: string, niche: string): string {
        const optimalTimes: Record<string, string> = {
            'YouTube': '2-4 PM weekdays',
            'TikTok': '6-10 PM daily',
            'Instagram': '11 AM - 1 PM weekdays',
            'Twitter': '9 AM - 3 PM weekdays'
        };

        return optimalTimes[platform] || '12-2 PM weekdays';
    }

    private recommendContentDuration(platform: string, contentType: string): number {
        const durations: Record<string, Record<string, number>> = {
            'TikTok': {
                'short-form-video': 30,
                'music-video': 45,
                'tutorial': 60
            },
            'YouTube': {
                'tutorial': 600,
                'review': 480,
                'music-video': 180
            },
            'Instagram': {
                'short-form-video': 30,
                'tutorial': 90
            }
        };

        return durations[platform]?.[contentType] || 60;
    }

    private generateHashtagSuggestions(niche: string, trends: TrendData[]): string[] {
        const hashtags = new Set<string>();
        
        // Add niche-based hashtags
        hashtags.add(`#${niche.replace(/\s+/g, '')}`);
        
        // Add trending keywords as hashtags
        trends.slice(0, 5).forEach(trend => {
            const tag = trend.keyword.replace(/\s+/g, '').toLowerCase();
            if (tag.length < 30) {
                hashtags.add(`#${tag}`);
            }
        });

        return Array.from(hashtags).slice(0, 10);
    }

    private generatePlatformReasoning(platform: string, volume: number, growth: number): string {
        if (volume > 50000 && growth > 20) {
            return `High volume (${Math.round(volume/1000)}K) and strong growth (${Math.round(growth)}%) make this platform ideal for content distribution`;
        } else if (growth > 50) {
            return `Rapid growth (${Math.round(growth)}%) indicates emerging opportunity despite lower current volume`;
        } else if (volume > 100000) {
            return `Large audience (${Math.round(volume/1000)}K) provides stable reach potential`;
        } else {
            return `Moderate performance with room for growth through targeted content strategy`;
        }
    }

    private estimateTimeToTrend(prediction: PredictionResult): number {
        // Estimate weeks to trending based on growth potential
        if (prediction.viralPotential > 80) return 2;
        if (prediction.viralPotential > 60) return 4;
        if (prediction.viralPotential > 40) return 8;
        return 12;
    }

    private estimateObsolescence(prediction: PredictionResult): number {
        // Estimate months until niche becomes obsolete
        if (prediction.sustainabilityScore < 20) return 3;
        if (prediction.sustainabilityScore < 40) return 6;
        if (prediction.sustainabilityScore < 60) return 12;
        return 24;
    }
}