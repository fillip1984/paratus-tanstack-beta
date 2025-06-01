import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import type {
  CollectionDetailType,
  SectionDetailType,
} from '@/integrations/trpc/types'
import CollectionView from '@/components/CollectionView'
import { useTRPC } from '@/integrations/trpc/react'

export const Route = createFileRoute('/today')({
  component: RouteComponent,
  // loader: async ({ context }) => {
  //   await context.queryClient.fetchQuery(
  //     context.trpc.task.readAll.queryOptions(),
  //   )
  // },
})

function RouteComponent() {
  const trpc = useTRPC()
  const { data: tasks } = useQuery(trpc.task.today.queryOptions())
  const overdueSection: SectionDetailType = {
    id: 'overdue',
    name: 'Overdue',
    position: 0,
    nature: 'overdue',
    tasks:
      tasks?.filter(
        (task) => task.dueDate && new Date(task.dueDate) < new Date(),
      ) ?? [],
  }
  const todaySection: SectionDetailType = {
    id: 'today',
    name: 'Jun 1 - Today - Sunday',
    position: 1,
    nature: 'today',
    tasks:
      tasks?.filter(
        (task) =>
          task.dueDate &&
          new Date(task.dueDate).toDateString() === new Date().toDateString(),
      ) ?? [],
  }
  const today = {
    name: 'Today',
    id: 'today',
    sections: [overdueSection, todaySection],
    heading: 'Today',
    taskCount: tasks?.length,
  } as CollectionDetailType

  return (
    <CollectionView collection={{ ...today, heading: 'Today', taskCount: 0 }} />
  )
}
