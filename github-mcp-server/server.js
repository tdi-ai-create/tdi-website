#!/usr/bin/env node
/**
 * GitHub MCP HTTP/SSE Server
 * Bridges @modelcontextprotocol/server-github (stdio) to HTTP/SSE transport.
 * Connect Claude at: https://<your-railway-domain>/mcp
 */

const express = require('express');
const { spawn } = require('child_process');
const { createServer } = require('http');

const PORT = process.env.PORT || 3000;
const GITHUB_TOKEN = process.env.GITHUB_PERSONAL_ACCESS_TOKEN;

if (!GITHUB_TOKEN) {
  console.error('[github-mcp] ERROR: GITHUB_PERSONAL_ACCESS_TOKEN not set');
  process.exit(1);
}

const app = express();
app.use(express.json());

app.use((_req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, mcp-session-id');
  if (_req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'github-mcp' }));

const sessions = new Map();
const makeId = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

app.get('/mcp', (req, res) => {
  const sessionId = makeId();
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  });

  const proc = spawn(
    process.execPath,
    ['node_modules/@modelcontextprotocol/server-github/dist/index.js'],
    {
      env: { ...process.env, GITHUB_PERSONAL_ACCESS_TOKEN: GITHUB_TOKEN },
      stdio: ['pipe', 'pipe', 'inherit'],
    }
  );

  sessions.set(sessionId, { res, proc });
  res.write('event: endpoint\ndata: /mcp?sessionId=' + sessionId + '\n\n');

  let buf = '';
  proc.stdout.on('data', chunk => {
    buf += chunk.toString();
    const lines = buf.split('\n');
    buf = lines.pop() || '';
    for (const line of lines) {
      if (line.trim()) res.write('data: ' + line + '\n\n');
    }
  });

  proc.on('error', err => console.error('[github-mcp] proc error:', err.message));
  proc.on('exit', code => {
    console.log('[github-mcp] proc exited:', code);
    sessions.delete(sessionId);
    try { res.end(); } catch (_) {}
  });

  req.on('close', () => {
    proc.kill('SIGTERM');
    sessions.delete(sessionId);
  });
});

app.post('/mcp', (req, res) => {
  const session = sessions.get(req.query.sessionId);
  if (!session) return res.status(404).json({ error: 'Session not found or expired' });
  session.proc.stdin.write(JSON.stringify(req.body) + '\n');
  res.status(202).end();
});

const httpServer = createServer(app);
httpServer.listen(PORT, () => {
  console.log('[github-mcp] Running on port', PORT);
  console.log('[github-mcp] MCP endpoint: /mcp');
});

process.on('SIGTERM', () => {
  for (const [, s] of sessions) {
    try { s.proc.kill('SIGTERM'); } catch (_) {}
  }
  httpServer.close();
});
