import { YouTube } from 'googleapis';
import { ApiConfig } from '../../config/api.config';
import { ContentModel } from '../../models/content.model';

export class YouTubePublisher {
    private youtube: YouTube;

    constructor() {
        this.youtube = YouTube({
            version: 'v3',
            auth: ApiConfig.youtubeApiKey,
        });
    }

    async publishVideo(content: ContentModel): Promise<void> {
        const { title, description, videoFilePath, tags } = content;

        try {
            const response = await this.youtube.videos.insert({
                part: 'snippet,status',
                requestBody: {
                    snippet: {
                        title,
                        description,
                        tags,
                        categoryId: '22', // Category ID for 'People & Blogs'
                    },
                    status: {
                        privacyStatus: 'public', // or 'private' or 'unlisted'
                    },
                },
                media: {
                    body: fs.createReadStream(videoFilePath),
                },
            });

            console.log(`Video published: ${response.data.id}`);
        } catch (error) {
            console.error('Error publishing video to YouTube:', error);
        }
    }
}