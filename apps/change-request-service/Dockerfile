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
COPY apps/change-request-service ./apps/change-request-service/

RUN cd apps/change-request-service && npx prisma generate
RUN cd apps/change-request-service && npx tsc -p tsconfig.json

FROM node:20-alpine
RUN apk add --no-cache openssl
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/node_modules                                  ./node_modules
COPY --from=builder /app/apps/change-request-service/node_modules      ./apps/change-request-service/node_modules
COPY --from=builder /app/apps/change-request-service/dist              ./apps/change-request-service/dist
COPY --from=builder /app/apps/change-request-service/prisma            ./apps/change-request-service/prisma
COPY --from=builder /app/apps/change-request-service/package.json      ./apps/change-request-service/package.json

WORKDIR /app/apps/change-request-service
EXPOSE 3004
COPY --from=builder /app/apps/change-request-service/entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh
CMD ["sh", "./entrypoint.sh"]
