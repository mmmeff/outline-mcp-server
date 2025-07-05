# Outline Knowledge Base Desktop Extension

A powerful Desktop Extension (DXT) for Claude Desktop that provides seamless access to your Outline knowledge bases. Search documents, retrieve content, and access team knowledge directly from Claude Desktop.

## 🚀 Features

- **Document Search**: Search across your entire Outline knowledge base with natural language queries
- **Full Document Access**: Retrieve complete document content including metadata
- **Collection Management**: Browse and explore collections in your knowledge base
- **Real-time Integration**: Access the latest information directly from your Outline instance
- **Secure Authentication**: Uses API tokens for secure access to your data
- **Cross-platform Support**: Works on Windows, macOS, and Linux

## 📋 Prerequisites

- [Claude Desktop](https://claude.ai/download) installed on your system
- An Outline account with API access
- Node.js 18.0.0 or higher (bundled with the extension)

## 🛠 Installation

### Option 1: Install from Claude Desktop Extensions Directory

1. Open Claude Desktop
2. Go to Settings → Extensions
3. Search for "Outline Knowledge Base"
4. Click "Install"

### Option 2: Manual Installation

1. Download the latest `.dxt` file from the [releases page](https://github.com/claude-extensions/outline-kb/releases)
2. Open Claude Desktop
3. Go to Settings → Extensions
4. Click "Install from file" and select the downloaded `.dxt` file

## ⚙️ Configuration

After installation, you'll need to configure the extension:

1. **API URL**: The base URL of your Outline instance
   - Example: `https://your-team.getoutline.com`
   - For self-hosted instances: `https://outline.yourcompany.com`

2. **API Token**: Your personal API token from Outline
   - Go to your Outline Settings → API
   - Create a new token or use an existing one
   - Copy the token (it will only be shown once)

3. **Optional Settings**:
   - **Maximum Search Results**: Limit search results (default: 10)
   - **Include Archived Documents**: Whether to include archived documents in searches

## 🎯 Usage

Once configured, you can use the following capabilities with Claude:

### Searching Documents

Ask Claude to search your knowledge base:

```
Search our knowledge base for information about API authentication
```

Claude will use the `search_documents` tool to find relevant documents and provide summaries.

### Getting Specific Documents

Request specific document content:

```
Can you get the full content of the document with ID "abc123"?
```

Claude will retrieve the complete document using the `get_document` tool.

### Exploring Collections

Browse your knowledge base structure:

```
What collections do we have in our knowledge base?
```

Claude will list all collections using the `list_collections` tool.

### Document Information

Get metadata about documents:

```
What can you tell me about document "def456"?
```

Claude will provide detailed metadata using the `get_document_info` tool.

## 🔧 Available Tools

The extension provides the following tools to Claude:

### `search_documents`
Search for documents across your Outline knowledge base.

**Parameters:**
- `query` (required): Search query string
- `limit` (optional): Maximum results to return (1-50, default: 10)
- `includeArchived` (optional): Include archived documents (default: false)

### `get_document`
Retrieve the full content of a specific document.

**Parameters:**
- `documentId` (required): The ID of the document to retrieve

### `list_collections`
List all collections in your knowledge base.

**Parameters:**
- `limit` (optional): Maximum collections to return (1-100, default: 25)

### `get_document_info`
Get metadata about a specific document.

**Parameters:**
- `documentId` (required): The ID of the document

## 💡 Example Prompts

Here are some example prompts you can use with Claude once the extension is configured:

```
Help me find documentation about our deployment process
```

```
Search for any documents mentioning "database migration" and summarize the key points
```

```
What's the latest information in our API documentation collection?
```

```
Can you find and summarize our onboarding guides?
```

## 🔒 Security & Privacy

- **API Token Security**: Your API token is stored securely in your system's keychain
- **Local Processing**: All communication happens directly between Claude Desktop and your Outline instance
- **No Data Storage**: The extension doesn't store or cache your documents locally
- **Secure Transport**: All API communications use HTTPS encryption

## 🐛 Troubleshooting

### Common Issues

**Extension won't connect to Outline**
- Verify your API URL is correct and accessible
- Check that your API token is valid and has the necessary permissions
- Ensure your Outline instance is running and accessible

**Search returns no results**
- Check if you have permission to access the documents
- Try different search terms
- Verify that documents exist in your knowledge base

**"Authentication failed" error**
- Regenerate your API token in Outline settings
- Update the extension configuration with the new token

### Debug Mode

To enable debug logging:

1. Open Claude Desktop
2. Go to Settings → Extensions → Outline Knowledge Base
3. Enable "Debug Mode" (if available)
4. Check the console logs for detailed error messages

### Getting Help

If you encounter issues:

1. Check the [troubleshooting guide](https://github.com/claude-extensions/outline-kb/wiki/Troubleshooting)
2. Search [existing issues](https://github.com/claude-extensions/outline-kb/issues)
3. Create a [new issue](https://github.com/claude-extensions/outline-kb/issues/new) with:
   - Your operating system
   - Claude Desktop version
   - Error messages (without sensitive information)
   - Steps to reproduce the issue

## 🔄 Updates

The extension automatically updates when new versions are available. You can also:

1. Check for updates in Claude Desktop Settings → Extensions
2. Enable automatic updates for seamless experience

## 📝 Development

### Building from Source

1. Clone the repository:
   ```bash
   git clone https://github.com/claude-extensions/outline-kb.git
   cd outline-kb
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the extension:
   ```bash
   npm run build
   ```

4. Package as DXT:
   ```bash
   npx @anthropic-ai/dxt pack
   ```

### Testing

Run the test suite:
```bash
npm test
```

For development with hot reload:
```bash
npm run dev
```

### Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Anthropic](https://anthropic.com) for the Model Context Protocol and Desktop Extensions framework
- [Outline](https://getoutline.com) for their excellent knowledge base platform
- The open-source community for inspiration and feedback

## 📞 Support

- **Documentation**: [GitHub Wiki](https://github.com/claude-extensions/outline-kb/wiki)
- **Issues**: [GitHub Issues](https://github.com/claude-extensions/outline-kb/issues)
- **Discussions**: [GitHub Discussions](https://github.com/claude-extensions/outline-kb/discussions)

---

**Made with ❤️ for the Claude Desktop community**
