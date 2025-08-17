export interface EngagementData {
    contentId: string;
    engagementRate: number;
    interactions: number;
    shares: number;
    comments: number;
    likes: number;
    timestamp: Date;
}

export interface EngagementMetrics {
    contentId: string;
    engagementScore: number;
    date: Date;
    platform: string;
    interactions: {
        likes: number;
        comments: number;
        shares: number;
        views: number;
    };
}

export interface PerformanceData {
    contentId: string;
    views: number;
    likes: number;
    comments: number;
    shares: number;
    engagementRate: number;
    timestamp: Date;
    platform: string;
}