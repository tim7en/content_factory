import { PerformanceMetrics } from '../../models/performance.model';
import { AnalyticsService } from './analytics.service';

export class PerformanceTracker {
    private analyticsService: AnalyticsService;

    constructor() {
        this.analyticsService = new AnalyticsService();
    }

    public trackPerformance(metrics: PerformanceMetrics): void {
        // Logic to track performance metrics
        this.analyticsService.saveMetrics(metrics);
    }

    public getPerformanceReport(contentId: string): PerformanceMetrics | null {
        // Logic to retrieve performance metrics for a specific content
        return this.analyticsService.getMetricsByContentId(contentId);
    }

    public analyzeTrends(): void {
        // Logic to analyze performance trends over time
        const trends = this.analyticsService.getTrends();
        console.log('Performance Trends:', trends);
    }

    public async trackMetrics(): Promise<PerformanceMetrics[]> {
        // Return all tracked metrics
        const trends = this.analyticsService.getTrends();
        return Object.keys(trends).map(contentId => {
            const metrics = this.analyticsService.getMetricsByContentId(contentId);
            return metrics!;
        }).filter(Boolean);
    }
}