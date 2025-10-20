#!/usr/bin/env node
/**
 * Sora 2 Video Generator - Backend Proxy Server
 *
 * This server acts as a proxy between the browser and OpenAI's API
 * to avoid CORS issues and keep the API key secure on the server side.
 */

const http = require('http');
const https = require('https');
const url = require('url');

// Configuration
const PORT = process.env.PORT || 3000;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';

// ANSI colors for console
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[36m',
    red: '\x1b[31m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

// Helper function to make HTTPS requests
function makeOpenAIRequest(path, method, data, callback) {
    const options = {
        hostname: 'api.openai.com',
        port: 443,
        path: path,
        method: method,
        headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
        }
    };

    if (data && method === 'POST') {
        const jsonData = JSON.stringify(data);
        options.headers['Content-Length'] = Buffer.byteLength(jsonData);
    }

    const req = https.request(options, (res) => {
        let responseData = '';

        res.on('data', (chunk) => {
            responseData += chunk;
        });

        res.on('end', () => {
            try {
                const parsed = JSON.parse(responseData);
                callback(null, parsed, res.statusCode);
            } catch (e) {
                callback(null, responseData, res.statusCode);
            }
        });
    });

    req.on('error', (error) => {
        callback(error);
    });

    if (data && method === 'POST') {
        req.write(JSON.stringify(data));
    }

    req.end();
}

// Create HTTP server
const server = http.createServer((req, res) => {
    // Enable CORS for all origins (you can restrict this in production)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;

    log(`${req.method} ${pathname}`, 'blue');

    // Health check endpoint
    if (pathname === '/health' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            status: 'ok',
            apiKeyConfigured: !!OPENAI_API_KEY,
            server: 'Sora 2 Proxy'
        }));
        return;
    }

    // Create video generation job
    if (pathname === '/api/video/generate' && req.method === 'POST') {
        let body = '';

        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', () => {
            try {
                const requestData = JSON.parse(body);

                log(`Creating video: ${requestData.prompt?.substring(0, 50)}...`, 'yellow');

                makeOpenAIRequest('/v1/videos', 'POST', requestData, (error, data, statusCode) => {
                    if (error) {
                        log(`Error: ${error.message}`, 'red');
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: error.message }));
                        return;
                    }

                    log(`Response: ${statusCode}`, statusCode === 200 ? 'green' : 'red');
                    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(data));
                });
            } catch (e) {
                log(`Parse error: ${e.message}`, 'red');
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid JSON' }));
            }
        });
        return;
    }

    // Check video generation status
    if (pathname.startsWith('/api/video/status/') && req.method === 'GET') {
        const jobId = pathname.replace('/api/video/status/', '');

        log(`Checking status: ${jobId}`, 'yellow');

        makeOpenAIRequest(`/v1/videos/${jobId}`, 'GET', null, (error, data, statusCode) => {
            if (error) {
                log(`Error: ${error.message}`, 'red');
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: error.message }));
                return;
            }

            log(`Status: ${data.status || 'unknown'}`, 'green');
            res.writeHead(statusCode, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(data));
        });
        return;
    }

    // Download video content
    if (pathname.startsWith('/api/video/download/') && req.method === 'GET') {
        const jobId = pathname.replace('/api/video/download/', '');

        log(`Downloading video: ${jobId}`, 'yellow');

        const options = {
            hostname: 'api.openai.com',
            port: 443,
            path: `/v1/videos/${jobId}/content`,
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            }
        };

        const proxyReq = https.request(options, (proxyRes) => {
            log(`Download response: ${proxyRes.statusCode}`, proxyRes.statusCode === 200 ? 'green' : 'red');

            // Set headers for download
            res.writeHead(proxyRes.statusCode, {
                'Content-Type': proxyRes.headers['content-type'] || 'video/mp4',
                'Content-Disposition': `attachment; filename="sora-video-${jobId.substring(6, 16)}.mp4"`,
                'Content-Length': proxyRes.headers['content-length'],
                'Access-Control-Allow-Origin': '*'
            });

            // Pipe the video content directly to the response
            proxyRes.pipe(res);
        });

        proxyReq.on('error', (error) => {
            log(`Download error: ${error.message}`, 'red');
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: error.message }));
        });

        proxyReq.end();
        return;
    }

    // 404 for unknown endpoints
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
});

// Start server
server.listen(PORT, () => {
    log('\n' + '='.repeat(60), 'green');
    log('🚀 Sora 2 Video Generator - Proxy Server Started', 'green');
    log('='.repeat(60), 'green');
    log(`\n📡 Server running at: http://localhost:${PORT}`, 'blue');
    log(`🔑 API Key configured: ${OPENAI_API_KEY ? '✅ Yes' : '❌ No'}`, OPENAI_API_KEY ? 'green' : 'red');
    log(`\n📋 Available endpoints:`, 'yellow');
    log(`   GET  /health - Health check`, 'reset');
    log(`   POST /api/video/generate - Create video`, 'reset');
    log(`   GET  /api/video/status/:id - Check status`, 'reset');
    log(`\n💡 Open index.html in your browser to use the GUI`, 'blue');
    log(`\n⚠️  Make sure to set OPENAI_API_KEY environment variable!`, OPENAI_API_KEY ? 'reset' : 'yellow');
    log('='.repeat(60) + '\n', 'green');
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
    log('\n🛑 Shutting down server...', 'yellow');
    server.close(() => {
        log('✅ Server closed', 'green');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    log('\n🛑 Shutting down server...', 'yellow');
    server.close(() => {
        log('✅ Server closed', 'green');
        process.exit(0);
    });
});
