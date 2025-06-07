import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { useTRPC } from '@/integrations/trpc/react'
import CollectionView from '@/components/CollectionView'

export const Route = createFileRoute('/collections/$collectionId')({
  component: RouteComponent,
})

function RouteComponent() {
  const { collectionId } = Route.useParams()
  const trpc = useTRPC()
  const { data: collection, isFetching } = useQuery(
    trpc.collection.readOne.queryOptions({
      id: collectionId,
    }),
  )

  return (
    <CollectionView
      collection={{
        ...collection,
        heading: collection?.name ?? 'Loading',
        taskCount: 0,
      }}
    />
  )
}
