import { Request, Response } from 'express';
import { PerformanceTracker } from '../services/analytics/performance-tracker';
import { EngagementAnalyzer } from '../services/analytics/engagement-analyzer';
import { ReportGenerator } from '../services/analytics/report-generator';

export class AnalyticsController {
    private performanceTracker: PerformanceTracker;
    private engagementAnalyzer: EngagementAnalyzer;
    private reportGenerator: ReportGenerator;

    constructor() {
        this.performanceTracker = new PerformanceTracker();
        this.engagementAnalyzer = new EngagementAnalyzer();
        this.reportGenerator = new ReportGenerator();
    }

    public async getPerformanceMetrics(req: Request, res: Response): Promise<void> {
        try {
            const metrics = await this.performanceTracker.trackMetrics();
            res.status(200).json(metrics);
        } catch (error) {
            res.status(500).json({ message: 'Error retrieving performance metrics', error });
        }
    }

    public async analyzeEngagement(req: Request, res: Response): Promise<void> {
        try {
            const engagementData = await this.engagementAnalyzer.analyze();
            res.status(200).json(engagementData);
        } catch (error) {
            res.status(500).json({ message: 'Error analyzing engagement', error });
        }
    }

    public async generateReport(req: Request, res: Response): Promise<void> {
        try {
            const report = await this.reportGenerator.generate();
            res.status(200).json(report);
        } catch (error) {
            res.status(500).json({ message: 'Error generating report', error });
        }
    }
}