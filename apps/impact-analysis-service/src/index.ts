import 'dotenv/config';
import app from './app';
import { startConsumer } from './lib/consumer';

const PORT = process.env.PORT || 3005;

const startServer = async () => {
  await startConsumer();

  const server = app.listen(PORT, () => {
    console.log(`🔬 Impact Analysis Service running on port ${PORT}`);
  });

  process.on('SIGTERM', () => {
    server.close();
  });
};

startServer();
