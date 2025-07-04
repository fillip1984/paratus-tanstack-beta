// import { TRPCError } from '@trpc/server'
import { createTRPCRouter } from './init'
import { collectionRouter } from './routers/collection'
import { commentRouter } from './routers/comment'
import { sectionRouter } from './routers/section'
import { taskRouter } from './routers/task'

/**
 * This is the primary router for your server.
 *
 * All routers added in /trpc/routers should be manually added here.
 */
export const trpcRouter = createTRPCRouter({
  collection: collectionRouter,
  section: sectionRouter,
  task: taskRouter,
  comment: commentRouter,
})
export type TRPCRouter = typeof trpcRouter
