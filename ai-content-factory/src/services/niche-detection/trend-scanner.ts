import axios from 'axios';
import { API_CONFIG } from '../../config/api.config';
import { logger } from '../../utils/logger';

export interface TrendData {
    keyword: string;
    volume: number;
    growth: number;
    platform: string;
    category: string;
    timestamp: Date;
    relatedKeywords: string[];
    sentiment: number;
    engagement: {
        likes: number;
        shares: number;
        comments: number;
        views: number;
    };
}

export interface PlatformTrends {
    platform: string;
    trends: TrendData[];
    marketInsights: {
        topCategories: string[];
        emergingNiches: string[];
        declining: string[];
    };
}

export class TrendScanner {
    private platforms: string[];
    private rateLimit: Map<string, number>;
    private lastRequest: Map<string, number>;

    constructor() {
        this.platforms = [
            'GoogleTrends', 
            'TikTok', 
            'Twitter', 
            'Instagram', 
            'YouTube', 
            'Reddit',
            'Pinterest',
            'Snapchat'
        ];
        this.rateLimit = new Map();
        this.lastRequest = new Map();
        this.initRateLimits();
    }

    private initRateLimits(): void {
        // Rate limits per platform (requests per hour)
        this.rateLimit.set('GoogleTrends', 100);
        this.rateLimit.set('TikTok', 200);
        this.rateLimit.set('Twitter', 300);
        this.rateLimit.set('Instagram', 200);
        this.rateLimit.set('YouTube', 1000);
        this.rateLimit.set('Reddit', 60);
        this.rateLimit.set('Pinterest', 100);
        this.rateLimit.set('Snapchat', 100);
    }

    public async scanAllTrends(categories?: string[]): Promise<PlatformTrends[]> {
        const platformTrends: PlatformTrends[] = [];
        
        for (const platform of this.platforms) {
            try {
                if (await this.checkRateLimit(platform)) {
                    const trends = await this.fetchTrends(platform, categories);
                    platformTrends.push(trends);
                    await this.delay(100); // Prevent overwhelming APIs
                }
            } catch (error) {
                logger.error(`Error scanning trends for ${platform}:`, error);
            }
        }

        return platformTrends;
    }

    public async scanTrendsByNiche(niche: string): Promise<PlatformTrends[]> {
        const nicheKeywords = await this.generateNicheKeywords(niche);
        const trends: PlatformTrends[] = [];

        for (const platform of this.platforms) {
            try {
                const platformTrends = await this.fetchNicheTrends(platform, nicheKeywords);
                trends.push(platformTrends);
            } catch (error) {
                logger.error(`Error fetching niche trends for ${platform}:`, error);
            }
        }

        return trends;
    }

    private async fetchTrends(platform: string, categories?: string[]): Promise<PlatformTrends> {
        switch (platform) {
            case 'GoogleTrends':
                return await this.fetchGoogleTrends(categories);
            case 'TikTok':
                return await this.fetchTikTokTrends();
            case 'Twitter':
                return await this.fetchTwitterTrends();
            case 'Instagram':
                return await this.fetchInstagramTrends();
            case 'YouTube':
                return await this.fetchYouTubeTrends();
            case 'Reddit':
                return await this.fetchRedditTrends();
            case 'Pinterest':
                return await this.fetchPinterestTrends();
            case 'Snapchat':
                return await this.fetchSnapchatTrends();
            default:
                throw new Error(`Unsupported platform: ${platform}`);
        }
    }

    private async fetchGoogleTrends(categories?: string[]): Promise<PlatformTrends> {
        try {
            const response = await axios.get(`${API_CONFIG.googleTrends.baseUrl}/trending`, {
                params: {
                    geo: 'US',
                    time: 'now 7-d',
                    category: categories?.join(',') || 'all',
                    property: ''
                },
                headers: {
                    'Authorization': `Bearer ${API_CONFIG.googleTrends.apiKey}`
                }
            });

            const trends: TrendData[] = response.data.default.trendingSearchesDays[0].trendingSearches.map((trend: any) => ({
                keyword: trend.title.query,
                volume: parseInt(trend.formattedTraffic.replace(/[^0-9]/g, '')) || 0,
                growth: trend.trafficBreakdown?.[0]?.value || 0,
                platform: 'GoogleTrends',
                category: trend.articles?.[0]?.snippet || 'general',
                timestamp: new Date(),
                relatedKeywords: trend.relatedQueries?.map((q: any) => q.query) || [],
                sentiment: 0.5, // Neutral default
                engagement: {
                    likes: 0,
                    shares: 0,
                    comments: 0,
                    views: parseInt(trend.formattedTraffic.replace(/[^0-9]/g, '')) || 0
                }
            }));

            return {
                platform: 'GoogleTrends',
                trends,
                marketInsights: await this.analyzeMarketInsights(trends)
            };
        } catch (error) {
            logger.error('Error fetching Google Trends:', error);
            return this.getEmptyPlatformTrends('GoogleTrends');
        }
    }

    private async fetchTikTokTrends(): Promise<PlatformTrends> {
        try {
            const response = await axios.get(`${API_CONFIG.tiktok.baseUrl}/trending/hashtags`, {
                headers: {
                    'Authorization': `Bearer ${API_CONFIG.tiktok.apiKey}`,
                    'Content-Type': 'application/json'
                },
                params: {
                    count: 50,
                    region: 'US'
                }
            });

            const trends: TrendData[] = response.data.hashtags.map((hashtag: any) => ({
                keyword: hashtag.name,
                volume: hashtag.video_count || 0,
                growth: hashtag.growth_rate || 0,
                platform: 'TikTok',
                category: hashtag.category || 'entertainment',
                timestamp: new Date(),
                relatedKeywords: hashtag.related_hashtags || [],
                sentiment: hashtag.sentiment_score || 0.5,
                engagement: {
                    likes: hashtag.total_likes || 0,
                    shares: hashtag.total_shares || 0,
                    comments: hashtag.total_comments || 0,
                    views: hashtag.total_views || 0
                }
            }));

            return {
                platform: 'TikTok',
                trends,
                marketInsights: await this.analyzeMarketInsights(trends)
            };
        } catch (error) {
            logger.error('Error fetching TikTok trends:', error);
            return this.getEmptyPlatformTrends('TikTok');
        }
    }

    private async fetchTwitterTrends(): Promise<PlatformTrends> {
        try {
            const response = await axios.get(`${API_CONFIG.twitter.baseUrl}/trends/place.json`, {
                headers: {
                    'Authorization': `Bearer ${API_CONFIG.twitter.bearerToken}`
                },
                params: {
                    id: 1 // Worldwide trends
                }
            });

            const trends: TrendData[] = response.data[0].trends.map((trend: any) => ({
                keyword: trend.name,
                volume: trend.tweet_volume || 0,
                growth: 0, // Twitter doesn't provide growth rate directly
                platform: 'Twitter',
                category: trend.promoted_content ? 'sponsored' : 'organic',
                timestamp: new Date(),
                relatedKeywords: [],
                sentiment: 0.5,
                engagement: {
                    likes: 0,
                    shares: 0,
                    comments: 0,
                    views: trend.tweet_volume || 0
                }
            }));

            return {
                platform: 'Twitter',
                trends,
                marketInsights: await this.analyzeMarketInsights(trends)
            };
        } catch (error) {
            logger.error('Error fetching Twitter trends:', error);
            return this.getEmptyPlatformTrends('Twitter');
        }
    }

    private async fetchInstagramTrends(): Promise<PlatformTrends> {
        try {
            // Instagram Basic Display API for hashtag trends
            const response = await axios.get(`${API_CONFIG.instagram.baseUrl}/hashtag/search`, {
                headers: {
                    'Authorization': `Bearer ${API_CONFIG.instagram.accessToken}`
                },
                params: {
                    q: 'trending',
                    fields: 'id,name,media_count'
                }
            });

            const trends: TrendData[] = response.data.data.map((hashtag: any) => ({
                keyword: hashtag.name,
                volume: hashtag.media_count || 0,
                growth: 0,
                platform: 'Instagram',
                category: 'lifestyle',
                timestamp: new Date(),
                relatedKeywords: [],
                sentiment: 0.6, // Instagram tends to be more positive
                engagement: {
                    likes: 0,
                    shares: 0,
                    comments: 0,
                    views: hashtag.media_count || 0
                }
            }));

            return {
                platform: 'Instagram',
                trends,
                marketInsights: await this.analyzeMarketInsights(trends)
            };
        } catch (error) {
            logger.error('Error fetching Instagram trends:', error);
            return this.getEmptyPlatformTrends('Instagram');
        }
    }

    private async fetchYouTubeTrends(): Promise<PlatformTrends> {
        try {
            const response = await axios.get(`${API_CONFIG.youtube.baseUrl}/videos`, {
                params: {
                    part: 'snippet,statistics',
                    chart: 'mostPopular',
                    regionCode: 'US',
                    maxResults: 50,
                    key: API_CONFIG.youtube.apiKey
                }
            });

            const trends: TrendData[] = response.data.items.map((video: any) => ({
                keyword: video.snippet.title,
                volume: parseInt(video.statistics.viewCount) || 0,
                growth: 0,
                platform: 'YouTube',
                category: video.snippet.categoryId,
                timestamp: new Date(video.snippet.publishedAt),
                relatedKeywords: video.snippet.tags || [],
                sentiment: 0.5,
                engagement: {
                    likes: parseInt(video.statistics.likeCount) || 0,
                    shares: 0,
                    comments: parseInt(video.statistics.commentCount) || 0,
                    views: parseInt(video.statistics.viewCount) || 0
                }
            }));

            return {
                platform: 'YouTube',
                trends,
                marketInsights: await this.analyzeMarketInsights(trends)
            };
        } catch (error) {
            logger.error('Error fetching YouTube trends:', error);
            return this.getEmptyPlatformTrends('YouTube');
        }
    }

    private async fetchRedditTrends(): Promise<PlatformTrends> {
        try {
            const response = await axios.get(`${API_CONFIG.reddit.baseUrl}/subreddits/popular`, {
                headers: {
                    'User-Agent': 'ContentFactory/1.0'
                },
                params: {
                    limit: 50
                }
            });

            const trends: TrendData[] = response.data.data.children.map((subreddit: any) => ({
                keyword: subreddit.data.display_name,
                volume: subreddit.data.subscribers || 0,
                growth: 0,
                platform: 'Reddit',
                category: subreddit.data.subreddit_type,
                timestamp: new Date(),
                relatedKeywords: [],
                sentiment: 0.5,
                engagement: {
                    likes: subreddit.data.ups || 0,
                    shares: 0,
                    comments: subreddit.data.num_comments || 0,
                    views: subreddit.data.subscribers || 0
                }
            }));

            return {
                platform: 'Reddit',
                trends,
                marketInsights: await this.analyzeMarketInsights(trends)
            };
        } catch (error) {
            logger.error('Error fetching Reddit trends:', error);
            return this.getEmptyPlatformTrends('Reddit');
        }
    }

    private async fetchPinterestTrends(): Promise<PlatformTrends> {
        // Pinterest trends would require special API access
        return this.getEmptyPlatformTrends('Pinterest');
    }

    private async fetchSnapchatTrends(): Promise<PlatformTrends> {
        // Snapchat trends would require special API access
        return this.getEmptyPlatformTrends('Snapchat');
    }

    private async fetchNicheTrends(platform: string, keywords: string[]): Promise<PlatformTrends> {
        // Implementation for niche-specific trend fetching
        const trends = await this.fetchTrends(platform);
        const filteredTrends = trends.trends.filter(trend => 
            keywords.some(keyword => 
                trend.keyword.toLowerCase().includes(keyword.toLowerCase()) ||
                trend.relatedKeywords.some(related => 
                    related.toLowerCase().includes(keyword.toLowerCase())
                )
            )
        );

        return {
            ...trends,
            trends: filteredTrends
        };
    }

    private async generateNicheKeywords(niche: string): Promise<string[]> {
        const baseKeywords = [niche];
        
        // Add related keywords based on niche
        const nicheMap: Record<string, string[]> = {
            'gaming': ['esports', 'streaming', 'gamer', 'gameplay', 'review'],
            'fitness': ['workout', 'gym', 'health', 'training', 'exercise'],
            'music': ['song', 'artist', 'album', 'concert', 'playlist'],
            'tech': ['technology', 'gadget', 'review', 'tutorial', 'innovation'],
            'food': ['recipe', 'cooking', 'restaurant', 'chef', 'cuisine']
        };

        const related = nicheMap[niche.toLowerCase()] || [];
        return [...baseKeywords, ...related];
    }

    private async analyzeMarketInsights(trends: TrendData[]): Promise<any> {
        const categories = trends.reduce((acc, trend) => {
            acc[trend.category] = (acc[trend.category] || 0) + trend.volume;
            return acc;
        }, {} as Record<string, number>);

        const topCategories = Object.entries(categories)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([category]) => category);

        const emergingNiches = trends
            .filter(trend => trend.growth > 50)
            .sort((a, b) => b.growth - a.growth)
            .slice(0, 10)
            .map(trend => trend.keyword);

        const declining = trends
            .filter(trend => trend.growth < -20)
            .sort((a, b) => a.growth - b.growth)
            .slice(0, 5)
            .map(trend => trend.keyword);

        return {
            topCategories,
            emergingNiches,
            declining
        };
    }

    private async checkRateLimit(platform: string): Promise<boolean> {
        const now = Date.now();
        const lastReq = this.lastRequest.get(platform) || 0;
        const limit = this.rateLimit.get(platform) || 100;
        const hourInMs = 60 * 60 * 1000;

        if (now - lastReq < hourInMs / limit) {
            return false;
        }

        this.lastRequest.set(platform, now);
        return true;
    }

    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    private getEmptyPlatformTrends(platform: string): PlatformTrends {
        return {
            platform,
            trends: [],
            marketInsights: {
                topCategories: [],
                emergingNiches: [],
                declining: []
            }
        };
    }
}