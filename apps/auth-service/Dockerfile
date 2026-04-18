FROM node:20-alpine AS builder
# openssl for Prisma; python3/make/g++ to compile bcrypt native addon
RUN apk add --no-cache openssl python3 make g++
WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/api-gateway/package.json              ./apps/api-gateway/
COPY apps/auth-service/package.json             ./apps/auth-service/
COPY apps/service-registry-service/package.json ./apps/service-registry-service/
COPY apps/dependency-mapping-service/package.json ./apps/dependency-mapping-service/
COPY apps/change-request-service/package.json   ./apps/change-request-service/
COPY apps/impact-analysis-service/package.json  ./apps/impact-analysis-service/
COPY apps/notification-service/package.json     ./apps/notification-service/
COPY apps/frontend/package.json                 ./apps/frontend/

# Remove --ignore-scripts so bcrypt native binding (bcrypt_lib.node) is compiled
RUN npm install

COPY tsconfig.base.json ./
COPY apps/auth-service ./apps/auth-service/

# Generate Prisma client into apps/auth-service/node_modules/@prisma/client
RUN cd apps/auth-service && npx prisma generate
RUN cd apps/auth-service && npx tsc -p tsconfig.json

FROM node:20-alpine
RUN apk add --no-cache openssl
WORKDIR /app
ENV NODE_ENV=production

# Root hoisted deps + service-local Prisma client
COPY --from=builder /app/node_modules                        ./node_modules
COPY --from=builder /app/apps/auth-service/node_modules      ./apps/auth-service/node_modules
COPY --from=builder /app/apps/auth-service/dist              ./apps/auth-service/dist
COPY --from=builder /app/apps/auth-service/prisma            ./apps/auth-service/prisma
COPY --from=builder /app/apps/auth-service/package.json      ./apps/auth-service/package.json

WORKDIR /app/apps/auth-service
EXPOSE 3001
COPY --from=builder /app/apps/auth-service/entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh
CMD ["sh", "./entrypoint.sh"]
