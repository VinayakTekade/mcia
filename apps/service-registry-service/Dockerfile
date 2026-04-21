FROM node:20-alpine AS builder
RUN apk add --no-cache openssl
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

RUN npm install --ignore-scripts

COPY tsconfig.base.json ./
COPY apps/service-registry-service ./apps/service-registry-service/

RUN cd apps/service-registry-service && npx prisma generate
RUN cd apps/service-registry-service && npx tsc -p tsconfig.json

FROM node:20-alpine
RUN apk add --no-cache openssl
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/node_modules                                    ./node_modules
COPY --from=builder /app/apps/service-registry-service/node_modules      ./apps/service-registry-service/node_modules
COPY --from=builder /app/apps/service-registry-service/dist              ./apps/service-registry-service/dist
COPY --from=builder /app/apps/service-registry-service/prisma            ./apps/service-registry-service/prisma
COPY --from=builder /app/apps/service-registry-service/package.json      ./apps/service-registry-service/package.json

WORKDIR /app/apps/service-registry-service
EXPOSE 3002
COPY --from=builder /app/apps/service-registry-service/entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh
CMD ["sh", "./entrypoint.sh"]
