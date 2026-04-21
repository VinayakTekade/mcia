import 'dotenv/config';
import app from './app';

const PORT = process.env.PORT || 3002;

const server = app.listen(PORT, () => {
  console.log(`📘 Service Registry Service running on port ${PORT}`);
});

process.on('SIGTERM', () => {
  server.close();
});
