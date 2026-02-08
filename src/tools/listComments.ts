import { ErrorCode, McpError } from '@modelcontextprotocol/sdk/types.js';
import { getOutlineClient } from '../outline/outlineClient.js';
import toolRegistry from '../utils/toolRegistry.js';
import z from 'zod';

toolRegistry.register('list_comments', {
  name: 'list_comments',
  description: 'List comments for a document or collection in the Outline workspace',
  inputSchema: {
    documentId: z.string().describe('Filter by document ID').optional(),
    collectionId: z.string().describe('Filter by collection ID').optional(),
    includeAnchorText: z
      .boolean()
      .describe(
        'Include the highlighted document text that the comment is anchored to (default true)',
      )
      .optional(),
    limit: z.number().describe('Maximum number of comments to return (default 25)').optional(),
    offset: z.number().describe('Pagination offset (default 0)').optional(),
    sort: z
      .string()
      .describe('Field to sort by, e.g. "createdAt" (default "createdAt")')
      .optional(),
    direction: z
      .enum(['ASC', 'DESC'])
      .describe('Sort direction, either "ASC" or "DESC" (default "DESC")')
      .optional(),
  },
  async callback(args) {
    try {
      const payload: Record<string, any> = {
        offset: args.offset ?? 0,
        limit: args.limit || 25,
        sort: args.sort || 'createdAt',
        direction: args.direction || 'DESC',
      };

      if (args.documentId) {
        payload.documentId = args.documentId;
      }

      if (args.collectionId) {
        payload.collectionId = args.collectionId;
      }

      payload.includeAnchorText = args.includeAnchorText ?? true;

      const client = getOutlineClient();
      const response = await client.post('/comments.list', payload);

      const comments = response.data.data;

      return {
        content: [
          {
            type: 'text',
            text: `comments: ${JSON.stringify(comments)}`,
          },
          {
            type: 'text',
            text: `pagination: ${JSON.stringify(response.data.pagination)}`,
          },
        ],
      };
    } catch (error: any) {
      console.error('Error listing comments:', error.message);
      throw new McpError(ErrorCode.InvalidRequest, error.message);
    }
  },
});
