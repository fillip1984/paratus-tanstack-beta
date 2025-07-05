import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { format, isSameDay, startOfDay } from 'date-fns'
import CollectionView from '@/components/CollectionView'
import { useTRPC } from '@/integrations/trpc/react'
import type {
  CollectionDetailType,
  SectionDetailType,
} from '@/integrations/trpc/types'

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
    tasks:
      tasks?.filter(
        (task) =>
          task.dueDate &&
          startOfDay(new Date()).getTime() > task.dueDate.getTime(),
      ) ?? [],
    _count: {
      tasks: tasks?.length ?? 0,
    },
  }
  const todaySection: SectionDetailType = {
    id: 'today',
    name: format(new Date(), "MMM do '- Today - ' EEEE"),
    position: 1,
    tasks:
      tasks?.filter(
        (task) => task.dueDate && isSameDay(task.dueDate, new Date()),
      ) ?? [],
    _count: {
      tasks: tasks?.length ?? 0,
    },
  }
  const today = {
    name: 'Today',
    id: 'today',
    sections: [overdueSection, todaySection],
  } as CollectionDetailType

  return <CollectionView collection={{ ...today, name: 'Today' }} />
}
