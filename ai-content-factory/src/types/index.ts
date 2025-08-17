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

export interface AvatarProperties {
    gender: string;
    age: string;
    style: string;
    voice?: string;
    description?: string;
}

export interface MusicTrack {
    id: string;
    title: string;
    artist: string;
    genre: string;
    duration: number; // in seconds
    releaseDate: Date;
}

export interface ContentCreationRequest {
    niche?: string;
    theme?: string;
    style?: string;
    platforms?: string[];
    targetPlatforms?: string[];
    duration?: number;
    autoPublish?: boolean;
    contentType?: string;
}

export interface AutomatedWorkflowConfig {
    platforms: string[];
    schedule: string;
    contentTypes: string[];
    targetAudience?: string;
    contentPerDay?: number;
    nicheSelection?: 'trending' | 'emerging' | 'stable' | 'custom';
    customNiches?: string[];
}