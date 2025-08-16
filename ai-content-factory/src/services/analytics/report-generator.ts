import { PerformanceData } from '../../models/performance.model';
import { EngagementData } from '../../models/engagement.model';

export class ReportGenerator {
    constructor(private performanceData: PerformanceData[], private engagementData: EngagementData[]) {}

    generatePerformanceReport(): string {
        // Logic to generate performance report based on performanceData
        const report = this.performanceData.map(data => {
            return `Content ID: ${data.contentId}, Views: ${data.views}, Likes: ${data.likes}, Comments: ${data.comments}`;
        }).join('\n');

        return `Performance Report:\n${report}`;
    }

    generateEngagementReport(): string {
        // Logic to generate engagement report based on engagementData
        const report = this.engagementData.map(data => {
            return `Content ID: ${data.contentId}, Engagement Rate: ${data.engagementRate}`;
        }).join('\n');

        return `Engagement Report:\n${report}`;
    }

    generateFullReport(): string {
        const performanceReport = this.generatePerformanceReport();
        const engagementReport = this.generateEngagementReport();

        return `${performanceReport}\n\n${engagementReport}`;
    }
}