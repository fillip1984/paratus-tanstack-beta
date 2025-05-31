import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/today')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="flex flex-1 flex-col overflow-x-auto p-2 pb-24">
      <h2>Hello "/today"!</h2>
    </div>
  )
}
