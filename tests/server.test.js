const assert = require('node:assert/strict')
const { afterEach, test } = require('node:test')

const { createAppServer, validateCreateRequest } = require('../server')

const servers = []

afterEach(async () => {
  await Promise.all(servers.splice(0).map((server) => new Promise((resolve) => server.close(resolve))))
})

async function startServer(options = {}) {
  const server = createAppServer(options)
  servers.push(server)
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
  const { port } = server.address()
  return `http://127.0.0.1:${port}`
}

test('create request accepts only current video API values', () => {
  assert.deepEqual(validateCreateRequest({
    prompt: 'A lighthouse in a storm',
    model: 'sora-2',
    seconds: 8,
    size: '1280x720',
  }), {
    value: {
      prompt: 'A lighthouse in a storm',
      model: 'sora-2',
      seconds: '8',
      size: '1280x720',
    },
  })
  assert.equal(validateCreateRequest({ prompt: 'x', size: '3840x2160' }).error, 'Unsupported video size')
})

test('server rejects unapproved browser origins', async () => {
  const baseUrl = await startServer({ apiKey: 'test-key' })
  const response = await fetch(`${baseUrl}/health`, { headers: { Origin: 'https://example.com' } })
  assert.equal(response.status, 403)
})

test('server sends validated multipart fields without exposing the API key', async () => {
  let upstreamRequest
  const baseUrl = await startServer({
    apiKey: 'server-only-key',
    fetchImpl: async (url, init) => {
      upstreamRequest = { url, init }
      return new Response(JSON.stringify({ id: 'video_test', status: 'queued' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    },
  })

  const response = await fetch(`${baseUrl}/api/video/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: 'http://localhost:3001' },
    body: JSON.stringify({ prompt: 'A lighthouse', model: 'sora-2-pro', seconds: '8', size: '1792x1024' }),
  })

  assert.equal(response.status, 200)
  assert.equal(upstreamRequest.url, 'https://api.openai.com/v1/videos')
  assert.equal(upstreamRequest.init.headers.Authorization, 'Bearer server-only-key')
  assert.equal(upstreamRequest.init.body.get('prompt'), 'A lighthouse')
  assert.equal(upstreamRequest.init.body.get('size'), '1792x1024')
  assert.equal(JSON.stringify(await response.json()).includes('server-only-key'), false)
})

test('server rejects malformed video identifiers before an upstream request', async () => {
  let called = false
  const baseUrl = await startServer({
    apiKey: 'test-key',
    fetchImpl: async () => {
      called = true
      throw new Error('unexpected')
    },
  })
  const response = await fetch(`${baseUrl}/api/video/status/../../secrets`, {
    headers: { Origin: 'http://localhost:3001' },
  })
  assert.equal(response.status, 404)
  assert.equal(called, false)
})
