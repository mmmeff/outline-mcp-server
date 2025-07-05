# Contributing to Outline Knowledge Base Extension

Thank you for your interest in contributing to the Outline Knowledge Base Desktop Extension! This document provides guidelines and information for contributors.

## 🤝 How to Contribute

### Reporting Issues

If you encounter a bug or have a feature request:

1. **Search existing issues** to avoid duplicates
2. **Use the appropriate issue template** when creating a new issue
3. **Provide detailed information** including:
   - Operating system and version
   - Claude Desktop version
   - Extension version
   - Steps to reproduce (for bugs)
   - Expected vs actual behavior

### Suggesting Features

We welcome feature suggestions! Please:

1. Check if the feature has already been requested
2. Open a new issue with the "enhancement" label
3. Describe the use case and expected behavior
4. Consider the scope and complexity of the feature

### Code Contributions

#### Prerequisites

- Node.js 18.0.0 or higher
- npm or yarn
- Git

#### Development Setup

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/your-username/outline-kb.git
   cd outline-kb
   ```

3. **Install dependencies**:
   ```bash
   npm install
   ```

4. **Set up environment variables** for testing:
   ```bash
   cp .env.example .env
   # Edit .env with your test Outline instance details
   ```

5. **Run tests** to ensure everything works:
   ```bash
   npm test
   ```

#### Making Changes

1. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** following our coding standards

3. **Write tests** for new functionality

4. **Update documentation** if needed

5. **Run the linter**:
   ```bash
   npm run lint
   ```

6. **Run tests**:
   ```bash
   npm test
   ```

#### Submitting Changes

1. **Commit your changes** with a clear message:
   ```bash
   git commit -m "feat: add search result caching"
   ```

2. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

3. **Create a Pull Request** with:
   - Clear title and description
   - Reference to any related issues
   - Screenshots if applicable

## 📝 Coding Standards

### Code Style

- Use **2 spaces** for indentation
- Follow **ESLint** configuration
- Use **single quotes** for strings
- Add **semicolons** at the end of statements
- Use **camelCase** for variables and functions
- Use **PascalCase** for classes

### Commit Message Format

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only changes
- `style`: Code style changes (formatting, missing semicolons, etc.)
- `refactor`: Code change that neither fixes a bug nor adds a feature
- `test`: Adding missing tests or correcting existing tests
- `chore`: Changes to the build process or auxiliary tools

**Examples:**
```
feat: add document caching functionality
fix: handle network timeouts gracefully
docs: update API documentation
test: add unit tests for search functionality
```

### Documentation

- Add **JSDoc comments** for all functions and classes
- Update **README.md** for user-facing changes
- Update **API documentation** for new tools or parameters
- Include **examples** for new features

### Testing

- Write **unit tests** for new functions
- Add **integration tests** for new tools
- Ensure **test coverage** doesn't decrease
- Test on **multiple platforms** if possible

## 🧪 Testing Guidelines

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Test Structure

- Place tests in the `test/` directory
- Use descriptive test names
- Group related tests using `describe` blocks
- Use `beforeEach` and `afterEach` for setup/cleanup

### Example Test

```javascript
import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';

describe('OutlineKBServer', () => {
  beforeEach(() => {
    // Setup test environment
  });

  it('should search documents successfully', async () => {
    // Test implementation
    assert.ok(result);
  });
});
```

## 🔧 Development Tools

### Available Scripts

- `npm start` - Start the server
- `npm run dev` - Start in development mode
- `npm test` - Run tests
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues automatically

### Debugging

1. **Enable debug mode**:
   ```bash
   NODE_ENV=development npm run dev
   ```

2. **Use console logging** sparingly in production code

3. **Add proper error handling** with meaningful messages

## 🏗️ Project Structure

```
outline-kb/
├── server/           # MCP server implementation
│   └── index.js     # Main server file
├── test/            # Test files
├── manifest.json    # DXT manifest
├── package.json     # Node.js package configuration
├── README.md        # User documentation
├── CONTRIBUTING.md  # This file
└── LICENSE          # MIT license
```

## 🚀 Release Process

1. **Update version** in `package.json` and `manifest.json`
2. **Update CHANGELOG.md** with new features and fixes
3. **Create a pull request** for the release
4. **Tag the release** after merging:
   ```bash
   git tag v1.1.0
   git push origin v1.1.0
   ```

## 📋 Pull Request Checklist

Before submitting a pull request, ensure:

- [ ] Code follows the style guidelines
- [ ] Tests pass locally
- [ ] New functionality includes tests
- [ ] Documentation is updated
- [ ] Commit messages follow the conventional format
- [ ] No sensitive information is included
- [ ] Changes are backwards compatible (or properly versioned)

## 🎯 Areas for Contribution

We welcome contributions in these areas:

### High Priority
- **Error handling improvements**
- **Performance optimizations**
- **Additional Outline API endpoints**
- **Better user configuration validation**

### Medium Priority
- **Caching mechanisms**
- **Rate limiting**
- **Bulk operations**
- **Advanced search filters**

### Documentation
- **API documentation**
- **Troubleshooting guides**
- **Video tutorials**
- **Best practices guides**

## 💬 Getting Help

If you need help with development:

1. **Check the documentation** first
2. **Search existing issues** for similar questions
3. **Ask in GitHub Discussions** for general questions
4. **Create an issue** for specific problems

## 🙏 Recognition

Contributors will be recognized in:

- **CHANGELOG.md** for each release
- **README.md** contributors section
- **GitHub contributors** page

## 📄 License

By contributing to this project, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to the Outline Knowledge Base Extension! 🎉
