# Dockerfile for Railway Worker deployment
FROM node:20-alpine

# Install OpenSSL, Sharp dependencies, and other build tools
RUN apk add --no-cache \
    openssl \
    libc6-compat \
    vips-dev \
    build-base \
    python3 \
    git

# Install pnpm
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Copy prisma schema first (needed for postinstall)
COPY prisma ./prisma

# Set build-time environment variables
ENV PRISMA_SKIP_POSTINSTALL_GENERATE=true
ENV NODE_ENV=production

# Install dependencies (skip frozen lockfile to avoid esbuild conflicts)
RUN pnpm install --no-frozen-lockfile

# Copy rest of source code
COPY . .

# Generate Prisma Client
RUN pnpm prisma generate

# Start workers (database initialization is handled in workers/index.ts)
CMD ["pnpm", "workers:prod"]
