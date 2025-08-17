# AI Content Factory - Full Trend Tracking & Content Generation Platform

A comprehensive full-stack application for tracking trends and automatically generating content using AI services including ChatGPT, HeyGen, and Suno AI.

## 🚀 Features

### Backend (Node.js/TypeScript)
- **Trend Analysis**: Real-time trend scanning across multiple platforms (TikTok, YouTube, Instagram, etc.)
- **AI Content Generation**: 
  - Lyrics generation using ChatGPT/OpenAI
  - Music generation using Suno AI
  - Avatar creation using HeyGen
  - Video assembly combining all elements
- **Multi-platform Publishing**: Automated publishing to social media platforms
- **Analytics & Performance Tracking**: Detailed metrics and reporting
- **Monetization Tracking**: Revenue tracking across different sources
- **RESTful API**: Complete API for all functionality

### Frontend (Next.js/React/TypeScript)
- **Trends Dashboard**: Real-time visualization of trending topics
- **Content Creator**: Interactive interface for generating AI content
- **Analytics Dashboard**: Performance metrics and revenue tracking
- **Settings Panel**: API configuration and automation settings
- **Responsive Design**: Modern UI with Tailwind CSS

## 🛠 Technology Stack

### Backend
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Caching**: Redis
- **AI APIs**: OpenAI (ChatGPT), HeyGen, Suno AI
- **Social APIs**: YouTube, TikTok, Instagram, Twitter, Spotify
- **Job Processing**: Bull (Redis-based)
- **Logging**: Winston

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **State Management**: React Query

## 📁 Project Structure

```
content_factory/
├── ai-content-factory/          # Backend API
│   ├── src/
│   │   ├── app.ts              # Main application entry
│   │   ├── controllers/        # API route controllers
│   │   ├── services/           # Business logic services
│   │   │   ├── niche-detection/    # Trend scanning & analysis
│   │   │   ├── content-generation/ # AI content creation
│   │   │   ├── analytics/          # Performance tracking
│   │   │   ├── monetization/       # Revenue tracking
│   │   │   └── publishing/         # Multi-platform publishing
│   │   ├── models/             # Database models
│   │   ├── utils/              # Utility functions
│   │   ├── config/             # Configuration files
│   │   └── workers/            # Background job workers
│   ├── package.json
│   └── tsconfig.json
├── frontend/                    # Next.js Frontend
│   ├── src/
│   │   ├── app/                # Next.js app router
│   │   └── components/         # React components
│   │       ├── TrendsDashboard.tsx
│   │       ├── ContentCreator.tsx
│   │       ├── Analytics.tsx
│   │       └── Navigation.tsx
│   ├── package.json
│   └── next.config.js
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB
- Redis
- API keys for: OpenAI, HeyGen, Suno AI, YouTube, TikTok, etc.

### Backend Setup

1. **Install dependencies**:
   ```bash
   cd ai-content-factory
   npm install
   ```

2. **Environment Configuration**:
   ```bash
   cp .env.example .env
   # Edit .env with your API keys and configuration
   ```

3. **Start the backend**:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. **Install dependencies**:
   ```bash
   cd frontend
   npm install
   ```

2. **Start the development server**:
   ```bash
   npm run dev
   ```

3. **Access the application**:
   Open [http://localhost:3000](http://localhost:3000) in your browser

## 🔧 API Configuration

The application requires API keys for various services. Add these to your `.env` file:

```env
# AI Services
OPENAI_API_KEY=your_openai_api_key
HEYGEN_API_KEY=your_heygen_api_key
SUNO_AI_API_KEY=your_suno_ai_api_key

# Social Media APIs
YOUTUBE_API_KEY=your_youtube_api_key
TIKTOK_API_KEY=your_tiktok_api_key
TWITTER_API_KEY=your_twitter_api_key
INSTAGRAM_ACCESS_TOKEN=your_instagram_token

# Database
MONGODB_URI=mongodb://localhost:27017/ai_content_factory
REDIS_URL=redis://localhost:6379
```

## 📊 Key Features

### 1. Trend Analysis
- Real-time trend scanning across multiple platforms
- Keyword analysis and sentiment tracking
- Niche detection and opportunity identification
- Predictive modeling for trend forecasting

### 2. AI Content Generation
- **Lyrics**: AI-generated lyrics using ChatGPT based on trending topics
- **Music**: Background music generation using Suno AI
- **Avatars**: AI avatars created with HeyGen
- **Videos**: Automated video assembly combining all elements

### 3. Publishing & Distribution
- Multi-platform publishing (YouTube, TikTok, Instagram, etc.)
- Automated scheduling and optimization
- Performance tracking and analytics

### 4. Analytics & Monetization
- Detailed performance metrics
- Revenue tracking across platforms
- ROI analysis and optimization suggestions
- Automated reporting

## 🎯 Use Cases

1. **Content Creators**: Automate content generation based on trending topics
2. **Marketing Agencies**: Scale content production for multiple clients
3. **Social Media Managers**: Stay ahead of trends and create viral content
4. **Businesses**: Leverage trending topics for brand awareness
5. **Researchers**: Analyze social media trends and patterns

## 📈 Development Status

- ✅ Backend API infrastructure
- ✅ AI service integrations (OpenAI, HeyGen, Suno AI)
- ✅ Trend scanning and analysis
- ✅ Content generation pipeline
- ✅ Frontend dashboard and UI
- ✅ Analytics and reporting
- 🚧 Multi-platform publishing (in progress)
- 🚧 Real-time notifications
- 🚧 Advanced automation features

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- OpenAI for ChatGPT API
- HeyGen for avatar generation
- Suno AI for music generation
- All the open source libraries that make this possible