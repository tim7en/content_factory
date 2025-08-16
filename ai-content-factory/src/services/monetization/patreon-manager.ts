import { PatreonClient } from 'patreon';
import { PatreonConfig } from '../../config/api.config';
import { RevenueTracker } from './revenue-tracker';

export class PatreonManager {
    private patreonClient: PatreonClient;
    private revenueTracker: RevenueTracker;

    constructor() {
        this.patreonClient = new PatreonClient(PatreonConfig.apiKey);
        this.revenueTracker = new RevenueTracker();
    }

    async createPatreonPost(content: string, tierId: string): Promise<void> {
        try {
            const response = await this.patreonClient.createPost({
                content,
                tierId,
            });
            console.log('Patreon post created:', response);
        } catch (error) {
            console.error('Error creating Patreon post:', error);
        }
    }

    async getPatreonSubscribers(): Promise<any> {
        try {
            const subscribers = await this.patreonClient.getSubscribers();
            return subscribers;
        } catch (error) {
            console.error('Error fetching Patreon subscribers:', error);
            return [];
        }
    }

    async trackRevenue(): Promise<void> {
        const revenue = await this.revenueTracker.calculatePatreonRevenue();
        console.log('Current Patreon revenue:', revenue);
    }
}