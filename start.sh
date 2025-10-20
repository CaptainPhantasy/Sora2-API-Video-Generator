#!/bin/bash

# Sora 2 Video Generator - Startup Script
# This script starts the backend proxy server and opens the GUI

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}============================================================${NC}"
echo -e "${GREEN}🚀 Starting Sora 2 Video Generator${NC}"
echo -e "${GREEN}============================================================${NC}"

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo -e "${RED}❌ Error: .env.local file not found${NC}"
    echo -e "${YELLOW}Please create .env.local with your OPENAI_API_KEY${NC}"
    echo ""
    echo "Example:"
    echo "OPENAI_API_KEY=sk-proj-your-key-here"
    echo "PORT=3000"
    exit 1
fi

# Load environment variables
echo -e "${BLUE}📋 Loading environment variables...${NC}"
export $(cat .env.local | xargs)

# Check if API key is set
if [ -z "$OPENAI_API_KEY" ]; then
    echo -e "${RED}❌ Error: OPENAI_API_KEY not set in .env.local${NC}"
    exit 1
fi

echo -e "${GREEN}✅ API key loaded${NC}"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Error: Node.js is not installed${NC}"
    echo -e "${YELLOW}Please install Node.js from https://nodejs.org/${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js found: $(node --version)${NC}"

# Check if port 3000 is already in use
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
    echo -e "${YELLOW}⚠️  Port 3000 is already in use${NC}"
    echo -e "${YELLOW}Killing existing process...${NC}"
    lsof -ti:3000 | xargs kill -9 2>/dev/null
    sleep 1
fi

# Start the server
echo -e "${BLUE}🚀 Starting backend server on port ${PORT:-3000}...${NC}"
node server.js &
SERVER_PID=$!

# Wait for server to start
echo -e "${BLUE}⏳ Waiting for server to start...${NC}"
sleep 2

# Check if server is running
if curl -s http://localhost:3000/health > /dev/null; then
    echo -e "${GREEN}✅ Server is running!${NC}"
    echo -e "${BLUE}📡 Server URL: http://localhost:3000${NC}"
    echo -e "${BLUE}🔑 API Key configured: ✅${NC}"
    echo ""
    echo -e "${GREEN}============================================================${NC}"
    echo -e "${GREEN}✨ Sora 2 Video Generator is ready!${NC}"
    echo -e "${GREEN}============================================================${NC}"
    echo ""
    echo -e "${BLUE}📖 Next steps:${NC}"
    echo -e "   1. Open ${YELLOW}index.html${NC} in your browser"
    echo -e "   2. Fill in the video generation form"
    echo -e "   3. Click 'Generate Video'"
    echo ""
    echo -e "${BLUE}📋 Server endpoints:${NC}"
    echo -e "   GET  http://localhost:3000/health"
    echo -e "   POST http://localhost:3000/api/video/generate"
    echo -e "   GET  http://localhost:3000/api/video/status/:id"
    echo ""
    echo -e "${YELLOW}⚠️  Press Ctrl+C to stop the server${NC}"
    echo ""

    # Open the GUI in the default browser (macOS)
    if [[ "$OSTYPE" == "darwin"* ]]; then
        echo -e "${BLUE}🌐 Opening GUI in browser...${NC}"
        open index.html
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        echo -e "${BLUE}🌐 Opening GUI in browser...${NC}"
        xdg-open index.html 2>/dev/null || echo "Please open index.html manually"
    fi

    # Wait for server process
    wait $SERVER_PID
else
    echo -e "${RED}❌ Server failed to start${NC}"
    echo -e "${YELLOW}Check the logs above for errors${NC}"
    kill $SERVER_PID 2>/dev/null
    exit 1
fi
