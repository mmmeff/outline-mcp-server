[![MseeP.ai Security Assessment Badge](https://mseep.net/pr/mmmeff-outline-mcp-server-badge.png)](https://mseep.ai/app/mmmeff-outline-mcp-server)

# Outline MCP Server

![npm](https://img.shields.io/npm/v/outline-mcp-server) • ![downloads](https://img.shields.io/npm/dy/outline-mcp-server)

A Model Context Protocol (MCP) server that provides tools for interacting with [Outline](https://www.getoutline.com/)'s API, enabling AI agents to manage documents, collections, and other entities programmatically through the Outline knowledge base platform.

## Quick Installation

### Claude Desktop

🎉 **`outline-mcp-server` now has an extension for Claude Desktop!**

You can now download a Claude Desktop extension from the [releases page](https://github.com/mmmeff/outline-mcp/releases) for quick and easy setup (just double click it).

### Cursor

One click install in Cursor:

[![Install MCP Server](https://cursor.com/deeplink/mcp-install-dark.svg)](https://cursor.com/install-mcp?name=outline&config=eyJjb21tYW5kIjoibnB4IC15IC0tcGFja2FnZT1vdXRsaW5lLW1jcC1zZXJ2ZXJAbGF0ZXN0IC1jIG91dGxpbmUtbWNwLXNlcnZlci1zdGRpbyIsImVudiI6eyJPVVRMSU5FX0FQSV9LRVkiOiI8UkVQTEFDRV9NRT4iLCJPVVRMSU5FX0FQSV9VUkwiOiJodHRwczovL2FwcC5nZXRvdXRsaW5lLmNvbS9hcGkifX0%3D)

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
  - ✅ Create comments on documents
  - ✅ Update existing comments
  - ✅ Delete comments

- **User Management**
  - ✅ List and filter users

## Quick Start

### Prerequisites

- Node.js (v20 or higher)
- Outline account with API access
- Outline API key with appropriate permissions
- Note: if you need to use the AI-powered ask feature, you must enable the "AI Answers" feature in your Outline Workspace settings

### Running

`outline-mcp-server` supports the latest streamable-http protocol, the deprecated sse protocol, and good ole fashioned stdio.

```bash
# S-HTTP/SSE servers
OUTLINE_API_KEY=... npx -y outline-mcp-server@latest

# STDIO
OUTLINE_API_KEY=... npx -y --package=outline-mcp-server@latest -c outline-mcp-server-stdio
```

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
      "OUTLINE_MCP_PORT": "6060"
    }
  }
}
```

### Env vars

- `OUTLINE_API_KEY` (_required_): your API key for outline, duh
- `OUTLINE_API_URL` (_optional_): Alternative URL for your outline API (if using an alt domain/self-hosting)
- `OUTLINE_MCP_PORT` (_optional_): Specify the port on which the server will run (default: 6060)

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
