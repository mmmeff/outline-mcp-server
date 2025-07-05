# Setup and Deployment Guide

This guide explains how to set up, test, and package the Outline Knowledge Base Desktop Extension (DXT) for distribution.

## 📁 Project Structure

```
outline-knowledge-base-extension/
├── manifest.json              # DXT manifest (required)
├── package.json              # Node.js dependencies
├── server/
│   └── index.js             # MCP server implementation
├── test/
│   └── server.test.js       # Test suite
├── .eslintrc.js             # Code quality rules
├── .gitignore               # Git ignore patterns
├── LICENSE                  # MIT license
├── README.md                # User documentation
├── CONTRIBUTING.md          # Developer guide
├── SETUP.md                 # This file
└── icon.png                 # Extension icon (512x512 PNG)
```

## 🛠 Development Setup

### Prerequisites

- **Node.js 18.0.0+**: Download from [nodejs.org](https://nodejs.org)
- **Claude Desktop**: Download from [claude.ai](https://claude.ai/download)
- **Git**: For version control
- **Text Editor**: VS Code, Cursor, or similar

### Initial Setup

1. **Clone or download** this extension code
2. **Navigate to the project directory**:
   ```bash
   cd outline-knowledge-base-extension
   ```

3. **Install dependencies**:
   ```bash
   npm install
   ```

4. **Create an icon** (replace `icon.png.md` with actual `icon.png`)
5. **Run tests** to verify setup:
   ```bash
   npm test
   ```

### Development Workflow

1. **Start development server**:
   ```bash
   npm run dev
   ```

2. **Make changes** to the server code
3. **Run linter** to check code quality:
   ```bash
   npm run lint
   ```

4. **Run tests** after changes:
   ```bash
   npm test
   ```

## 🧪 Testing the Extension

### Manual Testing

1. **Set up test environment variables**:
   ```bash
   export OUTLINE_API_URL="https://your-test-instance.getoutline.com"
   export OUTLINE_API_TOKEN="your-test-api-token"
   ```

2. **Test the MCP server directly**:
   ```bash
   npm start
   ```

3. **Use MCP Inspector** for detailed testing:
   ```bash
   npx @modelcontextprotocol/inspector
   ```

### Automated Testing

Run the complete test suite:
```bash
# All tests
npm test

# With coverage
npm run test:coverage

# Watch mode for development
npm run test:watch
```

## 📦 Packaging for Distribution

### Using DXT CLI (Recommended)

1. **Install DXT CLI**:
   ```bash
   npm install -g @anthropic-ai/dxt
   ```

2. **Initialize DXT configuration** (if needed):
   ```bash
   dxt init
   ```

3. **Package the extension**:
   ```bash
   dxt pack
   ```

This creates a `.dxt` file ready for distribution.

### Manual Packaging

If DXT CLI is not available, create a ZIP archive:

1. **Ensure all required files are present**:
   - `manifest.json`
   - `server/index.js` 
   - `package.json`
   - `icon.png`
   - `README.md`
   - `LICENSE`

2. **Install production dependencies**:
   ```bash
   npm ci --only=production
   ```

3. **Create ZIP archive** with `.dxt` extension:
   ```bash
   zip -r outline-knowledge-base-extension.dxt \
     manifest.json \
     package.json \
     server/ \
     node_modules/ \
     icon.png \
     README.md \
     LICENSE
   ```

## 🚀 Installation and Testing

### Installing the Extension

1. **Open Claude Desktop**
2. **Go to Settings → Extensions**
3. **Click "Install from file"**
4. **Select your `.dxt` file**
5. **Configure with your Outline credentials**

### Configuration

After installation, configure:

- **API URL**: Your Outline instance URL
- **API Token**: Generate from Outline Settings → API
- **Optional settings**: Search limits, archived documents, etc.

### Testing Installation

1. **Ask Claude**: "Search our knowledge base for documentation"
2. **Verify the extension responds** with search results
3. **Test other tools**: document retrieval, collections, etc.

## 🔧 Troubleshooting

### Common Issues

**"Module not found" errors**:
- Ensure `node_modules/` is included in the package
- Check that `package.json` dependencies are correct

**"Invalid manifest" errors**:
- Validate `manifest.json` against DXT specification
- Check that all required fields are present

**API connection failures**:
- Verify API URL is accessible
- Check API token permissions
- Test with curl or Postman first

**Extension won't load**:
- Check Claude Desktop version compatibility
- Ensure all files have correct permissions
- Review Claude Desktop logs

### Debug Mode

Enable debug logging by setting environment variables:
```bash
NODE_ENV=development
DEBUG=outline-kb:*
```

### Getting Help

1. **Check documentation** in README.md
2. **Review test output** for specific errors
3. **Use MCP Inspector** for protocol debugging
4. **Create GitHub issue** with:
   - Operating system
   - Claude Desktop version
   - Error logs (sanitized)
   - Steps to reproduce

## 📋 Pre-Release Checklist

Before distributing the extension:

- [ ] All tests pass
- [ ] Linting passes without errors
- [ ] Icon is included and properly sized
- [ ] README.md is complete and accurate
- [ ] Version numbers match in manifest.json and package.json
- [ ] License is included
- [ ] No sensitive information in code
- [ ] Tested on target platforms (Windows, macOS, Linux)
- [ ] API endpoints work with current Outline version
- [ ] Error handling is comprehensive
- [ ] User configuration validation works

## 🔄 Updates and Maintenance

### Versioning

Follow [Semantic Versioning](https://semver.org/):
- **Major**: Breaking changes
- **Minor**: New features
- **Patch**: Bug fixes

Update version in both:
- `manifest.json` → `version`
- `package.json` → `version`

### Release Process

1. **Update version numbers**
2. **Update CHANGELOG.md**
3. **Run full test suite**
4. **Package new `.dxt` file**
5. **Test installation**
6. **Create GitHub release**
7. **Submit to extension directory** (if applicable)

## 🔐 Security Considerations

### Code Security
- No hardcoded credentials
- Input validation on all parameters
- Proper error handling without information leakage
- Dependencies regularly updated

### Distribution Security
- Sign the `.dxt` file if possible
- Use HTTPS for all external communications
- Validate user inputs
- Store sensitive data in system keychain

### User Privacy
- Minimal data collection
- Clear privacy policy
- Secure API communication
- No unnecessary permissions

## 📚 Additional Resources

- **DXT Specification**: [GitHub - Anthropic DXT](https://github.com/anthropics/dxt)
- **MCP Documentation**: [Model Context Protocol](https://modelcontextprotocol.io/)
- **Outline API**: [Outline API Documentation](https://www.getoutline.com/developers)
- **Claude Desktop**: [Claude Desktop Extensions](https://claude.ai/extensions)

---

**Ready to build?** Start with `npm install` and follow the development workflow above!