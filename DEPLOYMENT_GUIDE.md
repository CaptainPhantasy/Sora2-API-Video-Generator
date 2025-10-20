# Sora 2 Video Generator - Deployment Guide

## 🎯 Quick Start

### Option 1: Automated Startup (Recommended)

```bash
./start.sh
```

This will:
1. Check for `.env.local` with your API key
2. Start the backend server on port 3000
3. Open the GUI in your browser
4. Keep the server running

**To stop**: Press `Ctrl+C`

---

### Option 2: Manual Startup

```bash
# 1. Load environment variables and start server
source .env.local
node server.js

# 2. In another terminal or just open in browser
open index.html
```

---

## 📋 Prerequisites

### Required

- **Node.js** v14+ ([Download](https://nodejs.org/))
- **OpenAI API Key** with Sora 2 access

### Verify Installation

```bash
node --version  # Should show v14.0.0 or higher
npm --version   # Should show 6.0.0 or higher
```

---

## 🔧 Setup Instructions

### Step 1: Configure API Key

The API key is already in `.env.local`:

```bash
# .env.local (already created)
OPENAI_API_KEY=sk-proj-your-key-here
PORT=3000
```

**⚠️ Security Note**: This file is in `.gitignore` and won't be committed.

### Step 2: Start the Server

**Option A: Use startup script**
```bash
./start.sh
```

**Option B: Manual start**
```bash
# Load env and start
OPENAI_API_KEY="your-key" PORT=3000 node server.js
```

### Step 3: Open the GUI

The GUI will open automatically, or manually open:
```bash
open index.html        # macOS
xdg-open index.html    # Linux
start index.html       # Windows
```

---

## 🌐 How It Works

### Architecture

```
Browser (index.html)
    ↓ HTTP Request
Local Server (server.js) ← Reads .env.local
    ↓ HTTPS Request
OpenAI Sora 2 API
```

### Why a Backend Server?

**Problem**: Browsers can't directly call OpenAI's API due to CORS restrictions.

**Solution**: A local Node.js server acts as a proxy:
1. Browser calls `http://localhost:3000/api/video/generate`
2. Server forwards request to `https://api.openai.com/v1/video/generations`
3. Server returns response to browser

**Benefits**:
- ✅ No CORS issues
- ✅ API key stays on server (more secure)
- ✅ Can add rate limiting, logging, etc.

---

## 📡 API Endpoints

### Health Check
```bash
curl http://localhost:3000/health
```

**Response**:
```json
{
  "status": "ok",
  "apiKeyConfigured": true,
  "server": "Sora 2 Proxy"
}
```

### Generate Video
```bash
curl -X POST http://localhost:3000/api/video/generate \
  -H "Content-Type: application/json" \
  -d '{
    "model": "sora-2",
    "prompt": "A golden retriever running in a field",
    "duration": 5,
    "resolution": "1280x720",
    "quality": "standard"
  }'
```

**Response**:
```json
{
  "id": "job_abc123",
  "status": "processing",
  "created_at": "2025-10-19T..."
}
```

### Check Status
```bash
curl http://localhost:3000/api/video/status/job_abc123
```

**Response** (completed):
```json
{
  "id": "job_abc123",
  "status": "completed",
  "video_url": "https://...",
  "duration": 5,
  "resolution": "1280x720"
}
```

---

## 🚀 Deployment Options

### Option 1: Local Development (Current)

✅ **Best for**: Personal use, testing

**Setup**: Already done! Just run `./start.sh`

**Pros**:
- No server costs
- Full control
- Instant setup

**Cons**:
- Must keep computer running
- Only accessible on your machine

---

### Option 2: Cloud Deployment (Production)

For making this available to others or running 24/7.

#### Deploy to Vercel (Recommended)

**1. Install Vercel CLI**
```bash
npm install -g vercel
```

**2. Create `vercel.json`**
```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    },
    {
      "src": "index.html",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    { "src": "/api/(.*)", "dest": "/server.js" },
    { "src": "/(.*)", "dest": "/$1" }
  ],
  "env": {
    "OPENAI_API_KEY": "@openai-api-key"
  }
}
```

**3. Deploy**
```bash
# Set secret
vercel secrets add openai-api-key "sk-proj-your-key"

# Deploy
vercel --prod
```

**4. Update Frontend**
In `index.html`, change:
```javascript
const API_BASE_URL = 'https://your-app.vercel.app';
```

---

#### Deploy to Heroku

**1. Create `Procfile`**
```
web: node server.js
```

**2. Deploy**
```bash
# Install Heroku CLI
brew install heroku/brew/heroku  # macOS

# Login and create app
heroku login
heroku create sora2-video-generator

# Set environment variable
heroku config:set OPENAI_API_KEY="sk-proj-your-key"

# Deploy
git push heroku main
```

---

#### Deploy to Railway

**1. Install Railway CLI**
```bash
npm install -g @railway/cli
```

**2. Deploy**
```bash
railway login
railway init
railway add
railway up
```

**3. Set environment variable** in Railway dashboard

---

### Option 3: Docker Container

**1. Create `Dockerfile`**
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY server.js .
COPY index.html .

EXPOSE 3000

CMD ["node", "server.js"]
```

**2. Build and run**
```bash
# Build
docker build -t sora2-generator .

# Run
docker run -p 3000:3000 \
  -e OPENAI_API_KEY="sk-proj-your-key" \
  sora2-generator
```

---

## 🔒 Security Best Practices

### API Key Security

1. **Never commit `.env.local`** ✅ (already in .gitignore)
2. **Rotate the API key** immediately if exposed
3. **Set spending limits** in OpenAI dashboard
4. **Use dedicated keys** for different environments

### Rate Limiting (Optional)

Add to `server.js`:
```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10 // limit each IP to 10 requests per windowMs
});

app.use('/api/', limiter);
```

### CORS Configuration

For production, restrict CORS:
```javascript
// In server.js, change from:
res.setHeader('Access-Control-Allow-Origin', '*');

// To:
res.setHeader('Access-Control-Allow-Origin', 'https://your-domain.com');
```

---

## 🐛 Troubleshooting

### Server Won't Start

**Error**: `EADDRINUSE: address already in use :::3000`

**Solution**:
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or change port
PORT=3001 node server.js
```

---

### API Key Not Working

**Error**: `apiKeyConfigured: false`

**Solution**:
```bash
# Check .env.local exists
cat .env.local

# Verify format (no quotes, no spaces around =)
OPENAI_API_KEY=sk-proj-...

# Reload and restart
source .env.local
node server.js
```

---

### CORS Errors in Browser

**Error**: `No 'Access-Control-Allow-Origin' header`

**Solution**: Make sure you're using the proxy server, not calling OpenAI directly.

✅ **Correct**: `fetch('http://localhost:3000/api/video/generate')`
❌ **Wrong**: `fetch('https://api.openai.com/v1/video/generations')`

---

### Can't Connect to Server

**Error**: `Failed to fetch` or `ERR_CONNECTION_REFUSED`

**Solutions**:
1. **Check server is running**: `curl http://localhost:3000/health`
2. **Check firewall**: Allow port 3000
3. **Check port**: Verify in `index.html` and server match
4. **Check browser console**: Look for detailed errors

---

### Video Generation Fails

**Error**: `Failed to create video generation job`

**Solutions**:
1. **Check API key** has Sora 2 access
2. **Check OpenAI account** has credits
3. **Check prompt** complies with content policy
4. **Check server logs** for detailed error

---

## 📊 Monitoring

### Server Logs

The server logs all requests with colors:
- 🔵 Blue: Info messages
- 🟡 Yellow: Processing/warnings
- 🟢 Green: Success
- 🔴 Red: Errors

### Health Monitoring

```bash
# Check if server is healthy
curl http://localhost:3000/health

# Watch logs in real-time
tail -f server.log  # if you redirect output
```

---

## 🔄 Updates & Maintenance

### Update Node.js

```bash
# Check current version
node --version

# Update (macOS with Homebrew)
brew upgrade node

# Update (using nvm)
nvm install node --latest-npm
```

### Update Dependencies

This project has zero dependencies (pure Node.js), so no updates needed!

---

## 📈 Scaling

### For Heavy Use

1. **Add Redis caching** for job status
2. **Use PM2** for process management
3. **Add load balancer** for multiple instances
4. **Implement job queue** (Bull, Bee-Queue)

### Example with PM2

```bash
# Install PM2
npm install -g pm2

# Start with PM2
pm2 start server.js --name sora2-server

# Auto-restart on reboot
pm2 startup
pm2 save

# Monitor
pm2 monit
```

---

## 🆘 Support

### Common Issues

| Issue | Solution |
|-------|----------|
| Server won't start | Check port 3000 is free |
| API key not working | Verify `.env.local` format |
| CORS errors | Use proxy server, not direct API |
| Video fails | Check API key has Sora 2 access |

### Getting Help

1. **Check logs**: Server prints detailed errors
2. **Test health**: `curl http://localhost:3000/health`
3. **Check OpenAI status**: https://status.openai.com
4. **Review documentation**: See README.md

---

## ✅ Deployment Checklist

### Before Going Live

- [ ] API key configured in `.env.local`
- [ ] `.env.local` in `.gitignore`
- [ ] Server starts successfully
- [ ] Health endpoint returns OK
- [ ] Test video generation works
- [ ] Error handling tested
- [ ] CORS configured for production domain
- [ ] Rate limiting added (if public)
- [ ] Monitoring/logging set up
- [ ] Backup plan for API key rotation

---

## 🎉 You're Ready!

Your Sora 2 Video Generator is now fully deployed and ready to use!

**Quick commands**:
```bash
# Start server
./start.sh

# Test it works
curl http://localhost:3000/health

# Open GUI
open index.html
```

**Happy video generating! 🎬**
