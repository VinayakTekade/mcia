import 'dotenv/config';
import app from './app';

const PORT = process.env.PORT || 3003;

const server = app.listen(PORT, () => {
  console.log(`🔗 Dependency Mapping Service running on port ${PORT}`);
});

process.on('SIGTERM', () => {
  server.close();
});
