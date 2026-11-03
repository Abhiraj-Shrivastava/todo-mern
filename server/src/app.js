import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import taskRoutes from './routes/taskRoutes.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

function corsOptions() {
  const origins = (process.env.CLIENT_ORIGIN ?? '')
    .split(',')
    .map((origin) => origin.trim().replace(/\/$/, ''))
    .filter(Boolean);
  return { origin: origins.length ? origins : true };
}

export function createApp() {
  const app = express();

  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  app.use(cors(corsOptions()));
  app.use(express.json({ limit: '100kb' }));
  if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'));

  app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
  app.use('/api/tasks', taskRoutes);

  app.use(notFound);
  app.use(errorHandler);
  return app;
}
