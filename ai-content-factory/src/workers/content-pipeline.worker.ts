import { Worker, isMainThread, parentPort } from 'worker_threads';
import { generateContent } from '../services/content-generation/lyric-generator';
import { generateMusic } from '../services/content-generation/music-generator';
import { generateAvatar } from '../services/content-generation/avatar-generator';
import { assembleVideo } from '../services/content-generation/video-assembler';
import { publishToYouTube } from '../services/publishing/youtube-publisher';
import { publishToTikTok } from '../services/publishing/tiktok-publisher';
import { publishToSpotify } from '../services/publishing/spotify-publisher';

if (isMainThread) {
    throw new Error('This worker should not be run in the main thread.');
}

parentPort?.on('message', async (data) => {
    try {
        const { theme, mood, avatarProperties } = data;

        // Step 1: Generate content
        const lyrics = await generateContent(theme);
        const musicTrack = await generateMusic(lyrics, mood);
        const avatar = await generateAvatar(avatarProperties);

        // Step 2: Assemble video
        const video = await assembleVideo(musicTrack, avatar);

        // Step 3: Publish content
        await publishToYouTube(video);
        await publishToTikTok(video);
        await publishToSpotify(musicTrack);

        parentPort?.postMessage({ status: 'success', message: 'Content generated and published successfully.' });
    } catch (error) {
        parentPort?.postMessage({ status: 'error', message: error.message });
    }
});