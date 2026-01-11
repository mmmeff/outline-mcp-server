#!/bin/bash

# Outline MCP Desktop Extension Build Script
# This script builds and packages the Outline MCP server as a DXT extension

set -e

echo "🏗️  Building Outline MCP Desktop Extension..."

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf dist/
rm -f outline-mcp-extension.dxt

# build TS
npm run build

# Generate DXT manifest from package.json and compiled tools
echo "📝 Generating DXT manifest..."
node scripts/generate-dxt-manifest.js

# Create dist directory structure (dist already exists from manifest generation)
echo "📁 Creating directory structure..."
mkdir -p dist/dxt-server
mkdir -p dist/assets

# Copy compiled DXT server files
echo "📄 Copying compiled DXT server files..."
cp package.json dist/package.json
cp build/dxt.js dist/dxt-server/index.js
cp -r build dist/build
cp -r build/tools dist/dxt-server/
cp -r build/utils dist/dxt-server/
cp -r build/outline dist/dxt-server/
chmod +x dist/dxt-server/index.js

# Copy assets (icon, etc.)
echo "🎨 Copying assets..."
if [ -d "assets" ]; then
  cp -r assets/* dist/assets/
else
  echo "⚠️  No assets directory found, skipping..."
fi

# Install dependencies in dist
echo "📦 Installing production dependencies..."
cd dist
npm install --production --silent --ignore-scripts --no-audit --no-fund
cd ..

# Create the DXT package
echo "🗜️  Creating DXT package..."
cd dist
zip -r ../outline-mcp-extension.dxt . --no-dir-entries > /dev/null
cd ..

# Verify the package
echo "✅ Verifying package..."
if [ -f "outline-mcp-extension.dxt" ]; then
  echo "✅ DXT package created successfully: outline-mcp-extension.dxt"
  echo "📊 Package size: $(ls -lh outline-mcp-extension.dxt | awk '{print $5}')"
  echo ""
  echo "📋 Package contents:"
  unzip -l outline-mcp-extension.dxt | head -20
  echo ""
  echo "🎉 Build completed successfully!"
  echo ""
  echo "To install this extension:"
  echo "  1. Open Claude for macOS/Windows"
  echo "  2. Open the extension file: outline-mcp-extension.dxt"
  echo "  3. Follow the installation dialog"
  echo ""
  echo "Required configuration:"
  echo "  - OUTLINE_API_KEY: Your Outline API key"
  echo "  - OUTLINE_API_URL: Your Outline API URL (optional)"
else
  echo "❌ Failed to create DXT package"
  exit 1
fi 