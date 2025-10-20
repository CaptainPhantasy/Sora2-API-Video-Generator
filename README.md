# 🎬 Sora 2 Video Generator

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-15.5.6-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)
![Tailwind](https://img.shields.io/badge/Tailwind-4-38B2AC?style=for-the-badge&logo=tailwind-css)

**A modern, responsive web application for generating AI videos using OpenAI's Sora 2 API**

[Features](#-features) • [Demo](#-demo) • [Installation](#-installation) • [API Key Required](#-getting-your-api-key) • [Usage](#-usage)

</div>

---

## ⚠️ Important: You Need Your Own API Key

**This application requires your personal OpenAI API key with Sora 2 access.**

- API keys are **NOT** included with this repository
- You must obtain your own key from [OpenAI](https://platform.openai.com/)
- See [Getting Your API Key](#-getting-your-api-key) section below
- Your key is kept secure server-side (never exposed to the browser)

---

## 📖 Overview

A professional-grade web application that provides a beautiful, intuitive interface for creating AI-generated videos using OpenAI's Sora 2 API. Built with modern web technologies including Next.js 15, React 19, TypeScript, Tailwind CSS, and ShadCN UI components.

## ✨ Features

### 🎬 Video Generation
- **Two AI Models**: Sora 2 (standard, $0.08/sec) and Sora 2 Pro (premium, $0.25/sec)
- **Custom Prompts**: Natural language video descriptions
- **Duration Options**: 4, 8, or 12 second videos
- **Resolution Options**: HD (1280x720), Full HD (1920x1080), 4K (3840x2160)
- **Quality Settings**: Standard or High quality
- **Frame Rates**: 24, 30, or 60 fps

### 🎨 User Interface
- **Responsive Design**: Works on mobile, tablet, and desktop
- **Theme Switcher**: Warm (sepia/orange) and Dark (navy/blue) modes
- **ShadCN Components**: Professional, accessible UI components
- **Lucide Icons**: Beautiful, consistent iconography
- **Real-time Progress**: Live status updates during generation

### 🔒 Security & Privacy
- **Server-side API Keys**: Your key never leaves the server
- **No Data Storage**: Videos generated on-demand
- **CORS Protection**: Secure proxy server architecture
- **Environment Variables**: Secure configuration management

## 🚀 Installation

### Prerequisites

- **Node.js 18+** ([Download](https://nodejs.org/))
- **npm 6+** (comes with Node.js)
- **OpenAI API Key** with Sora 2 access

### Quick Start

1. **Clone the Repository**
   ```bash
   git clone https://github.com/CaptainPhantasy/Sora2-API-Video-Generator.git
   cd Sora2-API-Video-Generator
   ```

2. **Set Up Your API Key**

   Create a `.env.local` file in the root directory:
   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` and add your OpenAI API key:
   ```env
   OPENAI_API_KEY=your-openai-api-key-here
   PORT=3000
   ```

   ⚠️ **NEVER commit `.env.local` to Git!** (It's already in .gitignore)

3. **Install Dependencies**
   ```bash
   cd frontend
   npm install
   cd ..
   ```

4. **Start the Application**
   ```bash
   ./start-system.sh
   ```

   This will:
   - Start the backend server (port 3000)
   - Start the frontend server (port 3001)
   - Open http://localhost:3001 in your browser

5. **Stop the Application**

   Press `Ctrl+C` in the terminal

---

## 🔑 Getting Your API Key

### Steps to Obtain OpenAI API Key:

1. **Create Account** at [platform.openai.com](https://platform.openai.com/)

2. **Request Sora 2 Access** (currently limited access)
   - Join waitlist at [openai.com/sora](https://openai.com/sora)
   - Wait for approval email

3. **Generate API Key**
   - Go to [API Keys](https://platform.openai.com/api-keys)
   - Click "Create new secret key"
   - Copy the key (you won't see it again!)

4. **Add to .env.local**
   ```env
   OPENAI_API_KEY=sk-proj-your-actual-key-here
   ```

5. **Set Up Billing**
   - Add payment method in [Billing Settings](https://platform.openai.com/account/billing)
   - Set spending limits to control costs

### ⚠️ API Key Security

**CRITICAL**:
- Never commit your API key to Git
- Never share your key publicly
- Rotate immediately if compromised
- Set spending limits in OpenAI dashboard

**This app keeps your key secure**:
- Stored server-side in `.env.local`
- Never exposed to browser
- Protected by `.gitignore`

---

## 💻 Usage

1. **Start the Application**
   ```bash
   ./start-system.sh
   ```

2. **Access the Web Interface**
   - Opens automatically at http://localhost:3001
   - Or manually navigate to the URL

3. **Select Theme** (Optional)
   - Click the sun/moon icon in the header
   - Choose Warm (light) or Dark mode

4. **Configure Video Settings**
   - **Prompt**: Describe your video in natural language
   - **Model**: Choose Sora 2 or Sora 2 Pro
   - **Duration**: Select 4, 8, or 12 seconds
   - **Resolution**: HD, Full HD, or 4K
   - **Quality**: Standard or High
   - **FPS**: 24, 30, or 60 frames per second

5. **Review Cost Estimate**
   - Real-time cost shown before generation
   - Based on model and duration

6. **Generate Video**
   - Click "Generate Video"
   - Watch live progress bar (typically 2-5 minutes)
   - Video appears when ready

7. **Download Your Video**
   - Video plays in browser
   - Click "Download Video" to save as MP4

### Example Costs

| Model | Duration | Cost |
|-------|----------|------|
| Sora 2 | 4 seconds | $0.32 |
| Sora 2 | 8 seconds | $0.64 |
| Sora 2 | 12 seconds | $0.96 |
| Sora 2 Pro | 4 seconds | $1.00 |
| Sora 2 Pro | 8 seconds | $2.00 |
| Sora 2 Pro | 12 seconds | $3.00 |

---

## 🏗️ Architecture

```
Browser (localhost:3001)
         ↓
Next.js Frontend
  - React 19 + TypeScript
  - ShadCN UI + Tailwind
  - Lucide Icons
         ↓
Node.js Proxy (localhost:3000)
  - CORS enabled
  - Secure API key storage
         ↓
OpenAI Sora 2 API
  - https://api.openai.com/v1/videos
```

### Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript 5, Tailwind CSS 4
- **UI**: ShadCN UI (Radix primitives), Lucide React Icons
- **Backend**: Node.js 18+ (pure, no frameworks)
- **Build**: Turbopack (Next.js built-in)

## API Details

### Endpoint

```
POST https://api.openai.com/v1/video/generations
```

### Request Format

```json
{
  "model": "sora-2" | "sora-2-pro",
  "prompt": "string (max 500 chars)",
  "duration": 1-20 (sora-2) | 1-90 (sora-2-pro),
  "resolution": "WIDTHxHEIGHT",
  "quality": "standard" | "high",
  "style": "cinematic" | "documentary" | "animation",
  "fps": 24 | 30 | 60
}
```

### Response Format

**Initial Response:**
```json
{
  "id": "job_abc123",
  "status": "processing",
  "created_at": "2025-10-19T12:00:00Z"
}
```

**Polling Response (Completed):**
```json
{
  "id": "job_abc123",
  "status": "completed",
  "video_url": "https://...",
  "duration": 10,
  "resolution": "1280x720"
}
```

## Pricing Estimate

Based on OpenAI's Sora 2 pricing:

- **Sora 2**: ~$0.30 per second (~$3.00 for 10 seconds)
- **Sora 2 Pro**: ~$0.50 per second (~$5.00 for 10 seconds)

The GUI automatically calculates estimated costs based on your selected parameters.

## Parameters Reference

### Model
| Value | Max Duration | Max Resolution | FPS Options |
|-------|-------------|----------------|-------------|
| sora-2 | 20 seconds | 720p | 24, 30 |
| sora-2-pro | 90 seconds | 1024p | 24, 30, 60 |

### Aspect Ratios
| Ratio | Use Case | Preset Resolution |
|-------|----------|------------------|
| 16:9 | YouTube, landscape | 1280x720 |
| 9:16 | TikTok, Reels | 720x1280 |
| 1:1 | Instagram posts | 1080x1080 |

### Quality Settings
| Value | Description | Impact |
|-------|-------------|--------|
| standard | Default quality | Base cost |
| high | Enhanced quality | May increase cost |

### Style Options
| Value | Description |
|-------|-------------|
| cinematic | Movie-like quality with dramatic lighting |
| documentary | Realistic, natural appearance |
| animation | Animated or stylized look |

## Troubleshooting

### "Failed to create video generation job"
- Verify your API key is correct
- Ensure you have Sora 2 API access enabled
- Check that your OpenAI account has sufficient credits

### "Video generation timed out"
- Long videos (especially 90s on Sora 2 Pro) may take longer
- Check your OpenAI dashboard for job status
- The job may still be processing - wait and check manually

### "Error checking status"
- Network connectivity issue
- API key may be invalid or expired
- OpenAI API may be temporarily unavailable

### Video not playing
- Some browsers may have codec compatibility issues
- Try downloading and playing in a media player
- Ensure your browser supports MP4/H.264 video

## Security Notes

- Your API key is stored **server-side only** in `.env.local`
- The key is **never exposed** to the browser or client-side code
- All OpenAI API requests go through the secure Node.js proxy server
- `.env.local` is protected by `.gitignore` and never committed to Git
- **Recommendation**: Generate a dedicated API key for this tool and rotate it regularly

## API Access

As of October 2025, Sora 2 API access is limited:
- Available to ChatGPT Pro subscribers
- May require explicit invitation from OpenAI
- Check https://platform.openai.com for access status

## Technical Details

- **Framework**: Next.js 15.5.6 with App Router and Turbopack
- **Language**: TypeScript 5 with strict type checking
- **UI Library**: React 19 with ShadCN UI components
- **Styling**: Tailwind CSS 4 with custom theme system
- **Polling Interval**: 5 seconds (configurable)
- **Timeout**: 10 minutes (120 polling attempts)
- **Theme Persistence**: localStorage (client-side only)
- **API Key Storage**: Server-side environment variables

## File Structure

```
Sora2GUI/Sora/
├── frontend/                     # Next.js application
│   ├── app/
│   │   ├── layout.tsx           # Root layout with metadata
│   │   ├── page.tsx             # Home page
│   │   └── globals.css          # Global styles + Tailwind
│   ├── components/
│   │   ├── ui/                  # ShadCN UI components (12 files)
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── select.tsx
│   │   │   └── ... (8 more)
│   │   └── video-generator.tsx  # Main video generation component
│   ├── lib/
│   │   └── utils.ts             # Utility functions
│   ├── .env.local               # Frontend config (not in Git)
│   ├── package.json
│   └── tsconfig.json
├── server.js                     # Backend proxy server
├── .env.local                    # Backend config (not in Git)
├── start-system.sh               # Full system startup script
├── index.html                    # Legacy HTML version (deprecated)
└── README.md                     # This file
```

## Prompt Engineering Tips

For best results:

1. **Be Specific**: Describe exactly what you want to see
   - ✅ "A golden retriever running through a sunlit meadow, slow motion"
   - ❌ "A dog"

2. **Include Details**:
   - Lighting (golden hour, dramatic, soft)
   - Camera movement (pan, zoom, static)
   - Mood/atmosphere (peaceful, energetic, mysterious)
   - Visual style (cinematic, realistic, stylized)

3. **Structure Your Prompt**:
   - Subject: What is in the scene
   - Action: What is happening
   - Setting: Where it takes place
   - Style: How it should look

4. **Use Style Presets**:
   - "Cinematic" for dramatic, movie-quality videos
   - "Documentary" for realistic, natural footage
   - "Animation" for stylized or cartoon-like results

## Examples

### Example 1: Landscape Video
- **Prompt**: "A serene mountain lake at sunrise, mist rising from the water, golden light reflecting on the surface, cinematic camera pan"
- **Model**: Sora 2
- **Duration**: 10 seconds
- **Aspect Ratio**: 16:9
- **Style**: Cinematic
- **FPS**: 30

### Example 2: Social Media Content
- **Prompt**: "Close-up of a barista pouring latte art, smooth and artistic foam design, warm coffee shop ambiance"
- **Model**: Sora 2
- **Duration**: 6 seconds
- **Aspect Ratio**: 9:16
- **Style**: Documentary
- **FPS**: 30

### Example 3: Premium Long-Form
- **Prompt**: "Time-lapse of city skyline from day to night, traffic flowing, lights turning on, dramatic clouds moving overhead"
- **Model**: Sora 2 Pro
- **Duration**: 30 seconds
- **Aspect Ratio**: 16:9
- **Style**: Cinematic
- **FPS**: 60

## Support & Resources

- **OpenAI API Documentation**: https://platform.openai.com/docs
- **Sora 2 Guides**: https://platform.openai.com/docs/guides/video-generation
- **API Status**: https://status.openai.com
- **Community**: https://community.openai.com

## Version History

- **v1.0** (2025-10-19): Initial release
  - Full parameter control
  - Real-time polling and progress
  - Video preview and download
  - Cost estimation
  - Responsive design

## License

This tool is provided as-is for use with OpenAI's Sora 2 API. You are responsible for:
- Your API usage and associated costs
- Compliance with OpenAI's Terms of Service
- Appropriate use of generated content

## Contributing

Suggestions and improvements welcome! Feel free to:
- Report issues
- Suggest new features
- Share prompt engineering tips
- Improve documentation

---

**Created**: October 19, 2025
**Author**: BigThree Development
**Purpose**: Simplify Sora 2 video generation with complete parameter control
