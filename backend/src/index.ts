import express, { type Request, type Response } from 'express';
import dotenv from 'dotenv';
import { promises as fs } from 'node:fs';
import { PrismaClient } from '@prisma/client';
import validateEnv from './utils/validateEnv';
import { corsMiddleware } from './middlewares/cors';
import {
  multerErrorHandler,
  notFoundHandler,
  globalErrorHandler,
} from './middlewares/errorHandler';
import { UPLOAD_ROOT } from './middlewares/uploadImage';
import { complaintsRouter } from './resources/complaints/router';
import { issuesRouter } from './resources/complaints/issuesRouter';
import { developmentsRouter } from './resources/developments/router';
import { buildingsRouter } from './resources/buildings/router';
import { unitsRouter } from './resources/units/router';
import { suppliersRouter } from './resources/suppliers/router';
import { installersRouter } from './resources/installers/router';
import { usersRouter } from './resources/users/router';
import { itemsRouter } from './resources/items/router';
import { aiRouter } from './resources/ai/router';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import { v4 as uuidv4 } from 'uuid';
import { analyticsRouter } from './resources/analytics/router';
import { reportsRouter } from './resources/reports/router';

declare module 'express-session' {
  interface SessionData {
    uid: string;
    email: string;
    userTypeId: string;
  }
}

dotenv.config();
validateEnv();

const PORT = Number(process.env.PORT ?? 3000);
const prisma = new PrismaClient();

const app = express();

// Middlewares
app.use(corsMiddleware);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(UPLOAD_ROOT));
app.use(
  session({
    genid: () => uuidv4(),
    secret: process.env.SESSION_SECRET ?? 'minha-chave-super-segura',
    resave: true,
    saveUninitialized: true,
    cookie: { maxAge: 10 * 24 * 6 * 60 * 1000 },
  }),
);

// Garantir que o diretório de uploads existe
void fs.mkdir(UPLOAD_ROOT, { recursive: true }).catch((error) => {
  console.error('Falha ao garantir o diretório de uploads:', error);
});

// Rotas básicas
app.get('/', (_req: Request, res: Response) => {
  res.json({
    message: 'API Obralog ativa',
    endpoints: {
      health: '/health',
      reclamacoes: '/api/reclamacoes',
      login: '/api/login',
    },
  });
});

app.get('/health', async (_req: Request, res: Response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  } catch (error) {
    res
      .status(503)
      .json({ status: 'offline', message: (error as Error).message });
  }
});

// Rotas da API
app.use('/api/reclamacoes', complaintsRouter);
app.use('/api/issues', issuesRouter);
app.use('/api/developments', developmentsRouter);
app.use('/api/developments', buildingsRouter);
app.use('/api/buildings', unitsRouter);
app.use('/api/units', unitsRouter);
app.use('/api/suppliers', suppliersRouter);
app.use('/api/installers', installersRouter);
app.use('/api/users', usersRouter);
app.use('/api/items', itemsRouter);
app.use('/api/ai', aiRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/reports', reportsRouter);

// Middlewares de erro
app.use(multerErrorHandler);
app.use(notFoundHandler);
app.use(globalErrorHandler);

const server = app.listen(PORT, () => {
  console.log(`Servidor ouvindo na porta ${PORT}.`);
});

const shutdownSignals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM'];
shutdownSignals.forEach((signal) => {
  process.on(signal, () => {
    server.close(async () => {
      await prisma.$disconnect();
      process.exit(0);
    });
  });
});
