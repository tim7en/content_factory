export interface PerformanceMetrics {
    contentId: string;
    views: number;
    likes: number;
    shares: number;
    comments: number;
    watchTime: number; // in seconds
    engagementRate: number; // percentage
    createdAt: Date;
    updatedAt: Date;
}