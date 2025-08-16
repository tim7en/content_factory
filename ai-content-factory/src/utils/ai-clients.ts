import axios from 'axios';

const AI_SERVICES = {
    SUNO_AI: {
        baseURL: 'https://api.suno.ai',
        apiKey: process.env.SUNO_AI_API_KEY,
    },
    HEYGEN: {
        baseURL: 'https://api.heygen.com',
        apiKey: process.env.HEYGEN_API_KEY,
    },
    // Add more AI services as needed
};

const createAIClient = (service) => {
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