import { useQuery } from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { FaCircleNotch } from 'react-icons/fa'
import { useTRPC } from '@/integrations/trpc/react'

// TODO: need to figure out a place to run initializeCollections... for now doing it here
export const Route = createFileRoute('/')({
  component: RouteComponent,
  // component: () => <Navigate to="/today" />,
})

function RouteComponent() {
  const trpc = useTRPC()
  const navigator = useNavigate({ from: '/' })
  const { isFetched } = useQuery(
    trpc.collection.initializeCollections.queryOptions(),
  )
  useEffect(() => {
    if (isFetched) {
      navigator({ to: '/today' })
    }
  }, [isFetched])

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-1">
      <FaCircleNotch className="h-30 w-30 animate-spin" />
      <h4>Initialing...</h4>
    </div>
  )
}
