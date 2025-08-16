import { SocialMediaAPI } from '../utils/ai-clients';
import { ContentModel } from '../models/content.model';

class SocialMediaManager {
    private apiClient: SocialMediaAPI;

    constructor() {
        this.apiClient = new SocialMediaAPI();
    }

    public async publishContent(content: ContentModel, platforms: string[]): Promise<void> {
        for (const platform of platforms) {
            try {
                await this.apiClient.publish(content, platform);
                console.log(`Content published to ${platform}`);
            } catch (error) {
                console.error(`Failed to publish to ${platform}:`, error);
            }
        }
    }

    public async schedulePost(content: ContentModel, platform: string, scheduleTime: Date): Promise<void> {
        try {
            await this.apiClient.schedule(content, platform, scheduleTime);
            console.log(`Post scheduled for ${platform} at ${scheduleTime}`);
        } catch (error) {
            console.error(`Failed to schedule post for ${platform}:`, error);
        }
    }

    public async trackEngagement(contentId: string, platform: string): Promise<void> {
        try {
            const engagementData = await this.apiClient.getEngagement(contentId, platform);
            console.log(`Engagement data for ${platform}:`, engagementData);
        } catch (error) {
            console.error(`Failed to track engagement for ${platform}:`, error);
        }
    }
}

export default SocialMediaManager;