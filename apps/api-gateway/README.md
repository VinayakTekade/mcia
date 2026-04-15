# API Gateway Service

This service acts as the central entry point for the frontend, proxying requests to the downstream microservices.

## Features
*   **Routing**: Proxies requests via `http-proxy-middleware`.
*   **Security**: Uses `helmet` for HTTP headers and `cors` for Cross-Origin resource sharing.
*   **Rate Limiting**: Protects against basic DDoS using `express-rate-limit`.
*   **Authentication**: Validates JSON Web Tokens (JWT) for protected routes before forwarding.
*   **Logging**: Basic request logging via `morgan`.

## Environment Variables
See `.env.example` for required variables.

## Scripts
*   `npm run dev`: Start in development mode with `ts-node`.
*   `npm run build`: Compile TypeScript to `dist/`.
*   `npm start`: Run the compiled output.
*   `npm test`: Run Jest tests.
