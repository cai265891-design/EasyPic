# Dockerfile for Railway Worker deployment
FROM node:20-alpine

# Install pnpm
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Copy prisma schema first (needed for postinstall)
COPY prisma ./prisma

# Install dependencies (skip frozen lockfile to avoid esbuild conflicts)
# Set PRISMA_SKIP_POSTINSTALL_GENERATE to skip auto generation
ENV PRISMA_SKIP_POSTINSTALL_GENERATE=true
RUN pnpm install --no-frozen-lockfile

# Copy rest of source code
COPY . .

# Generate Prisma Client
RUN pnpm prisma generate

# Start workers
CMD ["pnpm", "workers:prod"]
