import { AvatarProperties } from '../../types';
import { generateAvatar } from '../../utils/ai-clients';

class AvatarGenerator {
    async createAvatar(properties: AvatarProperties): Promise<string> {
        try {
            const avatarUrl = await generateAvatar(properties);
            return avatarUrl;
        } catch (error) {
            throw new Error(`Avatar generation failed: ${error.message}`);
        }
    }
}

export default new AvatarGenerator();