#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import axios from 'axios';

/**
 * Outline Knowledge Base MCP Server
 * 
 * This server provides access to Outline knowledge bases through the Model Context Protocol.
 * It implements secure API communication with proper error handling and timeout management.
 */

class OutlineKBServer {
  constructor() {
    this.server = new Server(
      {
        name: 'outline-knowledge-base',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.axiosInstance = null;
    this.setupServer();
  }

  /**
   * Initialize the server with proper error handling and security measures
   */
  setupServer() {
    // Validate environment variables
    this.validateEnvironment();

    // Setup Axios instance with proper configuration
    this.setupAxiosInstance();

    // Setup MCP tool handlers
    this.setupToolHandlers();

    // Setup error handling
    this.setupErrorHandling();
  }

  /**
   * Validate required environment variables
   */
  validateEnvironment() {
    const requiredEnvVars = ['OUTLINE_API_URL', 'OUTLINE_API_TOKEN'];
    const missing = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missing.length > 0) {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }

    // Validate API URL format
    try {
      new URL(process.env.OUTLINE_API_URL);
    } catch (error) {
      throw new Error('Invalid OUTLINE_API_URL format. Must be a valid URL.');
    }

    // Validate API token
    if (process.env.OUTLINE_API_TOKEN.length < 10) {
      throw new Error('OUTLINE_API_TOKEN appears to be invalid (too short)');
    }
  }

  /**
   * Setup Axios instance with security and timeout configurations
   */
  setupAxiosInstance() {
    this.axiosInstance = axios.create({
      baseURL: process.env.OUTLINE_API_URL,
      timeout: 30000, // 30 second timeout
      headers: {
        'Authorization': `Bearer ${process.env.OUTLINE_API_TOKEN}`,
        'Content-Type': 'application/json',
        'User-Agent': 'Claude-DXT-Outline-Extension/1.0.0'
      },
      // Security: Reject unauthorized certificates in production
      rejectUnauthorized: process.env.NODE_ENV === 'production'
    });

    // Add request interceptor for logging (in development)
    if (process.env.NODE_ENV !== 'production') {
      this.axiosInstance.interceptors.request.use(request => {
        console.log(`[Request] ${request.method?.toUpperCase()} ${request.url}`);
        return request;
      });
    }

    // Add response interceptor for error handling
    this.axiosInstance.interceptors.response.use(
      response => response,
      error => {
        console.error('[Axios Error]', {
          message: error.message,
          status: error.response?.status,
          statusText: error.response?.statusText,
          url: error.config?.url
        });
        return Promise.reject(error);
      }
    );
  }

  /**
   * Setup MCP tool handlers
   */
  setupToolHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'search_documents',
            description: 'Search for documents across your Outline knowledge base',
            inputSchema: {
              type: 'object',
              properties: {
                query: {
                  type: 'string',
                  description: 'Search query string',
                  minLength: 1
                },
                limit: {
                  type: 'number',
                  description: 'Maximum number of results to return (1-50)',
                  minimum: 1,
                  maximum: 50,
                  default: 10
                },
                includeArchived: {
                  type: 'boolean',
                  description: 'Whether to include archived documents',
                  default: false
                }
              },
              required: ['query'],
              additionalProperties: false
            }
          },
          {
            name: 'get_document',
            description: 'Retrieve the full content of a specific document',
            inputSchema: {
              type: 'object',
              properties: {
                documentId: {
                  type: 'string',
                  description: 'The ID of the document to retrieve',
                  minLength: 1
                }
              },
              required: ['documentId'],
              additionalProperties: false
            }
          },
          {
            name: 'list_collections',
            description: 'List all collections in your Outline knowledge base',
            inputSchema: {
              type: 'object',
              properties: {
                limit: {
                  type: 'number',
                  description: 'Maximum number of collections to return',
                  minimum: 1,
                  maximum: 100,
                  default: 25
                }
              },
              additionalProperties: false
            }
          },
          {
            name: 'get_document_info',
            description: 'Get metadata about a specific document',
            inputSchema: {
              type: 'object',
              properties: {
                documentId: {
                  type: 'string',
                  description: 'The ID of the document',
                  minLength: 1
                }
              },
              required: ['documentId'],
              additionalProperties: false
            }
          }
        ]
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'search_documents':
            return await this.searchDocuments(args);
          case 'get_document':
            return await this.getDocument(args);
          case 'list_collections':
            return await this.listCollections(args);
          case 'get_document_info':
            return await this.getDocumentInfo(args);
          default:
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Unknown tool: ${name}`
            );
        }
      } catch (error) {
        console.error(`[Tool Error] ${name}:`, error.message);
        
        if (error instanceof McpError) {
          throw error;
        }
        
        // Convert various error types to MCP errors
        if (error.response?.status === 401) {
          throw new McpError(
            ErrorCode.InvalidRequest,
            'Authentication failed. Please check your API token.'
          );
        } else if (error.response?.status === 403) {
          throw new McpError(
            ErrorCode.InvalidRequest,
            'Access denied. Please check your permissions.'
          );
        } else if (error.response?.status === 404) {
          throw new McpError(
            ErrorCode.InvalidRequest,
            'Resource not found.'
          );
        } else if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
          throw new McpError(
            ErrorCode.InternalError,
            'Cannot connect to Outline API. Please check your API URL.'
          );
        } else if (error.code === 'ECONNABORTED') {
          throw new McpError(
            ErrorCode.InternalError,
            'Request timeout. The Outline API took too long to respond.'
          );
        } else {
          throw new McpError(
            ErrorCode.InternalError,
            `Outline API error: ${error.message}`
          );
        }
      }
    });
  }

  /**
   * Setup global error handling
   */
  setupErrorHandling() {
    process.on('uncaughtException', (error) => {
      console.error('[Uncaught Exception]', error);
      process.exit(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
      console.error('[Unhandled Rejection]', reason);
      process.exit(1);
    });
  }

  /**
   * Search for documents in the Outline knowledge base
   */
  async searchDocuments({ query, limit = 10, includeArchived = false }) {
    const response = await this.axiosInstance.post('/api/documents.search', {
      query,
      limit: Math.min(limit, 50),
      includeArchived
    });

    const documents = response.data.data || [];
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            query,
            resultCount: documents.length,
            documents: documents.map(doc => ({
              id: doc.id,
              title: doc.title,
              url: doc.url,
              excerpt: doc.text?.substring(0, 200) + (doc.text?.length > 200 ? '...' : ''),
              collectionId: doc.collectionId,
              updatedAt: doc.updatedAt,
              createdAt: doc.createdAt
            }))
          }, null, 2)
        }
      ]
    };
  }

  /**
   * Get the full content of a specific document
   */
  async getDocument({ documentId }) {
    const response = await this.axiosInstance.post('/api/documents.info', {
      id: documentId
    });

    const document = response.data.data;
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            id: document.id,
            title: document.title,
            text: document.text,
            url: document.url,
            collectionId: document.collectionId,
            createdAt: document.createdAt,
            updatedAt: document.updatedAt,
            createdBy: document.createdBy,
            updatedBy: document.updatedBy
          }, null, 2)
        }
      ]
    };
  }

  /**
   * List all collections in the knowledge base
   */
  async listCollections({ limit = 25 } = {}) {
    const response = await this.axiosInstance.post('/api/collections.list', {
      limit: Math.min(limit, 100)
    });

    const collections = response.data.data || [];
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            collections: collections.map(collection => ({
              id: collection.id,
              name: collection.name,
              description: collection.description,
              documentCount: collection.documentCount,
              url: collection.url,
              createdAt: collection.createdAt,
              updatedAt: collection.updatedAt
            }))
          }, null, 2)
        }
      ]
    };
  }

  /**
   * Get metadata about a specific document
   */
  async getDocumentInfo({ documentId }) {
    const response = await this.axiosInstance.post('/api/documents.info', {
      id: documentId
    });

    const document = response.data.data;
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            id: document.id,
            title: document.title,
            url: document.url,
            collectionId: document.collectionId,
            parentDocumentId: document.parentDocumentId,
            createdAt: document.createdAt,
            updatedAt: document.updatedAt,
            publishedAt: document.publishedAt,
            archivedAt: document.archivedAt,
            createdBy: document.createdBy,
            updatedBy: document.updatedBy,
            wordCount: document.text?.split(/\s+/).length || 0,
            characterCount: document.text?.length || 0
          }, null, 2)
        }
      ]
    };
  }

  /**
   * Start the MCP server
   */
  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Outline Knowledge Base MCP Server running on stdio');
  }
}

// Initialize and run the server
const server = new OutlineKBServer();
server.run().catch(console.error);