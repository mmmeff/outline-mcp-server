#!/usr/bin/env node
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { getMcpServer } from './utils/getMcpServer.js';

// Validate API key for stdio mode
if (!process.env.OUTLINE_API_KEY) {
  console.error('Error: OUTLINE_API_KEY environment variable is required for stdio mode');
  process.exit(1);
}

const mcpServer = await getMcpServer();

// STDIO mode - for direct client connections
const transport = new StdioServerTransport();
await mcpServer.connect(transport);
// must not write to stdout according to mcp spec
console.error('Outline MCP Server running in STDIO mode');
