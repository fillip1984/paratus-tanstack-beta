import { createServerFileRoute } from '@tanstack/react-start/server'
import { fetchRequestHandler } from '@trpc/server/adapters/fetch'
import { createTRPCContext } from '@/integrations/trpc/init'
import { trpcRouter } from '@/integrations/trpc/router'

function handler({ request }: { request: Request }) {
  return fetchRequestHandler({
    req: request,
    router: trpcRouter,
    endpoint: '/api/trpc',
    createContext: () => {
      return createTRPCContext()
    },
  })
}

export const ServerRoute = createServerFileRoute('/api/trpc/$').methods({
  GET: handler,
  POST: handler,
})
