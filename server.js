#!/usr/bin/env node

const http = require('node:http')

const DEFAULT_BODY_LIMIT = 64 * 1024
const VIDEO_ID_PATTERN = /^video_[A-Za-z0-9_-]{1,128}$/
const ALLOWED_MODELS = new Set(['sora-2', 'sora-2-pro'])
const ALLOWED_SECONDS = new Set(['4', '8', '12'])
const ALLOWED_SIZES = new Set(['720x1280', '1280x720', '1024x1792', '1792x1024'])

function sendJson(res, statusCode, body, headers = {}) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'no-referrer',
    ...headers,
  })
  res.end(JSON.stringify(body))
}

function readJson(req, limit = DEFAULT_BODY_LIMIT) {
  return new Promise((resolve, reject) => {
    let body = ''
    let size = 0

    req.setEncoding('utf8')
    req.on('data', (chunk) => {
      size += Buffer.byteLength(chunk)
      if (size > limit) {
        const error = new Error('Request body is too large')
        error.statusCode = 413
        reject(error)
        req.destroy()
        return
      }
      body += chunk
    })
    req.on('end', () => {
      try {
        resolve(JSON.parse(body))
      } catch {
        const error = new Error('Invalid JSON')
        error.statusCode = 400
        reject(error)
      }
    })
    req.on('error', reject)
  })
}

function validateCreateRequest(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return { error: 'Request body must be an object' }
  }

  const prompt = typeof input.prompt === 'string' ? input.prompt.trim() : ''
  const model = input.model || 'sora-2'
  const seconds = String(input.seconds || '4')
  const size = input.size || '720x1280'

  if (!prompt || prompt.length > 32000) return { error: 'Prompt must contain 1 to 32000 characters' }
  if (!ALLOWED_MODELS.has(model)) return { error: 'Unsupported video model' }
  if (!ALLOWED_SECONDS.has(seconds)) return { error: 'Unsupported video duration' }
  if (!ALLOWED_SIZES.has(size)) return { error: 'Unsupported video size' }

  return { value: { prompt, model, seconds, size } }
}

function createRateLimiter({ limit = 30, windowMs = 60_000 } = {}) {
  const buckets = new Map()

  return (key) => {
    const now = Date.now()
    const bucket = buckets.get(key)
    if (!bucket || now - bucket.startedAt >= windowMs) {
      buckets.set(key, { count: 1, startedAt: now })
      return false
    }
    bucket.count += 1
    return bucket.count > limit
  }
}

function createAppServer(options = {}) {
  const apiKey = options.apiKey ?? process.env.OPENAI_API_KEY ?? ''
  const fetchImpl = options.fetchImpl ?? globalThis.fetch
  const allowedOrigins = new Set(
    options.allowedOrigins ??
      (process.env.ALLOWED_ORIGINS || 'http://localhost:3001,http://127.0.0.1:3001')
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean),
  )
  const isRateLimited = createRateLimiter(options.rateLimit)

  return http.createServer(async (req, res) => {
    const origin = req.headers.origin
    if (origin && !allowedOrigins.has(origin)) {
      sendJson(res, 403, { error: 'Origin is not allowed' })
      return
    }

    const corsHeaders = origin ? { 'Access-Control-Allow-Origin': origin, Vary: 'Origin' } : {}
    if (req.method === 'OPTIONS') {
      res.writeHead(204, {
        ...corsHeaders,
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '600',
      })
      res.end()
      return
    }

    const requestUrl = new URL(req.url, 'http://localhost')
    const pathname = requestUrl.pathname
    const clientKey = req.socket.remoteAddress || 'unknown'

    if (pathname === '/health' && req.method === 'GET') {
      sendJson(res, 200, { status: 'ok', apiConfigured: Boolean(apiKey) }, corsHeaders)
      return
    }

    if (!pathname.startsWith('/api/video/')) {
      sendJson(res, 404, { error: 'Not found' }, corsHeaders)
      return
    }
    if (!apiKey) {
      sendJson(res, 503, { error: 'Video API is not configured' }, corsHeaders)
      return
    }
    if (isRateLimited(clientKey)) {
      sendJson(res, 429, { error: 'Too many requests' }, { ...corsHeaders, 'Retry-After': '60' })
      return
    }

    try {
      if (pathname === '/api/video/generate' && req.method === 'POST') {
        const parsed = validateCreateRequest(await readJson(req))
        if (parsed.error) {
          sendJson(res, 400, { error: parsed.error }, corsHeaders)
          return
        }

        const form = new FormData()
        for (const [key, value] of Object.entries(parsed.value)) form.set(key, value)
        const upstream = await fetchImpl('https://api.openai.com/v1/videos', {
          method: 'POST',
          headers: { Authorization: `Bearer ${apiKey}` },
          body: form,
        })
        const payload = await upstream.json().catch(() => ({ error: { message: 'Invalid upstream response' } }))
        sendJson(res, upstream.status, payload, corsHeaders)
        return
      }

      const statusMatch = pathname.match(/^\/api\/video\/status\/(.+)$/)
      if (statusMatch && req.method === 'GET') {
        const jobId = decodeURIComponent(statusMatch[1])
        if (!VIDEO_ID_PATTERN.test(jobId)) {
          sendJson(res, 400, { error: 'Invalid video ID' }, corsHeaders)
          return
        }
        const upstream = await fetchImpl(`https://api.openai.com/v1/videos/${jobId}`, {
          headers: { Authorization: `Bearer ${apiKey}` },
        })
        const payload = await upstream.json().catch(() => ({ error: { message: 'Invalid upstream response' } }))
        sendJson(res, upstream.status, payload, corsHeaders)
        return
      }

      const downloadMatch = pathname.match(/^\/api\/video\/download\/(.+)$/)
      if (downloadMatch && req.method === 'GET') {
        const jobId = decodeURIComponent(downloadMatch[1])
        if (!VIDEO_ID_PATTERN.test(jobId)) {
          sendJson(res, 400, { error: 'Invalid video ID' }, corsHeaders)
          return
        }
        const upstream = await fetchImpl(`https://api.openai.com/v1/videos/${jobId}/content`, {
          headers: { Authorization: `Bearer ${apiKey}` },
        })
        if (!upstream.ok || !upstream.body) {
          const payload = await upstream.json().catch(() => ({ error: { message: 'Download failed' } }))
          sendJson(res, upstream.status, payload, corsHeaders)
          return
        }
        res.writeHead(upstream.status, {
          ...corsHeaders,
          'Content-Type': upstream.headers.get('content-type') || 'video/mp4',
          'Content-Disposition': `attachment; filename="sora-${jobId}.mp4"`,
          'Cache-Control': 'private, no-store',
          'X-Content-Type-Options': 'nosniff',
        })
        for await (const chunk of upstream.body) res.write(chunk)
        res.end()
        return
      }

      sendJson(res, 404, { error: 'Not found' }, corsHeaders)
    } catch (error) {
      const statusCode = Number.isInteger(error.statusCode) ? error.statusCode : 502
      sendJson(res, statusCode, { error: statusCode < 500 ? error.message : 'Upstream video request failed' }, corsHeaders)
    }
  })
}

if (require.main === module) {
  const port = Number(process.env.PORT || 3000)
  const host = process.env.HOST || '127.0.0.1'
  const server = createAppServer()
  server.listen(port, host, () => {
    console.log(`Sora video proxy listening at http://${host}:${port}`)
  })

  const shutdown = () => server.close(() => process.exit(0))
  process.on('SIGTERM', shutdown)
  process.on('SIGINT', shutdown)
}

module.exports = { createAppServer, validateCreateRequest }
