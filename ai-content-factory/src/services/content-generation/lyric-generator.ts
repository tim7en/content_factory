import { API_CONFIG } from '../../config/api.config';
import axios from 'axios';

interface LyricGeneratorOptions {
    theme: string;
    style: string;
    verses?: number;
    chorus?: boolean;
    niche?: string;
}

export class LyricGenerator {
    public async generateLyrics(options: LyricGeneratorOptions): Promise<string> {
        try {
            const response = await axios.post(`${API_CONFIG.openai.baseUrl}/chat/completions`, {
                model: 'gpt-3.5-turbo',
                messages: [{
                    role: 'user',
                    content: `Generate lyrics for a song with theme: "${options.theme}", style: "${options.style}", niche: "${options.niche || 'general'}". Make it engaging and creative.`
                }],
                max_tokens: 500
            }, {
                headers: {
                    'Authorization': `Bearer ${API_CONFIG.openai.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });

            return response.data.choices[0].message.content || 'Default lyrics content';
        } catch (error) {
            console.error('Lyric generation failed:', error);
            return `[Verse 1]\nDefault lyrics for ${options.theme}\nIn the style of ${options.style}\n\n[Chorus]\nGenerated content here\nMade for ${options.niche || 'everyone'}`;
        }
    }
}

export default LyricGenerator;