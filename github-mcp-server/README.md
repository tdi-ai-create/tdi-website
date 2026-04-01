# GitHub MCP HTTP/SSE Server

Bridges `@modelcontextprotocol/server-github` (stdio) to HTTP/SSE transport for Railway deployment.

## Endpoints
- `GET /health` — health check
- `GET /mcp` — SSE stream (Claude connects here)
- `POST /mcp?sessionId=xxx` — JSON-RPC endpoint

## Railway Setup
Service ID: `076c612c-4ff9-4ba3-ba9e-ee2b0d69ae77`

Required env var: `GITHUB_PERSONAL_ACCESS_TOKEN` (already set in Railway)
