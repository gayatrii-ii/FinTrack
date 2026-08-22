import express, { Request, Response } from 'express';
import cors from 'cors';
import { config } from './config/env';
import routes from './routes';
import { errorHandler } from './middleware/error.middleware';
import prisma from './config/prisma';

const app = express();

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (
        config.nodeEnv === 'development' ||
        origin === config.clientUrl ||
        origin.startsWith('http://localhost') ||
        origin.startsWith('http://127.0.0.1')
      ) {
        return callback(null, true);
      }
      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', async (_req: Request, res: Response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({
      status: 'healthy',
      database: 'connected',
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    res.status(200).json({
      status: 'healthy',
      database: 'disconnected',
      error: err.message,
      timestamp: new Date().toISOString(),
    });
  }
});

app.use('/api', routes);

app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
  });
});

app.use(errorHandler);

const PORT = config.port;

const server = app.listen(PORT, () => {
  console.log(`[FinTrack Server] Running on http://localhost:${PORT}`);
  console.log(`[FinTrack Server] Environment: ${config.nodeEnv}`);
});

const shutdown = async () => {
  console.log('\n[FinTrack Server] Gracefully shutting down...');
  server.close(async () => {
    await prisma.$disconnect();
    console.log('[FinTrack Server] Closed database connections. Exited cleanly.');
    process.exit(0);
  });
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

export default app;
