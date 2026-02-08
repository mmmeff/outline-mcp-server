# Outline MCP Server

![npm](https://img.shields.io/npm/v/outline-mcp-server) • ![downloads](https://img.shields.io/npm/dy/outline-mcp-server)

A Model Context Protocol (MCP) server that provides tools for interacting with [Outline](https://www.getoutline.com/)'s API, enabling AI agents to manage documents, collections, and other entities programmatically through the Outline knowledge base platform.

## Quick Installation

### Cursor

One click install in Cursor:

[![Install MCP Server](https://cursor.com/deeplink/mcp-install-dark.svg)](https://cursor.com/install-mcp?name=outline&config=eyJjb21tYW5kIjoibnB4IC15IC0tcGFja2FnZT1vdXRsaW5lLW1jcC1zZXJ2ZXJAbGF0ZXN0IC1jIG91dGxpbmUtbWNwLXNlcnZlci1zdGRpbyIsImVudiI6eyJPVVRMSU5FX0FQSV9LRVkiOiI8UkVQTEFDRV9NRT4iLCJPVVRMSU5FX0FQSV9VUkwiOiJodHRwczovL2FwcC5nZXRvdXRsaW5lLmNvbS9hcGkifX0%3D)

### Claude Desktop

You can now download a Claude Desktop extension from the [releases page](https://github.com/mmmeff/outline-mcp/releases) for quick and easy setup (just double click it).

### Claude Code

Add the Outline MCP server to Claude Code with:

```bash
claude mcp add outline -s user -t stdio -e OUTLINE_API_KEY=... -- npx -y --package=outline-mcp-server@latest -c outline-mcp-server-stdio
```

Or with [1Password CLI](#1password-cli):

```bash
claude mcp add outline -s user -t stdio -- op run --env-file=/path/to/.env.op -- npx -y --package=outline-mcp-server@latest -c outline-mcp-server-stdio
```

### Other Methods

This MCP server can be added to just about any agent with an appropriate command defining `npx` and env vars. Read below for more info on how to run the server manually.
[Jump to Running &rarr;](#running)

## Features

- **Document Management**
  - ✅ Create new documents with customizable properties
  - ✅ Get document details
  - ✅ Update existing documents
  - ✅ Delete documents
  - ✅ List documents
  - ✅ Search documents
  - ✅ Ask natural language questions about documents
  - ✅ Create templates from existing documents
  - ✅ Move documents to different collections or locations
  - ✅ Archive documents

- **Collection Management**
  - ✅ Get collection details
  - ✅ List collections
  - ✅ Create and update collections

- **Comment Management**
  - ✅ List comments for documents and collections
  - ✅ Create comments on documents
  - ✅ Update existing comments
  - ✅ Delete comments

- **User Management**
  - ✅ List and filter users

## Quick Start

### Prerequisites

- Node.js (v24 or higher)
- Outline account with API access
- Outline API key with appropriate permissions
- Note: if you need to use the AI-powered ask feature, you must enable the "AI Answers" feature in your Outline Workspace settings

### Running

`outline-mcp-server` supports the latest streamable-http protocol, the deprecated sse protocol, and good ole fashioned stdio.

```bash
# S-HTTP/SSE servers (with optional env var)
OUTLINE_API_KEY=... npx -y outline-mcp-server@latest

# S-HTTP/SSE servers (without env var, use headers for auth)
npx -y outline-mcp-server@latest

# STDIO (requires env var)
OUTLINE_API_KEY=... npx -y --package=outline-mcp-server@latest -c outline-mcp-server-stdio
```

When running HTTP/SSE servers without an environment variable, you'll need to provide the API key in your request headers. The server will display available authentication methods on startup.

### Cursor (mcp.json)

Add the following MCP definition to your configuration:

```json
{
  "outline": {
    "command": "npx",
    "args": ["-y", "outline-mcp-server-stdio@latest"],
    "env": {
      "OUTLINE_API_KEY": "<REPLACE_ME>",
      "OUTLINE_API_URL": "https://app.getoutline.com/api",
      "OUTLINE_MCP_PORT": "6060",
      "OUTLINE_MCP_HOST": "127.0.0.1"
    }
  }
}
```

Or with [1Password CLI](#1password-cli):

```json
{
  "outline": {
    "command": "op",
    "args": [
      "run", "--env-file=/path/to/.env.op", "--",
      "npx", "-y", "outline-mcp-server-stdio@latest"
    ]
  }
}
```

### Authentication

The Outline MCP server supports three authentication methods:

1. **Environment Variable (Required for stdio mode)**: Set `OUTLINE_API_KEY` as an environment variable
2. **Request Headers (HTTP/SSE modes)**: Provide the API key in request headers
3. **[1Password CLI](#1password-cli)**: Use `op run` to inject secrets from your vault (works with all modes)

For **stdio mode**, the API key environment variable is required and validated on startup.

For **HTTP/SSE modes**, you have two options:

- Set `OUTLINE_API_KEY` as an environment variable (fallback method)
- Provide API key in request headers (recommended for per-request authentication)

#### Header-based Authentication

When using HTTP/SSE endpoints, you can provide the API key using any of these headers:

- `x-outline-api-key: your_api_key_here`
- `outline-api-key: your_api_key_here`
- `authorization: Bearer your_api_key_here`

If no header is provided, the server will fall back to the `OUTLINE_API_KEY` environment variable. If neither is available, the request will fail with an authentication error.

### Env vars

- `OUTLINE_API_KEY` (_required for stdio, optional for HTTP/SSE_): your API key for outline
- `OUTLINE_API_URL` (_optional_): Alternative URL for your outline API (if using an alt domain/self-hosting)
- `OUTLINE_MCP_PORT` (_optional_): Specify the port on which the server will run (default: 6060)
- `OUTLINE_MCP_HOST` (_optional_): Host/IP to bind the server to (default: 127.0.0.1). Use 0.0.0.0 to bind to all network interfaces

### 1Password CLI

You can use the [1Password CLI](https://developer.1password.com/docs/cli/) to inject secrets instead of storing them in `.env` files or passing them as environment variables. The `op run` command resolves `op://` secret references before the Node process starts — no code changes or extra dependencies required.

**Prerequisites:** [1Password CLI](https://developer.1password.com/docs/cli/get-started/) installed and signed in.

**Setup:**

1. Create a 1Password item (e.g. in a vault called "Dev", item called "outline") with a field named `api-key` containing your Outline API key. Optionally add an `api-url` field if self-hosting.

2. Edit `.env.op` to match your vault/item path:

   ```
   OUTLINE_API_KEY=op://Dev/outline/api-key
   # OUTLINE_API_URL=op://Dev/outline/api-url
   ```

3. Run with `op run`:

   ```bash
   # STDIO
   op run --env-file=.env.op -- npx -y --package=outline-mcp-server@latest -c outline-mcp-server-stdio

   # HTTP/SSE
   op run --env-file=.env.op -- npx -y outline-mcp-server@latest
   ```

The `.env.op` file contains only `op://` reference URIs, not actual secrets, so it is safe to commit to version control.

### Usage

Once installed, you can use the MCP server with AI assistants that support the Model Context Protocol, such as Claude via Cursor.

Example queries your AI assistant can now handle:

- "List all the documents in my Outline workspace"
- "Create a new document in the 'Product' collection"
- "Find all documents related to a specific topic"
- "Ask a natural language question about your documents"
- "Create a template from an existing document"
- "Update the content of a document"
- "Add a comment to a document"

## Docker Usage

You can run the Outline MCP Server using Docker or Docker Compose for easy deployment.

### 1. Prepare your `.env` file

Copy `.env.example` to `.env` and fill in your Outline API key:

```bash
cp .env.example .env
# Edit .env and set OUTLINE_API_KEY=your_outline_api_key_here
```

### 2. Build and run with Docker Compose (recommended)

```bash
docker-compose up --build
```

- The server will be available on port 6060 by default.
- Environment variables are loaded from your `.env` file.

### 3. Build and run manually with Docker

```bash
docker build -t outline-mcp-server .
docker run --env-file .env -p 6060:6060 outline-mcp-server
```

- You can override environment variables at runtime with `-e` flags if needed.

### 4. Customizing

- To change the API URL, set `OUTLINE_API_URL` in your `.env` file or as an environment variable.
- To change the port or host, set `OUTLINE_MCP_PORT` and `OUTLINE_MCP_HOST` in your `.env` file or as environment variables.
- For more advanced setups, edit `docker-compose.yml` as needed.

---

## Development

```bash
# Clone this repository
git clone https://github.com/mmmeff/outline-mcp.git
cd outline-mcp

# Install dependencies
npm install
```

### Create a `.env` file with your Outline API key:

```
OUTLINE_API_KEY=your_outline_api_key_here

# Optional -------
# OUTLINE_API_URL=https://your-outline-instance.com/api # defaults to https://app.getoutline.com/api
# OUTLINE_MCP_PORT=9001
```

```bash
# Builds/watches the project alongside running @modelcontextprotocol/inspector
npm run dev
```

## Contributing

This project uses [semantic-release](https://semantic-release.gitbook.io/semantic-release/) for automated versioning and package publishing. Please follow the [Conventional Commits](https://www.conventionalcommits.org/) specification for your commit messages to ensure proper versioning.

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines on how to contribute to this project.

## Release Process

Releases are fully automated using semantic-release and GitHub Actions. When commits are pushed to the `master` branch, the following happens:

1. The CI pipeline runs tests and builds the package
2. semantic-release analyzes commit messages to determine the next version number
3. A new version is automatically published to npm
4. A GitHub release is created with auto-generated release notes
5. The CHANGELOG.md file is updated

No manual version bumping or release creation is needed.

## License

MIT
