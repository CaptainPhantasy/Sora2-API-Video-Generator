#!/bin/bash

# Sora 2 Video Generator - Complete System Startup Script
# This script starts both the backend proxy server and the Next.js frontend

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}============================================================${NC}"
echo -e "${GREEN}🚀 Starting Sora 2 Video Generator - Complete System${NC}"
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

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ Error: npm is not installed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ npm found: $(npm --version)${NC}"

# Check if frontend dependencies are installed
if [ ! -d "frontend/node_modules" ]; then
    echo -e "${YELLOW}⚠️  Frontend dependencies not found${NC}"
    echo -e "${BLUE}📦 Installing frontend dependencies...${NC}"
    cd frontend && npm install && cd ..
    echo -e "${GREEN}✅ Frontend dependencies installed${NC}"
fi

# Kill any existing processes on ports 3000 and 3001
echo -e "${BLUE}🧹 Cleaning up existing processes...${NC}"
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
    echo -e "${YELLOW}⚠️  Port 3000 is already in use${NC}"
    echo -e "${YELLOW}Killing existing process...${NC}"
    lsof -ti:3000 | xargs kill -9 2>/dev/null
    sleep 1
fi

if lsof -Pi :3001 -sTCP:LISTEN -t >/dev/null ; then
    echo -e "${YELLOW}⚠️  Port 3001 is already in use${NC}"
    echo -e "${YELLOW}Killing existing process...${NC}"
    lsof -ti:3001 | xargs kill -9 2>/dev/null
    sleep 1
fi

# Start the backend server
echo -e "${BLUE}🚀 Starting backend proxy server on port ${PORT:-3000}...${NC}"
node server.js > /dev/null 2>&1 &
BACKEND_PID=$!

# Wait for backend to start
sleep 2

# Check if backend is running
if curl -s http://localhost:3000/health > /dev/null; then
    echo -e "${GREEN}✅ Backend server is running!${NC}"
else
    echo -e "${RED}❌ Backend server failed to start${NC}"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

# Start the frontend server
echo -e "${BLUE}🚀 Starting Next.js frontend on port 3001...${NC}"
cd frontend && npm run dev > /dev/null 2>&1 &
FRONTEND_PID=$!
cd ..

# Wait for frontend to start
sleep 3

# Check if frontend is running
if curl -s http://localhost:3001 > /dev/null; then
    echo -e "${GREEN}✅ Frontend server is running!${NC}"
else
    echo -e "${RED}❌ Frontend server failed to start${NC}"
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit 1
fi

echo ""
echo -e "${GREEN}============================================================${NC}"
echo -e "${GREEN}✨ Sora 2 Video Generator is ready!${NC}"
echo -e "${GREEN}============================================================${NC}"
echo ""
echo -e "${BLUE}📡 Backend API:  ${NC}http://localhost:3000"
echo -e "${BLUE}🌐 Frontend UI:  ${NC}http://localhost:3001"
echo -e "${BLUE}🔑 API Key configured: ${GREEN}✅${NC}"
echo ""
echo -e "${BLUE}📋 Available API endpoints:${NC}"
echo -e "   GET  http://localhost:3000/health"
echo -e "   POST http://localhost:3000/api/video/generate"
echo -e "   GET  http://localhost:3000/api/video/status/:id"
echo -e "   GET  http://localhost:3000/api/video/download/:id"
echo ""
echo -e "${GREEN}🌐 Opening browser...${NC}"
echo ""

# Open the frontend in the default browser (macOS)
if [[ "$OSTYPE" == "darwin"* ]]; then
    open http://localhost:3001
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    xdg-open http://localhost:3001 2>/dev/null || echo -e "${YELLOW}Please open http://localhost:3001 manually${NC}"
fi

echo -e "${YELLOW}⚠️  Press Ctrl+C to stop both servers${NC}"
echo ""

# Function to cleanup on exit
cleanup() {
    echo ""
    echo -e "${YELLOW}🛑 Shutting down servers...${NC}"
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    lsof -ti:3000 | xargs kill -9 2>/dev/null
    lsof -ti:3001 | xargs kill -9 2>/dev/null
    echo -e "${GREEN}✅ Servers stopped${NC}"
    exit 0
}

# Trap Ctrl+C and call cleanup
trap cleanup SIGINT SIGTERM

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID
