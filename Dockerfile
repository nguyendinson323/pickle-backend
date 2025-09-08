# Multi-stage Dockerfile for Node.js/TypeScript backend

# Development stage
FROM node:18-alpine AS development

WORKDIR /app

# Install dependencies first for better layer caching
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Create necessary directories
RUN mkdir -p logs tmp

# Expose port
EXPOSE 5000

# Start development server with ts-node-dev
CMD ["npm", "run", "dev"]

# Production build stage
FROM node:18-alpine AS production-build

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Build the TypeScript application
RUN npm run build

# Production stage
FROM node:18-alpine AS production

# Install curl for healthcheck
RUN apk add --no-cache curl

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S backend -u 1001

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy built application from production-build stage
COPY --from=production-build --chown=backend:nodejs /app/dist ./dist
COPY --from=production-build --chown=backend:nodejs /app/db ./db
COPY --from=production-build --chown=backend:nodejs /app/config ./config

# Create necessary directories
RUN mkdir -p logs tmp && chown -R backend:nodejs logs tmp

# Switch to non-root user
USER backend

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:5000/health || exit 1

# Start the application
CMD ["npm", "start"]