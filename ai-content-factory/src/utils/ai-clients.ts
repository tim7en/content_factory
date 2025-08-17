import axios, { AxiosInstance } from 'axios';
import { Avatar } from '../models/content.model';

type AIService = 'SUNO_AI' | 'HEYGEN';

const AI_SERVICES: Record<AIService, { baseURL: string; apiKey: string | undefined }> = {
    SUNO_AI: {
        baseURL: 'https://api.suno.ai',
        apiKey: process.env.SUNO_AI_API_KEY,
    },
    HEYGEN: {
        baseURL: 'https://api.heygen.com',
        apiKey: process.env.HEYGEN_API_KEY,
    },
};

const createAIClient = (service: AIService): AxiosInstance => {
    const { baseURL, apiKey } = AI_SERVICES[service];

    if (!baseURL || !apiKey) {
        throw new Error(`Missing configuration for ${service}`);
    }

    return axios.create({
        baseURL,
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
        },
    });
};

export const sunoAIClient = createAIClient('SUNO_AI');
export const heyGenClient = createAIClient('HEYGEN');

// AI generation functions
export const generateAvatar = async (properties: any): Promise<string> => {
    try {
        const response = await heyGenClient.post('/avatars/generate', properties);
        return response.data.avatarUrl || 'https://example.com/avatar.png';
    } catch (error) {
        console.error('Avatar generation failed:', error);
        return 'https://example.com/default-avatar.png';
    }
};

export const generateMusic = async (prompt: string): Promise<string> => {
    try {
        const response = await sunoAIClient.post('/music/generate', { prompt });
        return response.data.musicUrl || 'https://example.com/music.mp3';
    } catch (error) {
        console.error('Music generation failed:', error);
        return 'https://example.com/default-music.mp3';
    }
};

export const generateMerchDesign = async (prompt: string): Promise<string> => {
    try {
        // Mock implementation - replace with actual AI design generation
        return `Design generated for: ${prompt}`;
    } catch (error) {
        console.error('Merch design generation failed:', error);
        return 'Default design';
    }
};