# Sora 2 Video Generator

A responsive web application for generating AI videos using OpenAI's Sora 2 API.

Built with Next.js 15, React 19, TypeScript, Tailwind CSS, and ShadCN UI.

## Features

- Two AI models (Sora 2 and Sora 2 Pro)
- Customizable duration, resolution, quality, and FPS
- Real-time progress tracking
- Dual theme support (Warm and Dark modes)
- In-browser video preview and download
- Responsive design (mobile, tablet, desktop)

## Installation

### Prerequisites

- Node.js 18+ ([Download](https://nodejs.org/))
- OpenAI API key with Sora 2 access

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/CaptainPhantasy/Sora2-API-Video-Generator.git
   cd Sora2-API-Video-Generator
   ```

2. Create `.env.local` in the root directory:
   ```bash
   cp .env.example .env.local
   ```

3. Add your OpenAI API key to `.env.local`:
   ```env
   OPENAI_API_KEY=sk-proj-your-actual-key-here
   PORT=3000
   ```

4. Install dependencies:
   ```bash
   cd frontend
   npm install
   cd ..
   ```

5. Start the application:
   ```bash
   ./start-system.sh
   ```

6. Open http://localhost:3001 in your browser

## Getting Your API Key

1. Create an account at [platform.openai.com](https://platform.openai.com/)
2. Request Sora 2 access at [openai.com/sora](https://openai.com/sora) (currently limited availability)
3. Generate an API key at [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
4. Add it to `.env.local` as shown above
5. Set up billing and spending limits in your OpenAI dashboard

**Security**: Your API key is stored server-side only and never exposed to the browser.

## Usage

1. Start the app with `./start-system.sh`
2. Open http://localhost:3001
3. Choose a theme (sun/moon icon in header)
4. Enter a video prompt
5. Select model, duration, resolution, quality, and FPS
6. Review the cost estimate
7. Click "Generate Video"
8. Wait for generation (typically 2-5 minutes)
9. Preview and download your video

## Pricing

| Model | Cost per Second |
|-------|----------------|
| Sora 2 | $0.08 |
| Sora 2 Pro | $0.25 |

**Examples:**
- Sora 2 (8 seconds): $0.64
- Sora 2 Pro (8 seconds): $2.00

## Prompt Tips

Be specific and include details:
- **Good**: "A golden retriever running through a sunlit meadow, slow motion, cinematic"
- **Bad**: "A dog"

Include:
- Subject and action
- Setting and lighting
- Camera movement
- Style/mood

## Troubleshooting

**"Failed to create video generation job"**
- Verify your API key in `.env.local`
- Ensure you have Sora 2 API access
- Check your OpenAI account credits

**Video generation timed out**
- Check job status in your OpenAI dashboard
- Longer videos may take more time

**Port conflicts**
```bash
lsof -ti:3000 | xargs kill -9
lsof -ti:3001 | xargs kill -9
./start-system.sh
```

## Resources

- [OpenAI API Docs](https://platform.openai.com/docs)
- [Sora 2 Guides](https://platform.openai.com/docs/guides/video-generation)
- [API Status](https://status.openai.com)

## License

This tool is provided as-is. You are responsible for your API usage, costs, and compliance with OpenAI's Terms of Service.
