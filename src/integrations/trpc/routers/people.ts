import { publicProcedure } from '../init'
import type { TRPCRouterRecord } from '@trpc/server'

export const peopleRouter = {
  list: publicProcedure.query(async () => [
    {
      name: 'John Doe',
    },
    {
      name: 'Jane Doe',
    },
  ]),
} satisfies TRPCRouterRecord
