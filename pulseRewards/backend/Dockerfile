FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache curl

FROM base AS deps
COPY package*.json ./
RUN npm ci --only=production

FROM base AS build-deps
COPY package*.json ./
RUN npm ci

FROM build-deps AS builder
COPY . .
RUN npm run build:backend

FROM base AS runner
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/database ./database

EXPOSE 3001
HEALTHCHECK --interval=15s --timeout=5s --retries=3 \
  CMD curl -sf http://localhost:3001/health || exit 1

USER node
CMD ["node", "backend/dist/index.js"]
