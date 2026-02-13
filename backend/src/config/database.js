import { PrismaClient } from '@prisma/client';
import { NODE_ENV } from './env.js';

let logLevels;

if (NODE_ENV === 'development') {
  logLevels = ['query', 'info', 'warn', 'error'];
} else {
  logLevels = ['error'];
}

const prisma = new PrismaClient({
  log: logLevels,
});

export default prisma;
