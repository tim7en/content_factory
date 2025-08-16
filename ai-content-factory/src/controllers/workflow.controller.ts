import { Request, Response } from 'express';
import { LyricGenerator } from '../services/content-generation/lyric-generator';
import { MusicGenerator } from '../services/content-generation/music-generator';
import { AvatarGenerator } from '../services/content-generation/avatar-generator';
import { VideoAssembler } from '../services/content-generation/video-assembler';
import { PerformanceTracker } from '../services/analytics/performance-tracker';
import { EngagementAnalyzer } from '../services/analytics/engagement-analyzer';

export class WorkflowController {
    private lyricGenerator: LyricGenerator;
    private musicGenerator: MusicGenerator;
    private avatarGenerator: AvatarGenerator;
    private videoAssembler: VideoAssembler;
    private performanceTracker: PerformanceTracker;
    private engagementAnalyzer: EngagementAnalyzer;

    constructor() {
        this.lyricGenerator = new LyricGenerator();
        this.musicGenerator = new MusicGenerator();
        this.avatarGenerator = new AvatarGenerator();
        this.videoAssembler = new VideoAssembler();
        this.performanceTracker = new PerformanceTracker();
        this.engagementAnalyzer = new EngagementAnalyzer();
    }

    public async createContent(req: Request, res: Response): Promise<void> {
        try {
            const { theme, mood, avatarProperties } = req.body;

            const lyrics = await this.lyricGenerator.generateLyrics(theme);
            const music = await this.musicGenerator.generateMusic(lyrics, mood);
            const avatar = await this.avatarGenerator.generateAvatar(avatarProperties);
            const video = await this.videoAssembler.assembleVideo(music, avatar);

            res.status(201).json({ video });
        } catch (error) {
            res.status(500).json({ error: 'Content creation failed' });
        }
    }

    public async analyzePerformance(req: Request, res: Response): Promise<void> {
        try {
            const performanceData = await this.performanceTracker.trackPerformance();
            const engagementData = await this.engagementAnalyzer.analyzeEngagement();

            res.status(200).json({ performanceData, engagementData });
        } catch (error) {
            res.status(500).json({ error: 'Performance analysis failed' });
        }
    }
}