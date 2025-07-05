/**
 * Instantiates a single instance PrismaClient and save it on the global object.
 * @see https://www.prisma.io/docs/support/help-articles/nextjs-prisma-client-dev-practices
 */
import { PrismaClient } from '@prisma/client'

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
}

const prismaGlobal = globalThis as typeof globalThis & {
  prisma?: PrismaClient
}

console.log('initializing db with env:', env.NODE_ENV)
export const db: PrismaClient =
  prismaGlobal.prisma ??
  new PrismaClient({
    log:
      env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (env.NODE_ENV !== 'production') {
  prismaGlobal.prisma = db
}
