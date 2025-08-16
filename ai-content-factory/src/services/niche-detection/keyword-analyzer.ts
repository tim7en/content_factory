import axios from 'axios';
import { API_CONFIG } from '../../config/api.config';
import { logger } from '../../utils/logger';

export interface KeywordAnalysisResult {
    keyword: string;
    searchVolume: number;
    competition: number;
    cpc: number; // Cost per click
    difficulty: number;
    trend: number[];
    relatedKeywords: string[];
    questions: string[];
    longtailVariations: string[];
    semanticKeywords: string[];
    platforms: {
        platform: string;
        volume: number;
        growth: number;
        difficulty: number;
    }[];
    contentOpportunities: {
        title: string;
        type: string;
        difficulty: number;
        potential: number;
    }[];
}

export interface KeywordCluster {
    mainKeyword: string;
    clusterKeywords: string[];
    totalVolume: number;
    averageCompetition: number;
    contentPotential: number;
}

export class KeywordAnalyzer {
    private rateLimitDelay: number = 1000; // 1 second between requests
    private lastRequestTime: number = 0;

    constructor() {}

    public async analyzeKeywords(keywords: string[]): Promise<KeywordAnalysisResult[]> {
        const results: KeywordAnalysisResult[] = [];

        for (const keyword of keywords) {
            try {
                await this.respectRateLimit();
                const analysis = await this.analyzeKeyword(keyword);
                results.push(analysis);
                logger.info(`Analyzed keyword: ${keyword}`);
            } catch (error) {
                logger.error(`Error analyzing keyword ${keyword}:`, error);
                // Continue with other keywords even if one fails
                results.push(this.getEmptyAnalysis(keyword));
            }
        }

        return results;
    }

    public async generateKeywordClusters(keywords: string[]): Promise<KeywordCluster[]> {
        const analysisResults = await this.analyzeKeywords(keywords);
        return this.clusterKeywords(analysisResults);
    }

    public async findNicheKeywords(niche: string, count: number = 50): Promise<string[]> {
        try {
            const seedKeywords = await this.generateSeedKeywords(niche);
            const expandedKeywords = await this.expandKeywords(seedKeywords);
            const filteredKeywords = await this.filterKeywordsByVolume(expandedKeywords, count);
            
            return filteredKeywords;
        } catch (error) {
            logger.error(`Error finding niche keywords for ${niche}:`, error);
            return [];
        }
    }

    public async analyzeCompetitorKeywords(competitorUrls: string[]): Promise<string[]> {
        const allKeywords: string[] = [];

        for (const url of competitorUrls) {
            try {
                const keywords = await this.extractKeywordsFromUrl(url);
                allKeywords.push(...keywords);
            } catch (error) {
                logger.error(`Error analyzing competitor keywords from ${url}:`, error);
            }
        }

        // Remove duplicates and return top keywords
        const uniqueKeywords = [...new Set(allKeywords)];
        return uniqueKeywords.slice(0, 100);
    }

    private async analyzeKeyword(keyword: string): Promise<KeywordAnalysisResult> {
        const [
            basicData,
            googleData,
            youtubeData,
            tiktokData,
            relatedKeywords,
            questions
        ] = await Promise.all([
            this.getBasicKeywordData(keyword),
            this.getGoogleKeywordData(keyword),
            this.getYouTubeKeywordData(keyword),
            this.getTikTokKeywordData(keyword),
            this.getRelatedKeywords(keyword),
            this.getKeywordQuestions(keyword)
        ]);

        return {
            keyword,
            searchVolume: basicData.searchVolume,
            competition: basicData.competition,
            cpc: basicData.cpc,
            difficulty: basicData.difficulty,
            trend: basicData.trend,
            relatedKeywords: relatedKeywords,
            questions: questions,
            longtailVariations: await this.generateLongtailVariations(keyword),
            semanticKeywords: await this.getSemanticKeywords(keyword),
            platforms: [
                {
                    platform: 'Google',
                    volume: googleData.volume,
                    growth: googleData.growth,
                    difficulty: googleData.difficulty
                },
                {
                    platform: 'YouTube',
                    volume: youtubeData.volume,
                    growth: youtubeData.growth,
                    difficulty: youtubeData.difficulty
                },
                {
                    platform: 'TikTok',
                    volume: tiktokData.volume,
                    growth: tiktokData.growth,
                    difficulty: tiktokData.difficulty
                }
            ],
            contentOpportunities: await this.generateContentOpportunities(keyword, basicData)
        };
    }

    private async getBasicKeywordData(keyword: string): Promise<any> {
        try {
            // Use multiple keyword research APIs for comprehensive data
            const response = await axios.get(`${API_CONFIG.openai.baseUrl}/completions`, {
                headers: {
                    'Authorization': `Bearer ${API_CONFIG.openai.apiKey}`,
                    'Content-Type': 'application/json'
                },
                data: {
                    model: 'gpt-3.5-turbo',
                    messages: [{
                        role: 'user',
                        content: `Analyze the keyword "${keyword}" and provide search volume estimation, competition level (0-100), CPC estimation, difficulty score (0-100), and trend data. Return as JSON.`
                    }],
                    max_tokens: 500
                }
            });

            // Parse AI response or use fallback data
            return this.parseKeywordResponse(response.data, keyword);
        } catch (error) {
            logger.error(`Error getting basic keyword data for ${keyword}:`, error);
            return this.getDefaultKeywordData(keyword);
        }
    }

    private async getGoogleKeywordData(keyword: string): Promise<any> {
        try {
            // Google Keyword Planner API or Google Trends API
            const response = await axios.get(`${API_CONFIG.googleTrends.baseUrl}/explore`, {
                params: {
                    keyword: keyword,
                    geo: 'US',
                    time: 'today 12-m'
                }
            });

            return {
                volume: this.extractVolumeFromTrends(response.data),
                growth: this.calculateGrowthRate(response.data),
                difficulty: this.calculateDifficulty(response.data)
            };
        } catch (error) {
            return { volume: 0, growth: 0, difficulty: 50 };
        }
    }

    private async getYouTubeKeywordData(keyword: string): Promise<any> {
        try {
            const response = await axios.get(`${API_CONFIG.youtube.baseUrl}/search`, {
                params: {
                    part: 'snippet',
                    q: keyword,
                    type: 'video',
                    maxResults: 50,
                    key: API_CONFIG.youtube.apiKey
                }
            });

            const videos = response.data.items;
            const totalViews = videos.reduce((sum: number, video: any) => {
                return sum + (parseInt(video.statistics?.viewCount) || 0);
            }, 0);

            return {
                volume: totalViews,
                growth: 0, // Would need historical data
                difficulty: Math.min(100, videos.length * 2) // More results = higher competition
            };
        } catch (error) {
            return { volume: 0, growth: 0, difficulty: 50 };
        }
    }

    private async getTikTokKeywordData(keyword: string): Promise<any> {
        try {
            // TikTok Research API (if available)
            const response = await axios.get(`${API_CONFIG.tiktok.baseUrl}/research/hashtag/info`, {
                headers: {
                    'Authorization': `Bearer ${API_CONFIG.tiktok.apiKey}`
                },
                params: {
                    hashtag_name: keyword.replace(/\s+/g, ''),
                    fields: ['hashtag_name', 'video_count', 'view_count']
                }
            });

            return {
                volume: response.data.data?.view_count || 0,
                growth: 0,
                difficulty: Math.min(100, (response.data.data?.video_count || 0) / 1000)
            };
        } catch (error) {
            return { volume: 0, growth: 0, difficulty: 30 };
        }
    }

    private async getRelatedKeywords(keyword: string): Promise<string[]> {
        try {
            const response = await axios.post(`${API_CONFIG.openai.baseUrl}/chat/completions`, {
                model: 'gpt-3.5-turbo',
                messages: [{
                    role: 'user',
                    content: `Generate 20 related keywords for "${keyword}". Return as a simple array of strings.`
                }],
                max_tokens: 300
            }, {
                headers: {
                    'Authorization': `Bearer ${API_CONFIG.openai.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });

            const content = response.data.choices[0].message.content;
            return this.parseKeywordList(content);
        } catch (error) {
            return [];
        }
    }

    private async getKeywordQuestions(keyword: string): Promise<string[]> {
        try {
            const response = await axios.post(`${API_CONFIG.openai.baseUrl}/chat/completions`, {
                model: 'gpt-3.5-turbo',
                messages: [{
                    role: 'user',
                    content: `Generate 10 questions people might search for related to "${keyword}". Return as a simple list.`
                }],
                max_tokens: 300
            }, {
                headers: {
                    'Authorization': `Bearer ${API_CONFIG.openai.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });

            const content = response.data.choices[0].message.content;
            return this.parseQuestionList(content);
        } catch (error) {
            return [];
        }
    }

    private async generateLongtailVariations(keyword: string): Promise<string[]> {
        const modifiers = [
            'how to', 'best', 'top', 'guide', 'tutorial', 'review', 'vs', 'comparison',
            'for beginners', 'advanced', 'tips', 'tricks', 'secrets', 'ultimate',
            '2024', '2025', 'free', 'cheap', 'expensive', 'professional'
        ];

        const variations: string[] = [];
        modifiers.forEach(modifier => {
            variations.push(`${modifier} ${keyword}`);
            variations.push(`${keyword} ${modifier}`);
        });

        return variations.slice(0, 20);
    }

    private async getSemanticKeywords(keyword: string): Promise<string[]> {
        try {
            const response = await axios.post(`${API_CONFIG.openai.baseUrl}/chat/completions`, {
                model: 'gpt-3.5-turbo',
                messages: [{
                    role: 'user',
                    content: `Generate semantically related keywords for "${keyword}". Include synonyms, related concepts, and contextually similar terms. Return 15 keywords as a list.`
                }],
                max_tokens: 250
            }, {
                headers: {
                    'Authorization': `Bearer ${API_CONFIG.openai.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });

            const content = response.data.choices[0].message.content;
            return this.parseKeywordList(content);
        } catch (error) {
            return [];
        }
    }

    private async generateContentOpportunities(keyword: string, keywordData: any): Promise<any[]> {
        const opportunities = [];

        // Video content
        if (keywordData.searchVolume > 1000) {
            opportunities.push({
                title: `${keyword} Tutorial`,
                type: 'tutorial-video',
                difficulty: Math.min(keywordData.difficulty + 10, 100),
                potential: Math.max(100 - keywordData.competition, 20)
            });
        }

        // Short-form content
        opportunities.push({
            title: `${keyword} Tips`,
            type: 'short-form-video',
            difficulty: keywordData.difficulty - 20,
            potential: 80
        });

        // Blog content
        opportunities.push({
            title: `Ultimate Guide to ${keyword}`,
            type: 'blog-post',
            difficulty: keywordData.difficulty,
            potential: Math.max(90 - keywordData.competition, 30)
        });

        return opportunities.filter(opp => opp.potential > 20);
    }

    private clusterKeywords(analysisResults: KeywordAnalysisResult[]): KeywordCluster[] {
        const clusters: KeywordCluster[] = [];
        const used = new Set<string>();

        for (const result of analysisResults) {
            if (used.has(result.keyword)) continue;

            const cluster: KeywordCluster = {
                mainKeyword: result.keyword,
                clusterKeywords: [result.keyword],
                totalVolume: result.searchVolume,
                averageCompetition: result.competition,
                contentPotential: 0
            };

            // Find related keywords for this cluster
            for (const other of analysisResults) {
                if (used.has(other.keyword) || other.keyword === result.keyword) continue;

                if (this.areKeywordsSimilar(result.keyword, other.keyword) ||
                    result.relatedKeywords.includes(other.keyword) ||
                    other.relatedKeywords.includes(result.keyword)) {
                    
                    cluster.clusterKeywords.push(other.keyword);
                    cluster.totalVolume += other.searchVolume;
                    cluster.averageCompetition = (cluster.averageCompetition + other.competition) / 2;
                    used.add(other.keyword);
                }
            }

            cluster.contentPotential = this.calculateContentPotential(cluster);
            clusters.push(cluster);
            used.add(result.keyword);
        }

        return clusters.sort((a, b) => b.contentPotential - a.contentPotential);
    }

    private areKeywordsSimilar(keyword1: string, keyword2: string): boolean {
        const words1 = keyword1.toLowerCase().split(' ');
        const words2 = keyword2.toLowerCase().split(' ');
        const commonWords = words1.filter(word => words2.includes(word));
        return commonWords.length >= Math.min(words1.length, words2.length) * 0.6;
    }

    private calculateContentPotential(cluster: KeywordCluster): number {
        const volumeScore = Math.min(cluster.totalVolume / 10000, 50);
        const competitionScore = Math.max(50 - cluster.averageCompetition, 0);
        const clusterSizeScore = Math.min(cluster.clusterKeywords.length * 5, 25);
        
        return volumeScore + competitionScore + clusterSizeScore;
    }

    private async generateSeedKeywords(niche: string): Promise<string[]> {
        const seedKeywords = [niche];
        
        const nicheExpansions: Record<string, string[]> = {
            'gaming': ['esports', 'streaming', 'gameplay', 'review', 'walkthrough', 'tips'],
            'fitness': ['workout', 'exercise', 'training', 'diet', 'nutrition', 'gym'],
            'music': ['song', 'album', 'artist', 'genre', 'instrument', 'production'],
            'tech': ['technology', 'gadget', 'software', 'hardware', 'review', 'tutorial'],
            'food': ['recipe', 'cooking', 'baking', 'restaurant', 'cuisine', 'ingredients']
        };

        const expansions = nicheExpansions[niche.toLowerCase()] || [];
        return [...seedKeywords, ...expansions];
    }

    private async expandKeywords(seedKeywords: string[]): Promise<string[]> {
        const expanded: string[] = [...seedKeywords];

        for (const seed of seedKeywords) {
            const related = await this.getRelatedKeywords(seed);
            expanded.push(...related);
        }

        return [...new Set(expanded)]; // Remove duplicates
    }

    private async filterKeywordsByVolume(keywords: string[], count: number): Promise<string[]> {
        const analyzed = await this.analyzeKeywords(keywords);
        return analyzed
            .sort((a, b) => b.searchVolume - a.searchVolume)
            .slice(0, count)
            .map(result => result.keyword);
    }

    private async extractKeywordsFromUrl(url: string): Promise<string[]> {
        // This would use web scraping to extract keywords from competitor pages
        // Implementation would depend on the specific scraping library used
        return [];
    }

    private async respectRateLimit(): Promise<void> {
        const now = Date.now();
        const timeSinceLastRequest = now - this.lastRequestTime;
        
        if (timeSinceLastRequest < this.rateLimitDelay) {
            await new Promise(resolve => setTimeout(resolve, this.rateLimitDelay - timeSinceLastRequest));
        }
        
        this.lastRequestTime = Date.now();
    }

    private parseKeywordResponse(response: any, keyword: string): any {
        // Parse AI response and extract keyword data
        try {
            const content = response.choices[0].message.content;
            const parsed = JSON.parse(content);
            return {
                searchVolume: parsed.searchVolume || 1000,
                competition: parsed.competition || 50,
                cpc: parsed.cpc || 1.0,
                difficulty: parsed.difficulty || 50,
                trend: parsed.trend || [50, 55, 60, 58, 62, 65, 70]
            };
        } catch (error) {
            return this.getDefaultKeywordData(keyword);
        }
    }

    private getDefaultKeywordData(keyword: string): any {
        return {
            searchVolume: 1000,
            competition: 50,
            cpc: 1.0,
            difficulty: 50,
            trend: [50, 55, 60, 58, 62, 65, 70]
        };
    }

    private getEmptyAnalysis(keyword: string): KeywordAnalysisResult {
        return {
            keyword,
            searchVolume: 0,
            competition: 0,
            cpc: 0,
            difficulty: 0,
            trend: [],
            relatedKeywords: [],
            questions: [],
            longtailVariations: [],
            semanticKeywords: [],
            platforms: [],
            contentOpportunities: []
        };
    }

    private parseKeywordList(content: string): string[] {
        // Extract keywords from AI response
        const lines = content.split('\n');
        return lines
            .map(line => line.replace(/^\d+\.\s*|-\s*|\*\s*/, '').trim())
            .filter(line => line.length > 0 && line.length < 100)
            .slice(0, 20);
    }

    private parseQuestionList(content: string): string[] {
        const lines = content.split('\n');
        return lines
            .map(line => line.replace(/^\d+\.\s*|-\s*|\*\s*/, '').trim())
            .filter(line => line.includes('?') && line.length > 10)
            .slice(0, 10);
    }

    private extractVolumeFromTrends(data: any): number {
        // Extract search volume from Google Trends data
        return 1000; // Placeholder
    }

    private calculateGrowthRate(data: any): number {
        // Calculate growth rate from trend data
        return 0; // Placeholder
    }

    private calculateDifficulty(data: any): number {
        // Calculate keyword difficulty from competition data
        return 50; // Placeholder
    }
}

export default KeywordAnalyzer;