import { generateAvatar } from '../../utils/ai-clients';

export interface AvatarProperties {
    gender: string;
    age: string;
    style: string;
    voice?: string;
    description?: string;
}

export class AvatarGenerator {
    async createAvatar(properties: AvatarProperties): Promise<string> {
        try {
            const avatarUrl = await generateAvatar(properties);
            return avatarUrl;
        } catch (error) {
            throw new Error(`Avatar generation failed: ${(error as Error).message}`);
        }
    }

    async generateAvatar(properties: AvatarProperties): Promise<{ avatarUrl: string }> {
        const avatarUrl = await this.createAvatar(properties);
        return { avatarUrl };
    }
}

export default new AvatarGenerator();