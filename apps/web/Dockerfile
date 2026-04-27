FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY apps/web/package.json ./package.json
RUN npm install

# Build the app
FROM base AS builder
RUN apk add --no-cache openssl libc6-compat
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY apps/web/ ./

RUN npx prisma generate --schema prisma/schema.prisma

# Create public dir if it doesn't exist (Next.js requires it for standalone)
RUN mkdir -p public

RUN npm run build

# Pre-compile seed script to plain JS so runner needs no TypeScript tooling
# Run seed with: docker exec <container> node /app/prisma/seed.js
RUN node_modules/.bin/esbuild prisma/seed.ts \
  --bundle \
  --platform=node \
  --outfile=prisma/seed.js \
  --external:@prisma/client \
  --external:bcryptjs

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN apk add --no-cache openssl libc6-compat
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
# bcryptjs needed by compiled seed.js at runtime
COPY --from=builder /app/node_modules/bcryptjs ./node_modules/bcryptjs

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
