import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import changeRoutes from './routes/change.routes';
import { errorHandler } from './middlewares/error.middleware';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', service: 'change-request-service' });
});

app.use('/', changeRoutes);

app.use(errorHandler);

export default app;
