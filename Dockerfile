FROM node:18-slim

# Install dependencies and Stockfish
RUN apt-get update && \
    apt-get install -y stockfish procps && \
    chmod +x /usr/games/stockfish && \
    ln -s /usr/games/stockfish /usr/local/bin/stockfish && \
    rm -rf /var/lib/apt/lists/*

# Verify Stockfish installation
RUN stockfish --version

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