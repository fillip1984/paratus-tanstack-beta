import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/collections/$collectionId')({
  component: RouteComponent,
})

function RouteComponent() {
  const { collectionId } = Route.useParams()
  return <div>Hello "/collections"! {collectionId}</div>
}
