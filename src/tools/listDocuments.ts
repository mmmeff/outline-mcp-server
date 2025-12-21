import { ErrorCode, McpError } from '@modelcontextprotocol/sdk/types.js';
import { getOutlineClient } from '../outline/outlineClient.js';
import toolRegistry from '../utils/toolRegistry.js';
import z from 'zod';

// Register this tool
toolRegistry.register('list_documents', {
  name: 'list_documents',
  description: 'List documents in the Outline workspace with optional filters',
  inputSchema: {
    query: z.string().optional().describe('Search query to filter documents (optional)'),
    collectionId: z.string().optional().describe('Filter by collection ID (optional)'),
    limit: z.number().optional().describe('Maximum number of documents to return (optional)'),
    offset: z.number().optional().describe('Pagination offset (optional)'),
    sort: z.string().optional().describe('Field to sort by (e.g. "updatedAt") (optional)'),
    direction: z
      .enum(['ASC', 'DESC'])
      .optional()
      .describe('Sort direction, either "ASC" or "DESC" (optional)'),
    template: z.boolean().describe('Optionally filter to only templates (optional)').optional(),
    userId: z.string().describe('Optionally filter by user ID (optional)').optional(),
    parentDocumentId: z
      .string()
      .describe('Optionally filter by parent document ID (optional)')
      .optional(),
    backlinkDocumentId: z
      .string()
      .describe('Optionally filter by backlink document ID (optional)')
      .optional(),
  },
  async callback(args) {
    try {
      // Build payload with only explicitly provided parameters
      const payload: Record<string, any> = {};

      // Only add pagination parameters if explicitly provided
      if (args.offset !== undefined) {
        payload.offset = args.offset;
      }

      if (args.limit !== undefined) {
        payload.limit = args.limit;
      }

      if (args.sort) {
        payload.sort = args.sort;
      }

      if (args.direction) {
        payload.direction = args.direction;
      }

      // Only add query if it's provided
      if (args.query) {
        payload.query = args.query;
      }

      // Only add optional filter parameters if they have actual values
      if (args.collectionId) {
        payload.collectionId = args.collectionId;
      }

      if (args.userId) {
        payload.userId = args.userId;
      }

      if (args.backlinkDocumentId) {
        payload.backlinkDocumentId = args.backlinkDocumentId;
      }

      if (args.parentDocumentId) {
        payload.parentDocumentId = args.parentDocumentId;
      }

      // Only add template if it's explicitly defined
      if (args.template !== undefined) {
        payload.template = args.template;
      }

      // Make the POST request to the documents.list endpoint
      const client = getOutlineClient();
      const response = await client.post('/documents.list', payload);

      // Transform the response to a more usable format
      const documents = response.data.data;

      // Return the documents with additional metadata
      return {
        content: [
          {
            type: 'text',
            text: `documents: ${JSON.stringify(documents)}`,
          },
          {
            type: 'text',
            text: `pagination: ${JSON.stringify(response.data.pagination)}`,
          },
        ],
      };
    } catch (error: any) {
      console.error('Error listing documents:', error.message);
      throw new McpError(ErrorCode.InvalidRequest, error.message);
    }
  },
});
