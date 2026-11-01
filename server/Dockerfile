FROM node:20-alpine
WORKDIR /app

# Install only production dependencies (layer is cached until package files change).
COPY package*.json ./
RUN npm ci --omit=dev

COPY src ./src

ENV NODE_ENV=production
EXPOSE 5000
USER node
CMD ["node", "src/server.js"]
