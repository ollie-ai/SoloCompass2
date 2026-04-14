# Production Dockerfile for Node.js backend
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY src ./src

# Environment variables
ENV NODE_ENV=production
ENV PORT=3005

# Expose port
EXPOSE 3005

# Create logs directory and set permissions for non-root user
RUN mkdir -p /app/logs && chown -R node:node /app

# Run as non-root user
USER node

# Start the server
CMD ["node", "src/index.js"]
