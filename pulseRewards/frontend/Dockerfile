FROM node:20-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package*.json ../
RUN npm ci

FROM deps AS builder
COPY . .
ARG NEXT_PUBLIC_API_URL=http://localhost:3001
ARG NEXT_PUBLIC_STELLAR_NETWORK=testnet
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_STELLAR_NETWORK=$NEXT_PUBLIC_STELLAR_NETWORK
RUN npm run build:frontend

FROM base AS runner
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/frontend/public ./frontend/public
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./frontend/.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000
CMD ["node", "frontend/server.js"]
