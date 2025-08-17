import { Avatar } from '../../models/content.model';
import { generateMerchDesign } from '../../utils/ai-clients';

export class MerchGenerator {
    private avatar: Avatar;

    constructor(avatar: Avatar) {
        this.avatar = avatar;
    }

    public async createMerch(): Promise<string> {
        try {
            const design = await this.generateDesign();
            return design;
        } catch (error) {
            console.error('Error generating merchandise:', error);
            throw new Error('Merchandise generation failed');
        }
    }

    public async createMerchandise(): Promise<string> {
        return this.createMerch();
    }

    private async generateDesign(): Promise<string> {
        const designPrompt = this.createDesignPrompt();
        return await generateMerchDesign(designPrompt);
    }

    private createDesignPrompt(): string {
        return `Create a merchandise design featuring the avatar named ${this.avatar.name} with the following characteristics: ${this.avatar.description}.`;
    }
}