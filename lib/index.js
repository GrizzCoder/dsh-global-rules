import { readFile, writeFile } from 'node:fs/promises'
import { homedir } from 'node:os'
import { join, resolve, dirname } from 'node:path'
import { spawn } from 'node:child_process'

export const name = 'global-rules'

const MAX_BODY_BYTES = 256 * 1024
const HOME_ENV = 'DSH_HOME'
const HOME_DIR_NAME = '.dsh'
const FILE_NAME = 'AGENTS.md'
const ROUTE_PATH = '/api/global-rules'
const REVEAL_ROUTE_PATH = '/api/global-rules/reveal'

function jsonResponse(status, payload) {
  return Response.json(payload, {
    status,
    headers: { 'cache-control': 'no-store' },
  })
}

function messageOf(error) {
  return String((error && error.message) || error)
}

function expandHomePath(path) {
  if (path === '~') {
    return homedir()
  }
  if (path.startsWith('~/') || path.startsWith('~\\')) {
    return join(homedir(), path.slice(2))
  }
  return path
}

function resolveHome() {
  const configured = process.env[HOME_ENV]
  const chosen = configured !== undefined && configured.trim().length > 0
    ? configured
    : join(homedir(), HOME_DIR_NAME)
  return resolve(expandHomePath(chosen))
}

function openInFileManager(filePath) {
  const platform = process.platform
  if (platform === 'win32') {
    spawn('explorer.exe', [`/select,${filePath}`], { detached: true, stdio: 'ignore' }).unref()
  } else if (platform === 'darwin') {
    spawn('open', ['-R', filePath], { detached: true, stdio: 'ignore' }).unref()
  } else {
    // Linux
    spawn('xdg-open', [dirname(filePath)], { detached: true, stdio: 'ignore' }).unref()
  }
}

async function handle(request, file) {
  if (request.method === 'GET') {
    try {
      const content = await readFile(file, 'utf8')
      return jsonResponse(200, { exists: true, content, path: file })
    } catch (error) {
      if (error && error.code === 'ENOENT') {
        return jsonResponse(200, { exists: false, content: '', path: file })
      }
      return jsonResponse(500, { error: messageOf(error) })
    }
  }
  let body
  try {
    const declared = Number(request.headers.get('content-length'))
    if (Number.isFinite(declared) && declared > MAX_BODY_BYTES) {
      return jsonResponse(413, { error: 'request body too large' })
    }
    const text = await request.text()
    if (Buffer.byteLength(text, 'utf8') > MAX_BODY_BYTES) {
      return jsonResponse(413, { error: 'request body too large' })
    }
    body = JSON.parse(text)
  } catch {
    return jsonResponse(400, { error: 'request body must be JSON' })
  }
  const content = typeof body === 'object' && body !== null ? body.content : undefined
  if (typeof content !== 'string') {
    return jsonResponse(400, { error: 'content must be a string' })
  }
  try {
    await writeFile(file, content, 'utf8')
    return jsonResponse(200, { ok: true, path: file })
  } catch (error) {
    return jsonResponse(500, { error: messageOf(error) })
  }
}

async function handleReveal(request, file) {
  if (request.method === 'POST') {
    try {
      openInFileManager(file)
      return jsonResponse(200, { ok: true })
    } catch (error) {
      return jsonResponse(500, { error: messageOf(error) })
    }
  }
  return jsonResponse(405, { error: 'method not allowed' })
}

export function apply(ctx) {
  const home = resolveHome()
  const file = join(home, FILE_NAME)
  ctx.inject(['connection'], (host) => {
    host.connection.fetch.register({
      path: ROUTE_PATH,
      methods: ['GET', 'POST'],
      requestBody: 'buffered',
      fetch: (request) => handle(request, file),
    })
    host.connection.fetch.register({
      path: REVEAL_ROUTE_PATH,
      methods: ['POST'],
      requestBody: 'buffered',
      fetch: (request) => handleReveal(request, file),
    })
  })
}
