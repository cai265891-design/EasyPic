# Dockerfile for Railway Worker deployment
FROM node:20-alpine

# Install pnpm
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies (skip frozen lockfile to avoid esbuild conflicts)
RUN pnpm install --no-frozen-lockfile

# Copy source code
COPY . .

# Generate Prisma Client
RUN pnpm prisma generate

# Start workers
CMD ["pnpm", "workers:prod"]
