import { ErrorCode, McpError } from '@modelcontextprotocol/sdk/types.js';
import { applyPatch } from 'diff';
import { getOutlineClient } from '../outline/outlineClient.js';
import toolRegistry from '../utils/toolRegistry.js';
import z from 'zod';

// Register this tool
toolRegistry.register('apply_patch_to_document', {
  name: 'apply_patch_to_document',
  description:
    'Apply a unified diff patch to a document. Use standard unified diff format (same as git diff). This is efficient for updating parts of large documents without sending the entire content. The patch will be validated against the current document content before applying.',
  inputSchema: {
    documentId: z.string().describe('ID of the document to patch'),
    patch: z
      .string()
      .describe(
        'Unified diff patch in standard format. MUST include context lines, hunk headers (@@), and change markers (+/-). Example format:\n' +
          '--- a/document.md\n' +
          '+++ b/document.md\n' +
          '@@ -10,4 +10,5 @@\n' +
          ' Context line before\n' +
          '-Line to remove\n' +
          '+Line to add\n' +
          '+Another line to add\n' +
          ' Context line after\n\n' +
          'Tips: Include 3+ lines of context around changes for reliable matching. Use exact text from the document (get it first with get_document).'
      ),
    title: z.string().describe('New title for the document').optional(),
    publish: z.boolean().describe('Whether to publish the document').optional(),
    done: z.boolean().describe('Whether the document is marked as done').optional(),
  },
  async callback(args) {
    try {
      // Fetch current document
      const client = getOutlineClient();
      const docResponse = await client.post('/documents.info', { id: args.documentId });
      const currentDoc = docResponse.data.data;

      // Apply the patch using the diff library
      const patchedText = applyPatch(currentDoc.text, args.patch);

      // Validate patch was successful
      if (patchedText === false) {
        throw new McpError(
          ErrorCode.InvalidRequest,
          'Failed to apply patch. Common causes:\n' +
            '1. Context lines do not match current document content\n' +
            '2. Line numbers in hunk headers are incorrect\n' +
            '3. Document was modified since you fetched it\n' +
            '4. Patch format is invalid\n\n' +
            'Solution: Use get_document to fetch the latest content, then create a new patch with matching context lines.'
        );
      }

      // Build update payload
      const updatePayload: Record<string, any> = {
        id: args.documentId,
        text: patchedText,
      };

      if (args.title !== undefined) {
        updatePayload.title = args.title;
      }

      if (args.publish !== undefined) {
        updatePayload.publish = args.publish;
      }

      if (args.done !== undefined) {
        updatePayload.done = args.done;
      }

      // Update document
      const updateResponse = await client.post('/documents.update', updatePayload);

      // Return success with statistics
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              document: updateResponse.data.data,
              stats: {
                originalLength: currentDoc.text.length,
                patchedLength: patchedText.length,
                difference: patchedText.length - currentDoc.text.length,
                originalLines: currentDoc.text.split('\n').length,
                patchedLines: patchedText.split('\n').length,
              },
            }),
          },
        ],
      };
    } catch (error: any) {
      console.error('Error applying patch to document:', error.message);
      throw new McpError(ErrorCode.InvalidRequest, error.message);
    }
  },
});
