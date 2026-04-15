import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { createProxyMiddleware, Options } from 'http-proxy-middleware';
import dotenv from 'dotenv';
import { verifyToken } from './middlewares/auth';
import { errorHandler } from './middlewares/error';

dotenv.config();

const app = express();

// Security Middlewares
app.use(helmet());
app.use(cors());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes',
});
app.use(limiter);

// Logging Middleware
app.use(morgan('combined'));

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', service: 'api-gateway' });
});

// Proxy Setup Helper
const proxyOptions = (target: string): Options => ({
  target,
  changeOrigin: true,
  pathRewrite: {
    '^/api': '/api', // keep /api prefix or rewrite if needed by downstream
  },
  on: {
    error: (err, req, res) => {
      console.error(`Proxy Error: ${err.message}`);
      // @ts-ignore
      res.status(502).json({ error: 'Bad Gateway - Downstream service is unavailable' });
    }
  }
});

// Unprotected Route: Auth Service Login/Register
const AUTH_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:3001';
app.use('/api/auth', createProxyMiddleware(proxyOptions(AUTH_URL)));

// Protected Routes (Require valid JWT)
const REGISTRY_URL = process.env.REGISTRY_SERVICE_URL || 'http://localhost:3002';
const DEPENDENCY_URL = process.env.DEPENDENCY_SERVICE_URL || 'http://localhost:3003';
const CHANGE_URL = process.env.CHANGE_SERVICE_URL || 'http://localhost:3004';
const IMPACT_URL = process.env.IMPACT_SERVICE_URL || 'http://localhost:3005';
const NOTIFICATION_URL = process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3006';

app.use('/api/services', verifyToken, createProxyMiddleware(proxyOptions(REGISTRY_URL)));
app.use('/api/dependencies', verifyToken, createProxyMiddleware(proxyOptions(DEPENDENCY_URL)));
app.use('/api/changes', verifyToken, createProxyMiddleware(proxyOptions(CHANGE_URL)));
app.use('/api/impact', verifyToken, createProxyMiddleware(proxyOptions(IMPACT_URL)));
app.use('/api/notifications', verifyToken, createProxyMiddleware(proxyOptions(NOTIFICATION_URL)));

// Centralized Error Handling Middleware
app.use(errorHandler);

export default app;
