FROM node:18-slim

# Install Stockfish
RUN apt-get update && \
    apt-get install -y stockfish && \
    rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /app

# Copy package files
COPY server/package*.json ./

# Install dependencies
RUN npm install

# Copy server code
COPY server .

# Expose the port the app runs on
EXPOSE 3001

# Start the app
CMD ["node", "stockfish-server.js"]