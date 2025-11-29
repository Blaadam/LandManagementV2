# Multi-stage Dockerfile for LandManagementV2
# Builder stage: install deps and (optionally) build TypeScript
FROM node:20-slim AS builder
WORKDIR /usr/src/app

# Ensure OpenSSL is present in the builder (Prisma detection may run during `prisma generate`).
RUN apt-get update -y \
 && apt-get install -y --no-install-recommends openssl ca-certificates \
 && rm -rf /var/lib/apt/lists/*

# Improve caching by copying package manifests first
COPY package*.json ./
RUN npm ci --no-audit --progress=false

# Copy project files and run build (if present)
COPY . .
RUN if npm run build --silent 2>/dev/null; then echo "ts build ran"; else echo "no build script or build skipped"; fi

# Generate Prisma client for the target environment (if a schema exists).
# This ensures the `generated` client matches the image platform/openssl.
RUN if [ -f prisma/schema.prisma ]; then npx prisma generate --schema=prisma/schema.prisma || true; fi

# Remove devDependencies to keep runtime layer small
RUN npm prune --production

# Runtime stage
FROM node:20-slim AS runner
WORKDIR /usr/src/app
ENV NODE_ENV=production

# Install OpenSSL in the runtime image so Prisma can detect libssl/opnessl at runtime.
RUN apt-get update -y \
 && apt-get install -y --no-install-recommends openssl ca-certificates \
 && rm -rf /var/lib/apt/lists/*

# Copy only what's needed at runtime
COPY --from=builder /usr/src/app/package*.json ./
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/bin ./bin
COPY --from=builder /usr/src/app/generated ./generated
COPY --from=builder /usr/src/app/prisma ./prisma
COPY --from=builder /usr/src/app/sql ./sql

# If you use environment variables, supply them with `docker run --env-file .env` or via docker-compose
# Expose a port only if your app listens on one. Discord bots typically don't, so this is optional.
EXPOSE 3000

# Default command runs the compiled JS in `bin` (repository includes built files).
CMD ["node", "bin/index.js"]
