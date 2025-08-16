export interface Niche {
    id: string;
    name: string;
    description: string;
    trends: string[];
}

export interface Content {
    id: string;
    title: string;
    description: string;
    type: 'video' | 'music' | 'avatar';
    createdAt: Date;
    updatedAt: Date;
}

export interface PerformanceMetrics {
    contentId: string;
    views: number;
    likes: number;
    comments: number;
    shares: number;
    engagementRate: number;
}

export interface Revenue {
    source: 'ads' | 'subscriptions' | 'merch' | 'streaming';
    amount: number;
    date: Date;
}

export interface Avatar {
    id: string;
    name: string;
    style: string;
    properties: Record<string, any>;
}

export interface MusicTrack {
    id: string;
    title: string;
    artist: string;
    genre: string;
    duration: number; // in seconds
    releaseDate: Date;
}