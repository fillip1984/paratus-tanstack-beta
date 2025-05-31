// import { TRPCError } from '@trpc/server'
import { createTRPCRouter } from './init'
import { peopleRouter } from './routers/people'
import { taskRouter } from './routers/task'

/**
 * This is the primary router for your server.
 *
 * All routers added in /trpc/routers should be manually added here.
 */
export const trpcRouter = createTRPCRouter({
  people: peopleRouter,
  task: taskRouter,
})
export type TRPCRouter = typeof trpcRouter
