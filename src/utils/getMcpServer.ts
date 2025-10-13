import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { loadAllTools } from './loadAllTools.js';
import type { ToolDefinition } from './toolRegistry.js';

// Helper to create a new MCP server instance with all tools registered
export async function getMcpServer() {
  const server = new McpServer({
    name: process.env.npm_package_name || 'outline-mcp-server',
    version: process.env.npm_package_version || 'unknown',
    description: 'Outline Model Context Protocol server',
  });

  await loadAllTools((tool: ToolDefinition<any, any>) => {
    server.registerTool(
      tool.name,
      {
        description: tool.description,
        inputSchema: tool.inputSchema,
        outputSchema: tool.outputSchema,
      },
      tool.callback
    );
  });

  return server;
}
