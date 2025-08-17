'use client';

import { useState } from 'react';
import { Play, Wand2, Upload, Settings } from 'lucide-react';

interface ContentRequest {
  niche: string;
  theme: string;
  style: string;
  platforms: string[];
  autoPublish: boolean;
}

export default function ContentCreator() {
  const [request, setRequest] = useState<ContentRequest>({
    niche: '',
    theme: '',
    style: 'upbeat',
    platforms: [],
    autoPublish: false
  });
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<any>(null);

  const platforms = ['TikTok', 'YouTube', 'Instagram', 'Twitter', 'Spotify'];
  const styles = ['upbeat', 'chill', 'electronic', 'pop', 'rock', 'hip-hop'];
  const niches = [
    'AI Technology',
    'Music Production',
    'Gaming',
    'Fitness',
    'Cooking',
    'Travel',
    'Education',
    'Entertainment'
  ];

  const handlePlatformToggle = (platform: string) => {
    setRequest(prev => ({
      ...prev,
      platforms: prev.platforms.includes(platform)
        ? prev.platforms.filter(p => p !== platform)
        : [...prev.platforms, platform]
    }));
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    
    // Simulate API call
    setTimeout(() => {
      setGeneratedContent({
        contentId: 'content_' + Date.now(),
        lyrics: `[Verse 1]\nIn the world of ${request.niche}\nWhere innovation never sleeps\n${request.theme} is rising\nTaking us to greater heights\n\n[Chorus]\n${request.theme}, ${request.theme}\nThe future is now\n${request.style} beats and melodies\nShowing us how`,
        music: `https://example.com/music/${request.style}_${Date.now()}.mp3`,
        avatar: `https://example.com/avatar/${request.niche.replace(' ', '_')}.png`,
        video: `https://example.com/video/generated_${Date.now()}.mp4`,
        platforms: request.platforms,
        status: request.autoPublish ? 'Publishing...' : 'Ready to publish'
      });
      setIsGenerating(false);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Content Creator
          </h1>
          <p className="text-gray-600">
            Generate AI-powered content with ChatGPT, HeyGen, and Suno AI
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Creation Form */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <Wand2 className="h-5 w-5 mr-2 text-purple-600" />
              Create New Content
            </h2>

            <div className="space-y-6">
              {/* Niche Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Niche
                </label>
                <select
                  value={request.niche}
                  onChange={(e) => setRequest(prev => ({ ...prev, niche: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Select a niche</option>
                  {niches.map(niche => (
                    <option key={niche} value={niche}>{niche}</option>
                  ))}
                </select>
              </div>

              {/* Theme */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Theme
                </label>
                <input
                  type="text"
                  value={request.theme}
                  onChange={(e) => setRequest(prev => ({ ...prev, theme: e.target.value }))}
                  placeholder="e.g., Innovation in 2024, Future of AI"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              {/* Style */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Style
                </label>
                <select
                  value={request.style}
                  onChange={(e) => setRequest(prev => ({ ...prev, style: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  {styles.map(style => (
                    <option key={style} value={style}>
                      {style.charAt(0).toUpperCase() + style.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Platforms */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Platforms
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {platforms.map(platform => (
                    <label key={platform} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={request.platforms.includes(platform)}
                        onChange={() => handlePlatformToggle(platform)}
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      <span className="text-sm text-gray-700">{platform}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Auto Publish */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={request.autoPublish}
                  onChange={(e) => setRequest(prev => ({ ...prev, autoPublish: e.target.checked }))}
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <label className="text-sm text-gray-700">
                  Auto-publish after generation
                </label>
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGenerate}
                disabled={!request.niche || !request.theme || request.platforms.length === 0 || isGenerating}
                className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    <span>Generate Content</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Generated Content Preview */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <Settings className="h-5 w-5 mr-2 text-blue-600" />
              Generated Content
            </h2>

            {!generatedContent && !isGenerating && (
              <div className="text-center py-12 text-gray-500">
                <Upload className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Generated content will appear here</p>
              </div>
            )}

            {isGenerating && (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Generating your content...</p>
                <p className="text-sm text-gray-500 mt-2">
                  Using ChatGPT for lyrics, Suno AI for music, and HeyGen for avatars
                </p>
              </div>
            )}

            {generatedContent && (
              <div className="space-y-6">
                {/* Status */}
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <span className="text-sm font-medium text-green-800">
                    Content ID: {generatedContent.contentId}
                  </span>
                  <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                    {generatedContent.status}
                  </span>
                </div>

                {/* Lyrics Preview */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Generated Lyrics</h3>
                  <div className="bg-gray-50 p-3 rounded text-sm text-gray-800 whitespace-pre-line">
                    {generatedContent.lyrics}
                  </div>
                </div>

                {/* Media Links */}
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded">
                    <span className="text-sm font-medium text-blue-800">Music Track</span>
                    <button className="text-blue-600 hover:text-blue-800 text-sm">
                      Play ▶️
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded">
                    <span className="text-sm font-medium text-purple-800">Avatar</span>
                    <button className="text-purple-600 hover:text-purple-800 text-sm">
                      View 👁️
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-orange-50 rounded">
                    <span className="text-sm font-medium text-orange-800">Video</span>
                    <button className="text-orange-600 hover:text-orange-800 text-sm">
                      Watch 📺
                    </button>
                  </div>
                </div>

                {/* Platforms */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Target Platforms</h3>
                  <div className="flex flex-wrap gap-2">
                    {generatedContent.platforms.map((platform: string) => (
                      <span key={platform} className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs">
                        {platform}
                      </span>
                    ))}
                  </div>
                </div>

                {!request.autoPublish && (
                  <button className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700">
                    Publish Now
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}