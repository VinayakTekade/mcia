import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import registryRoutes from './routes/registry.routes';
import { errorHandler } from './middlewares/error.middleware';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', service: 'service-registry-service' });
});

app.use('/', registryRoutes);

app.use(errorHandler);

export default app;
