import type {
  CallToolResult,
  ServerRequest,
  ServerNotification,
} from '@modelcontextprotocol/sdk/types.js';
import type { RequestHandlerExtra } from '@modelcontextprotocol/sdk/shared/protocol.js';
import type z from 'zod';

type ZodShape = Record<string, z.ZodTypeAny>;

type ToolCallbackFn<Args extends ZodShape | undefined = undefined> = Args extends ZodShape
  ? (
      args: z.infer<z.ZodObject<Args>>,
      extra: RequestHandlerExtra<ServerRequest, ServerNotification>
    ) => CallToolResult | Promise<CallToolResult>
  : (
      extra: RequestHandlerExtra<ServerRequest, ServerNotification>
    ) => CallToolResult | Promise<CallToolResult>;

export type ToolDefinition<
  Args extends ZodShape | undefined = undefined,
  Output extends ZodShape | undefined = undefined,
> = {
  name: string;
  description: string;
  inputSchema?: Args;
  outputSchema?: Output;
  callback: ToolCallbackFn<Args>;
};

// Context to store request-specific data
export class RequestContext {
  private static instance: RequestContext | null = null;
  private context: Map<string, any> = new Map();

  static getInstance(): RequestContext {
    if (!RequestContext.instance) {
      RequestContext.instance = new RequestContext();
    }
    return RequestContext.instance;
  }

  static resetInstance(): void {
    RequestContext.instance = null;
  }

  set(key: string, value: any): void {
    this.context.set(key, value);
  }

  get(key: string): any {
    return this.context.get(key);
  }

  clear(): void {
    this.context.clear();
  }

  getApiKey(): string | undefined {
    return this.get('apiKey');
  }

  setApiKey(apiKey: string): void {
    this.set('apiKey', apiKey);
  }
}

class ToolRegistry {
  private registry: Map<string, ToolDefinition<any, any>> = new Map();

  constructor() {
    this.registry = new Map();
  }

  get tools(): ToolDefinition<any, any>[] {
    return Array.from(this.registry.values());
  }

  has(name: string): boolean {
    return this.registry.has(name);
  }

  get<
    Args extends ZodShape | undefined = undefined,
    Output extends ZodShape | undefined = undefined,
  >(name: string): ToolDefinition<Args, Output> | undefined {
    return this.registry.get(name);
  }

  /**
   * Registers a tool with the global registry
   */
  public register<
    Args extends ZodShape | undefined = undefined,
    Output extends ZodShape | undefined = undefined,
  >(name: string, definition: ToolDefinition<Args, Output>): void {
    if (this.has(name)) {
      throw new Error(`Attempted to register duplicate tool: "${name}"`);
    }
    this.registry.set(name, definition);
  }
}

// We'll collect all tool definitions here, keyed by name
const toolRegistry = new ToolRegistry();
export default toolRegistry;
