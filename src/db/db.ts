import { PrismaClient } from './generated/prisma/client'

const env = process.env
export const prisma = new PrismaClient({
  log: env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  // log: env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
})
