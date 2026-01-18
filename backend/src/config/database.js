import { PrismaClient } from '@prisma/client';

let logLevels;

if (process.env.NODE_ENV === 'development') {
  logLevels = ['query', 'info', 'warn', 'error'];
} else {
  logLevels = ['error'];
}

const prisma = new PrismaClient({
  log: logLevels,
});

export default prisma;
