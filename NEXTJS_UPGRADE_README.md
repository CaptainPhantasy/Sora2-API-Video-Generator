# Sora 2 Video Generator - Next.js + ShadCN UI

A modern, responsive web application for generating AI videos using OpenAI's Sora 2 API. Built with Next.js 15, TypeScript, Tailwind CSS, ShadCN UI components, and Lucide icons.

## Features

- **Modern UI/UX**: Beautiful, responsive interface built with ShadCN components
- **Full Responsive Design**: Works seamlessly on desktop, laptop, tablet, and mobile devices
- **Real-time Progress**: Live progress tracking during video generation
- **Video Preview**: In-browser video player with download capability
- **Model Selection**: Choose between Sora 2 and Sora 2 Pro models
- **Full Parameter Control**:
  - Duration: 4, 8, or 12 seconds
  - Resolution: HD (1280x720), Full HD (1920x1080), 4K (3840x2160)
  - Quality: Standard or High
  - FPS: 24, 30, or 60
- **Cost Estimation**: Real-time cost calculation before generation
- **Secure API Key Management**: Server-side API key storage
- **No CORS Issues**: Proxy server architecture

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Browser (User)                       │
│                  http://localhost:3001                  │
└──────────────────────┬──────────────────────────────────┘
                       │
                       │ HTTP Requests
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│              Next.js Frontend (Port 3001)               │
│  • React 19 + TypeScript                               │
│  • ShadCN UI Components                                │
│  • Tailwind CSS                                        │
│  • Lucide React Icons                                  │
│  • Responsive Design                                   │
└──────────────────────┬──────────────────────────────────┘
                       │
                       │ API Calls
                       │ http://localhost:3000
                       ▼
┌─────────────────────────────────────────────────────────┐
│            Node.js Proxy Server (Port 3000)             │
│  • Express-free pure Node.js                           │
│  • CORS enabled                                        │
│  • Environment variables (.env.local)                  │
│  • Video streaming                                     │
└──────────────────────┬──────────────────────────────────┘
                       │
                       │ HTTPS + Auth
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│              OpenAI Sora 2 API                          │
│  https://api.openai.com/v1/videos                       │
└─────────────────────────────────────────────────────────┘
```

## Quick Start

### Prerequisites

- Node.js 18+ ([Download](https://nodejs.org/))
- npm or yarn
- OpenAI API key with Sora 2 access

### Installation

1. **Clone or navigate to the project directory**
   ```bash
   cd /Volumes/Storage/Development/BigThree/Sora2GUI/Sora
   ```

2. **Set up environment variables**

   The `.env.local` file is already created with your API key:
   ```bash
   cat .env.local
   ```

   It should contain:
   ```
   OPENAI_API_KEY=your-api-key-here
   PORT=3000
   ```

3. **Install frontend dependencies** (if not already installed)
   ```bash
   cd frontend
   npm install
   cd ..
   ```

### Running the Application

**Option 1: Automated Startup (Recommended)**

Use the comprehensive startup script that manages both servers:

```bash
./start-system.sh
```

This script will:
- ✅ Verify environment variables
- ✅ Check Node.js and npm installation
- ✅ Install frontend dependencies if needed
- ✅ Clean up any existing processes on ports 3000 and 3001
- ✅ Start the backend proxy server (port 3000)
- ✅ Start the Next.js frontend (port 3001)
- ✅ Verify both servers are running
- ✅ Open the browser automatically
- ✅ Handle graceful shutdown with Ctrl+C

**Option 2: Manual Startup**

Terminal 1 (Backend):
```bash
source .env.local
node server.js
```

Terminal 2 (Frontend):
```bash
cd frontend
npm run dev
```

Then open http://localhost:3001 in your browser.

### Stopping the Application

If using `start-system.sh`, simply press `Ctrl+C` to stop both servers.

If running manually, press `Ctrl+C` in each terminal.

## Technology Stack

### Frontend
- **Framework**: Next.js 15.5.6 with App Router
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **UI Components**: ShadCN UI (Radix UI primitives)
- **Icons**: Lucide React
- **Build Tool**: Turbopack (Next.js built-in)

### Backend
- **Runtime**: Node.js (pure, no frameworks)
- **API Client**: Native HTTPS module
- **Environment**: dotenv-style (.env.local)

## Project Structure

```
Sora/
├── frontend/                  # Next.js application
│   ├── app/
│   │   ├── layout.tsx        # Root layout with metadata
│   │   ├── page.tsx          # Home page
│   │   └── globals.css       # Global styles + Tailwind
│   ├── components/
│   │   ├── ui/               # ShadCN UI components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── select.tsx
│   │   │   ├── textarea.tsx
│   │   │   ├── progress.tsx
│   │   │   ├── alert.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── label.tsx
│   │   │   ├── radio-group.tsx
│   │   │   ├── slider.tsx
│   │   │   └── tabs.tsx
│   │   └── video-generator.tsx  # Main video generation component
│   ├── lib/
│   │   └── utils.ts          # Utility functions (cn, etc.)
│   ├── .env.local            # Frontend environment variables
│   ├── package.json          # Frontend dependencies
│   ├── tsconfig.json         # TypeScript configuration
│   ├── tailwind.config.ts    # Tailwind configuration
│   └── components.json       # ShadCN configuration
├── server.js                 # Backend proxy server
├── .env.local               # Backend environment variables
├── start-system.sh          # Automated startup script
├── start.sh                 # Legacy startup script (backend only)
├── index.html              # Legacy HTML version (deprecated)
└── [documentation files]
```

## API Endpoints

### Backend Proxy Server (Port 3000)

#### Health Check
```
GET /health
```

Response:
```json
{
  "status": "ok",
  "apiKeyConfigured": true,
  "server": "Sora 2 Proxy"
}
```

#### Generate Video
```
POST /api/video/generate
Content-Type: application/json

{
  "model": "sora-2" | "sora-2-pro",
  "prompt": "Your video description",
  "seconds": "4" | "8" | "12",
  "size": "1280x720" | "1920x1080" | "3840x2160",
  "quality": "standard" | "high",
  "fps": 24 | 30 | 60
}
```

Response:
```json
{
  "id": "video_abc123...",
  "status": "queued",
  "created_at": "2025-10-19T..."
}
```

#### Check Status
```
GET /api/video/status/{job_id}
```

Response:
```json
{
  "id": "video_abc123...",
  "status": "completed" | "processing" | "failed",
  "video_url": "https://..."  // if completed
}
```

#### Download Video
```
GET /api/video/download/{job_id}
```

Streams the video file directly to the browser.

## Responsive Design Breakpoints

The UI adapts to different screen sizes:

- **Mobile**: < 640px (sm)
  - Single column layout
  - Stacked form and preview
  - Touch-optimized controls
  - Collapsible sections

- **Tablet**: 640px - 1024px (md)
  - Single column with larger padding
  - Optimized spacing
  - Comfortable touch targets

- **Laptop/Desktop**: > 1024px (lg)
  - Two-column layout (form | preview)
  - Side-by-side comparison
  - Larger controls and preview

## Cost Calculation

The application provides real-time cost estimates:

### Sora 2 (Standard)
- **Rate**: $0.08 per second
- 4 seconds: $0.32
- 8 seconds: $0.64
- 12 seconds: $0.96

### Sora 2 Pro (Premium)
- **Rate**: $0.25 per second
- 4 seconds: $1.00
- 8 seconds: $2.00
- 12 seconds: $3.00

## Development

### Adding New ShadCN Components

```bash
cd frontend
npx shadcn@latest add [component-name]
```

Available components: https://ui.shadcn.com/docs/components

### Modifying Styles

Edit `frontend/app/globals.css` for global styles or use Tailwind classes directly in components.

### Environment Variables

**Backend (.env.local in root)**
```
OPENAI_API_KEY=sk-proj-...
PORT=3000
```

**Frontend (frontend/.env.local)**
```
NEXT_PUBLIC_API_URL=http://localhost:3000
```

Note: Only variables prefixed with `NEXT_PUBLIC_` are exposed to the browser.

### Build for Production

```bash
cd frontend
npm run build
npm start
```

The production build runs on port 3000 by default.

## Troubleshooting

### Frontend won't start

**Error**: `Port 3001 already in use`

**Solution**:
```bash
lsof -ti:3001 | xargs kill -9
npm run dev
```

### Backend connection failed

**Error**: `Failed to fetch` or `ERR_CONNECTION_REFUSED`

**Solution**:
1. Verify backend is running:
   ```bash
   curl http://localhost:3000/health
   ```

2. Check logs for errors in the backend terminal

3. Restart backend:
   ```bash
   lsof -ti:3000 | xargs kill -9
   node server.js
   ```

### Video generation fails

**Error**: `Failed to create video generation job`

**Possible causes**:
1. **API key invalid**: Check `.env.local` has correct key
2. **No Sora 2 access**: Verify your OpenAI account has Sora 2 enabled
3. **Insufficient credits**: Check your OpenAI account balance
4. **Content policy violation**: Modify your prompt

**Debug steps**:
```bash
# Check API key is loaded
curl http://localhost:3000/health

# Check backend logs
# (view terminal running server.js)
```

### CORS errors

The proxy server already has CORS enabled with `Access-Control-Allow-Origin: *`. If you still see CORS errors:

1. Verify you're calling `http://localhost:3000` (not `https://api.openai.com`)
2. Check the frontend `.env.local` has correct `NEXT_PUBLIC_API_URL`
3. Clear browser cache and hard reload (Cmd+Shift+R on Mac)

## Comparison: Old vs New

| Feature | Old (index.html) | New (Next.js) |
|---------|------------------|---------------|
| Framework | Vanilla HTML/JS | Next.js 15 + React 19 |
| Styling | Inline CSS | Tailwind CSS 4 |
| Components | Custom HTML | ShadCN UI (Radix) |
| Icons | Emoji/Unicode | Lucide React |
| TypeScript | ❌ | ✅ |
| Responsive | Basic | Advanced (mobile-first) |
| Hot Reload | ❌ | ✅ (Turbopack) |
| Build Process | None | Optimized production builds |
| SEO | Basic | Advanced (metadata, SSR) |
| Accessibility | Limited | Full ARIA support |

## Migration from Old UI

The old `index.html` file is still available but **deprecated**. To use the new UI:

1. Use `./start-system.sh` instead of `./start.sh`
2. Access http://localhost:3001 instead of opening `index.html`
3. All functionality from the old UI is preserved and enhanced

## Security Best Practices

1. **API Key Protection**
   - ✅ API key stored in server-side `.env.local`
   - ✅ Never exposed to browser
   - ✅ `.env.local` in `.gitignore`

2. **CORS Configuration**
   - Currently set to `*` (allow all origins)
   - For production, restrict to your domain:
     ```javascript
     // In server.js
     res.setHeader('Access-Control-Allow-Origin', 'https://yourdomain.com');
     ```

3. **Rate Limiting**
   - Consider adding rate limiting for production
   - Example using `express-rate-limit` (if you migrate to Express)

## Performance

- **Next.js Turbopack**: Lightning-fast hot reload (< 1s)
- **Server-side rendering**: Initial page load optimized
- **Code splitting**: Automatic chunk optimization
- **Image optimization**: Built-in Next.js image handling (if added later)
- **CSS optimization**: Tailwind CSS purges unused styles in production

## Future Enhancements

Potential improvements for future versions:

1. **Authentication**: Add user accounts and API key management
2. **Video Gallery**: Save and browse generated videos
3. **Batch Generation**: Queue multiple videos
4. **Advanced Settings**: Expose more Sora 2 API parameters
5. **Themes**: Add dark/light mode toggle
6. **i18n**: Multi-language support
7. **Analytics**: Track generation metrics
8. **Social Sharing**: Share generated videos
9. **Templates**: Pre-made prompt templates
10. **History**: View past generations and re-use prompts

## License

This project is for educational and personal use. Ensure you comply with OpenAI's terms of service and Sora 2 API usage policies.

## Support

For issues, questions, or feature requests:

1. Check this README first
2. Review the troubleshooting section
3. Check the OpenAI API status: https://status.openai.com
4. Review server logs for detailed error messages

## Credits

- **UI Framework**: [Next.js](https://nextjs.org/)
- **UI Components**: [ShadCN UI](https://ui.shadcn.com/)
- **Icons**: [Lucide](https://lucide.dev/)
- **AI Video Generation**: [OpenAI Sora 2](https://openai.com/sora)

---

**Built with ❤️ using modern web technologies**

Last Updated: October 19, 2025
