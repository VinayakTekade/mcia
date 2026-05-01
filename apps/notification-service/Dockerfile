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
COPY apps/notification-service ./apps/notification-service/

RUN cd apps/notification-service && npx prisma generate
RUN cd apps/notification-service && npx tsc -p tsconfig.json

FROM node:20-alpine
RUN apk add --no-cache openssl
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/node_modules                                ./node_modules
COPY --from=builder /app/apps/notification-service/node_modules      ./apps/notification-service/node_modules
COPY --from=builder /app/apps/notification-service/dist              ./apps/notification-service/dist
COPY --from=builder /app/apps/notification-service/prisma            ./apps/notification-service/prisma
COPY --from=builder /app/apps/notification-service/package.json      ./apps/notification-service/package.json

WORKDIR /app/apps/notification-service
EXPOSE 3006
COPY --from=builder /app/apps/notification-service/entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh
CMD ["sh", "./entrypoint.sh"]
