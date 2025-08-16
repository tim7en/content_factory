import { generateLyrics } from './lyric-generator';
import { MusicAIClient } from '../../utils/ai-clients';

export class MusicGenerator {
    private musicAIClient: MusicAIClient;

    constructor() {
        this.musicAIClient = new MusicAIClient();
    }

    public async createMusicTrack(theme: string, mood: string, genre: string): Promise<string> {
        const lyrics = await generateLyrics(theme);
        const musicTrack = await this.musicAIClient.generateTrack(lyrics, mood, genre);
        return musicTrack;
    }
}