# Content Factory - Development Guide

## GitHub Copilot Integration Fixed

This repository now has proper `.gitignore` configuration to prevent GitHub Copilot workflow failures.

### Issue Resolution

**Problem**: GitHub Copilot workflows were failing with git timeout errors when trying to commit `node_modules` and build artifacts.

**Solution**: Added comprehensive `.gitignore` files that exclude:
- `node_modules/` and all npm/yarn artifacts
- `dist/` and `build/` directories  
- Log files and temporary files
- Generated content and cache directories
- Environment configuration files

### Development Setup

1. **Install Dependencies**:
   ```bash
   cd ai-content-factory
   npm install
   ```

2. **For CI/Automated Environments** (skips Puppeteer download):
   ```bash
   npm run install:ci
   ```

3. **Build Project**:
   ```bash
   npm run build
   ```

4. **Development Mode**:
   ```bash
   npm run dev
   ```

### Environment Setup

1. Copy the example environment file:
   ```bash
   cp ai-content-factory/.env.example ai-content-factory/.env
   ```

2. Fill in your API keys and configuration values in `.env`

### Key Files Added

- **`.gitignore`** (root) - General exclusions and ai-content-factory specific patterns
- **`ai-content-factory/.gitignore`** - Detailed Node.js project exclusions
- **Updated `package.json`** - Added CI-friendly scripts and fixed dependencies

### API Integrations

The application integrates with:
- OpenAI API
- HeyGen API  
- Suno AI API
- YouTube API
- TikTok API
- Spotify API
- Patreon API
- Google Trends API
- Reddit API
- Twitter API
- Instagram API

Configure all API keys in your `.env` file before running the application.

### Project Structure

```
ai-content-factory/
├── src/
│   ├── app.ts                     # Main application entry
│   ├── config/                    # Configuration files
│   ├── controllers/               # API route controllers  
│   ├── models/                    # Database models
│   ├── services/                  # Business logic services
│   ├── utils/                     # Utility functions
│   ├── workers/                   # Background job workers
│   └── types/                     # TypeScript type definitions
├── scripts/                       # Setup and migration scripts
├── tests/                         # Test files
├── .env.example                   # Environment template
├── package.json                   # Dependencies and scripts
├── tsconfig.json                  # TypeScript configuration
└── Dockerfile                     # Container configuration
```

### Notes

- The repository is now properly configured for GitHub Copilot workflows
- Build artifacts and dependencies are automatically excluded from git
- Use the provided npm scripts for consistent development workflow