# Multi-Instance Support

The Outline MCP Server now supports connecting to multiple Outline instances from a single server deployment.

## Overview

Previously, the server could only connect to one Outline instance configured via the `OUTLINE_API_URL` environment variable. Now you can pass both the API key and API URL per request via HTTP headers, allowing you to interact with multiple Outline instances.

## How It Works

### Environment Variables (Default/Fallback)

Set these in your `.env` file for default behavior:

```bash
OUTLINE_API_KEY=your_default_api_key
OUTLINE_API_URL=https://app.getoutline.com/api  # Optional, defaults to this
```

### Per-Request Headers

Override for specific Outline instances by adding these headers to your HTTP requests:

- `x-outline-api-key` or `outline-api-key` - API key for the specific instance
- `x-outline-api-url` or `outline-api-url` - API URL for the specific instance

**Note:** The `/api` suffix is automatically added to the URL if not present. Both `https://outline.example.com` and `https://outline.example.com/api` are accepted.

## Usage Examples

### Example 1: Using Default Instance

No headers needed, uses environment variables:

```bash
curl -X POST http://localhost:6060/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc": "2.0", "method": "tools/list", "id": 1}'
```

### Example 2: Using Custom Instance via Headers

Override with specific instance:

```bash
curl -X POST http://localhost:6060/mcp \
  -H "Content-Type: application/json" \
  -H "x-outline-api-key: your_instance1_api_key" \
  -H "x-outline-api-url: https://outline1.example.com/api" \
  -d '{"jsonrpc": "2.0", "method": "tools/call", "params": {...}, "id": 1}'
```

### Example 3: Multiple Instances

Request to Instance 1:
```bash
curl -X POST http://localhost:6060/mcp \
  -H "x-outline-api-key: instance1_key" \
  -H "x-outline-api-url: https://outline1.example.com/api" \
  -d '{...}'
```

Request to Instance 2:
```bash
curl -X POST http://localhost:6060/mcp \
  -H "x-outline-api-key: instance2_key" \
  -H "x-outline-api-url: https://outline2.example.com/api" \
  -d '{...}'
```

## Priority Order

The server prioritizes configurations in this order:

1. **Request Headers** - Highest priority
   - `x-outline-api-key` / `outline-api-key`
   - `x-outline-api-url` / `outline-api-url`

2. **Environment Variables** - Fallback
   - `OUTLINE_API_KEY`
   - `OUTLINE_API_URL`

3. **Default** - If URL not specified anywhere
   - `https://app.getoutline.com/api`

## Error Handling

### Missing API Key

If neither headers nor environment variables provide an API key:

```
Error: API key required: Set OUTLINE_API_KEY environment variable or provide x-outline-api-key header
```

### Missing API URL

The API URL is optional. If not provided via headers or environment variables, it defaults to `https://app.getoutline.com/api`.

## Implementation Details


## Security Considerations

- API keys and URLs are scoped per request using `RequestContext`
- Context is cleaned up after each request via `RequestContext.resetInstance()`
- No cross-request data leakage
- Each request gets a fresh context instance

## Testing

The implementation has been validated with:
- ✅ TypeScript compilation (`tsc --noEmit`)
- ✅ Type safety checks
- ✅ Backward compatibility verification
