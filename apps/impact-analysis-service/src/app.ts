import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import impactRoutes from './routes/impact.routes';
import { errorHandler } from './middlewares/error.middleware';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', service: 'impact-analysis-service' });
});

app.use('/', impactRoutes);
app.use(errorHandler);

export default app;
