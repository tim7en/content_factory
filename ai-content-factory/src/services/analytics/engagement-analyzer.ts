import { EngagementMetrics } from '../../models/performance.model';

export class EngagementAnalyzer {
    private metrics: EngagementMetrics[];

    constructor(metrics: EngagementMetrics[] = []) {
        this.metrics = metrics;
    }

    public analyzeEngagement(): { averageEngagement: number; engagementTrends: Record<string, number> } {
        if (this.metrics.length === 0) {
            return { averageEngagement: 0, engagementTrends: {} };
        }

        const totalEngagement = this.metrics.reduce((sum, metric) => sum + metric.engagementScore, 0);
        const averageEngagement = totalEngagement / this.metrics.length;

        const engagementTrends: Record<string, number> = {};
        this.metrics.forEach(metric => {
            const date = metric.date.toISOString().split('T')[0]; // Format date as YYYY-MM-DD
            engagementTrends[date] = (engagementTrends[date] || 0) + metric.engagementScore;
        });

        return { averageEngagement, engagementTrends };
    }

    public async analyze(): Promise<any> {
        return this.analyzeEngagement();
    }

    public addMetrics(newMetrics: EngagementMetrics[]): void {
        this.metrics.push(...newMetrics);
    }

    public getMetrics(): EngagementMetrics[] {
        return this.metrics;
    }
}