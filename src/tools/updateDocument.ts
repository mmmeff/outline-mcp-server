import { ErrorCode, McpError } from '@modelcontextprotocol/sdk/types.js';
import { getOutlineClient } from '../outline/outlineClient.js';
import toolRegistry from '../utils/toolRegistry.js';
import z from 'zod';

// Register this tool
toolRegistry.register('update_document', {
  name: 'update_document',
  description: 'Update an existing document',
  inputSchema: {
    documentId: z.string().describe('ID of the document to update'),
    title: z.string().describe('New title for the document').optional(),
    text: z.string().describe('New content for the document in markdown format').optional(),
    publish: z.boolean().describe('Whether to publish the document').optional(),
    done: z.boolean().describe('Whether the document is marked as done').optional(),
    icon: z
      .string()
      .describe(
        'Emoji character to use as the document icon (e.g. "📋", "🚀"). Pass empty string to remove the icon.',
      )
      .optional(),
  },
  async callback(args) {
    try {
      const payload: Record<string, any> = {
        id: args.documentId,
      };

      if (args.title !== undefined) {
        payload.title = args.title;
      }

      if (args.text !== undefined) {
        payload.text = args.text;
      }

      if (args.publish !== undefined) {
        payload.publish = args.publish;
      }

      if (args.done !== undefined) {
        payload.done = args.done;
      }

      if (args.icon !== undefined) {
        payload.icon = args.icon;
      }

      const client = getOutlineClient();
      const response = await client.post('/documents.update', payload);
      return { content: [{ type: 'text', text: JSON.stringify(response.data.data) }] };
    } catch (error: any) {
      console.error('Error updating document:', error.message);
      throw new McpError(ErrorCode.InvalidRequest, error.message);
    }
  },
});
