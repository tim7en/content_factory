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

export interface WorkflowStep {
    id: string;
    name: string;
    description: string;
    status: 'pending' | 'running' | 'completed' | 'failed' | 'paused';
    progress: number; // 0-100
    startTime?: Date;
    endTime?: Date;
    error?: string;
    data?: any;
}

export interface WorkflowProgress {
    workflowId: string;
    currentStepIndex: number;
    steps: WorkflowStep[];
    overallProgress: number;
    status: 'initializing' | 'running' | 'paused' | 'completed' | 'failed';
    startTime: Date;
    endTime?: Date;
    canPause: boolean;
    canResume: boolean;
    allowStepNavigation: boolean;
}

export interface WorkflowControlRequest {
    action: 'pause' | 'resume' | 'goto' | 'restart';
    stepIndex?: number;
}