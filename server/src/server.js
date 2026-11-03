import 'dotenv/config';
import { createApp } from './app.js';
import { connectDB } from './config/db.js';

const PORT = Number(process.env.PORT) || 4000;

try {
  await connectDB(process.env.MONGODB_URI);
} catch (err) {
  console.error(`Could not connect to MongoDB: ${err.message}`);
  process.exit(1);
}

createApp().listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}  (health check: /api/health)`);
});
