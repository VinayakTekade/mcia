FROM node:20-alpine AS builder
WORKDIR /app

# Copy ALL workspace package.json files — npm install requires them all
COPY package.json package-lock.json ./
COPY apps/api-gateway/package.json              ./apps/api-gateway/
COPY apps/auth-service/package.json             ./apps/auth-service/
COPY apps/service-registry-service/package.json ./apps/service-registry-service/
COPY apps/dependency-mapping-service/package.json ./apps/dependency-mapping-service/
COPY apps/change-request-service/package.json   ./apps/change-request-service/
COPY apps/impact-analysis-service/package.json  ./apps/impact-analysis-service/
COPY apps/notification-service/package.json     ./apps/notification-service/
COPY apps/frontend/package.json                 ./apps/frontend/

# Install all workspace dependencies (hoisted to root node_modules)
RUN npm install --ignore-scripts

# Copy source
COPY tsconfig.base.json ./
COPY apps/api-gateway ./apps/api-gateway/

# Build TypeScript
RUN cd apps/api-gateway && npx tsc -p tsconfig.json

# =============================================
# Production stage — no devDependencies, no source
# =============================================
FROM node:20-alpine
WORKDIR /app

ENV NODE_ENV=production

# Root node_modules has all hoisted deps (no workspace-local node_modules for api-gateway)
COPY --from=builder /app/node_modules              ./node_modules
COPY --from=builder /app/apps/api-gateway/dist     ./apps/api-gateway/dist
COPY --from=builder /app/apps/api-gateway/package.json ./apps/api-gateway/package.json

WORKDIR /app/apps/api-gateway
EXPOSE 3000
CMD ["node", "dist/index.js"]
