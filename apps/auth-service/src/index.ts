import 'dotenv/config';
import app from './app';

const PORT = process.env.PORT || 3001;

const server = app.listen(PORT, () => {
  console.log(`🔒 Auth Service running on port ${PORT}`);
});

process.on('SIGTERM', () => {
  server.close();
});
