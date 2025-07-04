import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import CollectionView from '@/components/CollectionView'
import { useTRPC } from '@/integrations/trpc/react'
import type { CollectionDetailType } from '@/integrations/trpc/types'

export const Route = createFileRoute('/inbox')({
  component: RouteComponent,
})

function RouteComponent() {
  const trpc = useTRPC()
  const { data: inbox } = useQuery(trpc.collection.inbox.queryOptions())

  return (
    <CollectionView
      collection={
        {
          ...inbox,
        } as CollectionDetailType
      }
    />
  )
}
