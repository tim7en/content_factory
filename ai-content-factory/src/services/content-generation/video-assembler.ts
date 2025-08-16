import { AvatarGenerator } from '../content-generation/avatar-generator';
import { MusicGenerator } from '../content-generation/music-generator';
import { VideoEditor } from '../../utils/video-editor'; // Assuming a utility for video editing exists
import { ContentModel } from '../../models/content.model';

export class VideoAssembler {
    private avatarGenerator: AvatarGenerator;
    private musicGenerator: MusicGenerator;
    private videoEditor: VideoEditor;

    constructor() {
        this.avatarGenerator = new AvatarGenerator();
        this.musicGenerator = new MusicGenerator();
        this.videoEditor = new VideoEditor();
    }

    public async assembleVideo(contentData: ContentModel): Promise<string> {
        try {
            const avatar = await this.avatarGenerator.generateAvatar(contentData.avatarProperties);
            const musicTrack = await this.musicGenerator.generateMusic(contentData.lyrics, contentData.genre);
            const video = await this.videoEditor.createVideo(avatar, musicTrack);

            return video; // Return the path or URL of the assembled video
        } catch (error) {
            throw new Error(`Video assembly failed: ${error.message}`);
        }
    }
}