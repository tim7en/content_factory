import { generateMusic } from '../../utils/ai-clients';
import { API_CONFIG } from '../../config/api.config';

interface MusicGenerationOptions {
    lyrics: string;
    style: string;
    tempo: string;
    mood: string;
}

export class MusicGenerator {
    public async generateMusic(options: MusicGenerationOptions): Promise<string> {
        try {
            // Use Suno AI to generate music
            return await generateMusic(`Create music in ${options.style} style with ${options.tempo} tempo, mood: ${options.mood}. Lyrics: ${options.lyrics}`);
        } catch (error) {
            console.error('Music generation failed:', error);
            return 'https://example.com/default-music.mp3';
        }
    }

    public async createMusicTrack(theme: string, mood: string, genre: string): Promise<string> {
        const options: MusicGenerationOptions = {
            lyrics: theme,
            style: genre,
            tempo: 'medium',
            mood
        };
        return this.generateMusic(options);
    }
}