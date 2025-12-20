#!/usr/bin/env bun
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import fastify from 'fastify';
import { getMcpServer } from './utils/getMcpServer.js';
import { RequestContext } from './utils/toolRegistry.js';

/**
 * Extracts API key from request headers
 */
function extractApiKey(request: any): string | undefined {
  // Check common header variations
  const headers = request.headers;
  return (
    headers['x-outline-api-key'] ||
    headers['outline-api-key'] ||
    headers['authorization']?.replace(/^Bearer\s+/i, '')
  );
}

/**
 * Extracts API URL from request headers
 */
function extractApiUrl(request: any): string | undefined {
  const headers = request.headers;
  return headers['x-outline-api-url'] || headers['outline-api-url'];
}

/**
 * Sets up request context with API key and API URL
 */
function setupRequestContext(request: any): void {
  const apiKey = extractApiKey(request);
  const apiUrl = extractApiUrl(request);
  const envApiKey = process.env.OUTLINE_API_KEY;
  const envApiUrl = process.env.OUTLINE_API_URL;

  const context = RequestContext.getInstance();

  // Handle API key
  if (apiKey) {
    // Use header API key
    context.setApiKey(apiKey);
    console.log('Using API key from request headers');
  } else if (envApiKey) {
    // Use environment variable API key
    context.setApiKey(envApiKey);
    console.log('Using API key from environment variable');
  } else {
    // No API key available
    console.log('No API key provided in headers and no default environment variable set.');
    console.log(
      'Please set the OUTLINE_API_KEY environment variable or provide it in the request headers.'
    );
    throw new Error(
      'API key required: Set OUTLINE_API_KEY environment variable or provide x-outline-api-key header'
    );
  }

  // Handle API URL
  if (apiUrl) {
    // Use header API URL
    context.setApiUrl(apiUrl);
    console.log(`Using API URL from request headers: ${apiUrl}`);
  } else if (envApiUrl) {
    // Use environment variable API URL
    context.setApiUrl(envApiUrl);
    console.log(`Using API URL from environment variable: ${envApiUrl}`);
  }
  // Note: API URL is optional, defaults to https://app.getoutline.com/api in outlineClient.ts
}

// HTTP mode - default behavior
const app = fastify();

// Stateless mode (default, recommended for most deployments)
app.post('/mcp', async (request, reply) => {
  try {
    // Setup request context with API key
    setupRequestContext(request);

    const mcpServer = await getMcpServer();
    const httpTransport: StreamableHTTPServerTransport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
    });
    reply.raw.on('close', () => {
      httpTransport.close();
      mcpServer.close();
      // Clean up context
      RequestContext.resetInstance();
    });
    await mcpServer.connect(httpTransport);
    await httpTransport.handleRequest(request.raw, reply.raw, request.body);
  } catch (error: any) {
    console.error('Error in /mcp endpoint:', error.message);
    if (!reply.sent) {
      reply.code(500).send({
        jsonrpc: '2.0',
        error: {
          code: -32603,
          message: error.message || 'Internal server error',
        },
        id: null,
      });
    }
  }
});

app.get('/mcp', async (request, reply) => {
  reply.code(405).send({
    jsonrpc: '2.0',
    error: {
      code: -32000,
      message: 'Method not allowed.',
    },
    id: null,
  });
});

app.delete('/mcp', async (request, reply) => {
  reply.code(405).send({
    jsonrpc: '2.0',
    error: {
      code: -32000,
      message: 'Method not allowed.',
    },
    id: null,
  });
});

// Legacy SSE endpoint for older clients
let sseTransport: SSEServerTransport | null = null;
app.get('/sse', async (request, reply) => {
  try {
    // Setup request context with API key
    setupRequestContext(request);

    const mcpServer = await getMcpServer();
    // Create SSE transport for legacy clients
    if (!sseTransport) {
      sseTransport = new SSEServerTransport('/messages', reply.raw);
      await mcpServer.connect(sseTransport);
    }
  } catch (error: any) {
    console.error('Error in /sse endpoint:', error.message);
    if (!reply.sent) {
      reply.code(500).send({
        jsonrpc: '2.0',
        error: {
          code: -32603,
          message: error.message || 'Internal server error',
        },
        id: null,
      });
    }
  }
});

// Legacy message endpoint for older clients
app.post('/messages', async (req, res) => {
  try {
    setupRequestContext(req);

    if (!sseTransport) {
      res.status(400).send('No transport found');
      return;
    }
    await sseTransport.handlePostMessage(req.raw, res.raw, req.body);
  } catch (error: any) {
    console.error('Error in /messages endpoint:', error.message);
    res.status(500).send(error.message || 'Internal server error');
  }
});

const PORT = process.env.OUTLINE_MCP_PORT ? parseInt(process.env.OUTLINE_MCP_PORT, 10) : 6060;
const HOST = process.env.OUTLINE_MCP_HOST || '127.0.0.1';
app.listen({ port: PORT, host: HOST }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(
    `\n\nOutline MCP Server running:\n\tstreamable-http: http://${HOST}:${PORT}/mcp\n\tsse (deprecated): http://${HOST}:${PORT}/sse\n\n`
  );
  console.log('API Key Configuration:');
  console.log('- Set OUTLINE_API_KEY environment variable for default authentication');
  console.log('- Or provide x-outline-api-key header in requests for per-request authentication');
  console.log('- Or provide authorization header with Bearer token');
  console.log('\nTo use this MCP server in stdio mode, run it via `outline-mcp-server-stdio`.');
});
