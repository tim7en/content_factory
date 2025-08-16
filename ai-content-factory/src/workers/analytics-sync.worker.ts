import { Worker } from 'worker_threads';
import { performanceTracker } from '../services/analytics/performance-tracker';
import { engagementAnalyzer } from '../services/analytics/engagement-analyzer';

const analyticsSyncWorker = new Worker('./src/workers/analytics-sync.worker.ts');

analyticsSyncWorker.on('message', async (message) => {
    if (message === 'syncAnalytics') {
        try {
            const performanceData = await performanceTracker.trackPerformance();
            const engagementData = await engagementAnalyzer.analyzeEngagement();

            // Process and sync the data as needed
            console.log('Performance Data:', performanceData);
            console.log('Engagement Data:', engagementData);
        } catch (error) {
            console.error('Error syncing analytics data:', error);
        }
    }
});

analyticsSyncWorker.postMessage('syncAnalytics');