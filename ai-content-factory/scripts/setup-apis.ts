import { config } from 'dotenv';
import { writeFileSync } from 'fs';
import { join } from 'path';

// Load environment variables from .env file
config();

// Define API configurations
const apiConfig = {
    heyGenApiKey: process.env.HEYGEN_API_KEY || '',
    sunoAiApiKey: process.env.SUNO_AI_API_KEY || '',
    youtubeApiKey: process.env.YOUTUBE_API_KEY || '',
    patreonClientId: process.env.PATREON_CLIENT_ID || '',
    patreonClientSecret: process.env.PATREON_CLIENT_SECRET || '',
    spotifyClientId: process.env.SPOTIFY_CLIENT_ID || '',
    spotifyClientSecret: process.env.SPOTIFY_CLIENT_SECRET || '',
};

// Write API configurations to a JSON file
const outputPath = join(__dirname, '../src/config/api.config.json');
writeFileSync(outputPath, JSON.stringify(apiConfig, null, 2));

console.log('API configurations have been set up successfully.');