# Minimal Multi-stage Dockerfile for outline-mcp-server
FROM node:24-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci --ignore-scripts
COPY . .
RUN npm run build

FROM node:24-alpine
LABEL org.opencontainers.image.source="https://github.com/mmmeff/outline-mcp-server" \
  org.opencontainers.image.licenses="MIT" \
  org.opencontainers.image.description="Outline MCP Server: ships as Docker image and npm package"
WORKDIR /app
COPY --from=build /app/build ./build
COPY --from=build /app/package*.json ./
RUN npm install --omit=dev --ignore-scripts
EXPOSE 6060
CMD ["node", "build/index.js"]
