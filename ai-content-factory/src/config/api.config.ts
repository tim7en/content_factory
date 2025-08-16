import { config } from 'dotenv';

config();

export const API_CONFIG = {
    heyGen: {
        apiKey: process.env.HEYGEN_API_KEY,
        baseUrl: 'https://api.heygen.com/v1',
        endpoint: 'https://api.heygen.com/v1/avatars',
    },
    sunoAI: {
        apiKey: process.env.SUNO_AI_API_KEY,
        baseUrl: 'https://api.suno.ai/v1',
        endpoint: 'https://api.suno.ai/v1/music',
    },
    youtube: {
        apiKey: process.env.YOUTUBE_API_KEY,
        baseUrl: 'https://www.googleapis.com/youtube/v3',
        endpoint: 'https://www.googleapis.com/youtube/v3',
    },
    patreon: {
        clientId: process.env.PATREON_CLIENT_ID,
        clientSecret: process.env.PATREON_CLIENT_SECRET,
        baseUrl: 'https://www.patreon.com/api/oauth2',
        endpoint: 'https://www.patreon.com/api/oauth2',
    },
    googleTrends: {
        apiKey: process.env.GOOGLE_TRENDS_API_KEY,
        baseUrl: 'https://trends.googleapis.com/trends/api',
    },
    tiktok: {
        apiKey: process.env.TIKTOK_API_KEY,
        baseUrl: 'https://open-api.tiktok.com/platform/v1',
    },
    twitter: {
        apiKey: process.env.TWITTER_API_KEY,
        bearerToken: process.env.TWITTER_BEARER_TOKEN,
        baseUrl: 'https://api.twitter.com/1.1',
    },
    instagram: {
        accessToken: process.env.INSTAGRAM_ACCESS_TOKEN,
        baseUrl: 'https://graph.instagram.com',
    },
    reddit: {
        clientId: process.env.REDDIT_CLIENT_ID,
        clientSecret: process.env.REDDIT_CLIENT_SECRET,
        baseUrl: 'https://www.reddit.com',
    },
    openai: {
        apiKey: process.env.OPENAI_API_KEY,
        baseUrl: 'https://api.openai.com/v1',
    },
    spotify: {
        clientId: process.env.SPOTIFY_CLIENT_ID,
        clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
        baseUrl: 'https://api.spotify.com/v1',
    }
};

export default API_CONFIG;