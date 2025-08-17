import { PerformanceMetrics } from '../../models/performance.model';

export class AnalyticsService {
    private metricsStorage: Map<string, PerformanceMetrics> = new Map();

    public saveMetrics(metrics: PerformanceMetrics): void {
        this.metricsStorage.set(metrics.contentId, metrics);
    }

    public getMetricsByContentId(contentId: string): PerformanceMetrics | null {
        return this.metricsStorage.get(contentId) || null;
    }

    public getTrends(): Record<string, any> {
        const trends: Record<string, any> = {};
        
        this.metricsStorage.forEach((metrics, contentId) => {
            trends[contentId] = {
                engagementTrend: this.calculateEngagementTrend(metrics),
                viewsTrend: this.calculateViewsTrend(metrics)
            };
        });

        return trends;
    }

    private calculateEngagementTrend(metrics: PerformanceMetrics): string {
        // Simple trend calculation based on engagement rate
        if (metrics.engagementRate > 10) return 'high';
        if (metrics.engagementRate > 5) return 'medium';
        return 'low';
    }

    private calculateViewsTrend(metrics: PerformanceMetrics): string {
        // Simple trend calculation based on views
        if (metrics.views > 10000) return 'viral';
        if (metrics.views > 1000) return 'trending';
        return 'normal';
    }
}