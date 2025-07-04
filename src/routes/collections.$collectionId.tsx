import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import CollectionView from '@/components/CollectionView'
import LoadOrRetry from '@/components/shared/LoadOrRetry'
import { useTRPC } from '@/integrations/trpc/react'

export const Route = createFileRoute('/collections/$collectionId')({
  component: RouteComponent,
})

function RouteComponent() {
  const { collectionId } = Route.useParams()
  const trpc = useTRPC()
  const {
    data: collection,
    isLoading,
    isError,
    refetch: retry,
  } = useQuery(
    trpc.collection.readOne.queryOptions({
      id: collectionId,
    }),
  )

  if (collection) {
    return <CollectionView collection={collection} />
  } else {
    return <LoadOrRetry isLoading={isLoading} isError={isError} retry={retry} />
  }
}
