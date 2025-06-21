import { useQuery } from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { useTRPC } from '@/integrations/trpc/react'
import LoadOrRetry from '@/components/shared/LoadOrRetry'

// TODO: need to figure out a place to run initializeCollections... for now doing it here
export const Route = createFileRoute('/')({
  component: RouteComponent,
  // component: () => <Navigate to="/today" />,
})

function RouteComponent() {
  const trpc = useTRPC()
  const navigator = useNavigate({ from: '/' })
  const {
    isLoading,
    isError,
    refetch: retry,
  } = useQuery(trpc.collection.initializeCollections.queryOptions())
  useEffect(() => {
    if (isLoading) {
      navigator({ to: '/today' })
    }
  }, [isLoading])

  return (
    <LoadOrRetry isLoading={isLoading} isError={isError} retry={retry} />
    // <div className="flex flex-1 flex-col items-center justify-center gap-1">
    //   <FaCircleNotch className="h-30 w-30 animate-spin" />
    //   <h4>Loading...</h4>
    // </div>
  )
}
