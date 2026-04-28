import 'dotenv/config';
import app from './app';
import { connectRabbitMQ } from './lib/rabbitmq';

const PORT = process.env.PORT || 3004;

const startServer = async () => {
  await connectRabbitMQ();
  
  const server = app.listen(PORT, () => {
    console.log(`📝 Change Request Service running on port ${PORT}`);
  });

  process.on('SIGTERM', () => {
    server.close();
  });
};

startServer();
