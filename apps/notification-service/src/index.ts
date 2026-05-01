import 'dotenv/config';
import app from './app';
import { startConsumer } from './lib/consumer';

const PORT = process.env.PORT || 3006;

const startServer = async () => {
  // Start HTTP first so /health responds during Docker startup health checks
  const server = app.listen(PORT, () => {
    console.log(`🔔 Notification Service running on port ${PORT}`);
  });

  // Consumer is non-blocking — service stays up even if RabbitMQ is temporarily unavailable
  startConsumer().catch((err) =>
    console.error('RabbitMQ consumer failed to start:', err)
  );

  process.on('SIGTERM', () => {
    server.close();
  });
};

startServer();
