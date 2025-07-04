import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import {
  eachDayOfInterval,
  nextSaturday,
  previousSunday,
  startOfDay,
} from 'date-fns'
import { useState } from 'react'
import CollectionView from '@/components/CollectionView'
import { useTRPC } from '@/integrations/trpc/react'
import type {
  CollectionDetailType,
  SectionDetailType,
} from '@/integrations/trpc/types'

export const Route = createFileRoute('/upcoming')({
  component: RouteComponent,
})

function RouteComponent() {
  const [today] = useState(new Date())
  const [lastSunday] = useState(previousSunday(today))
  const [upcomingSaturday] = useState(nextSaturday(today))
  const [week] = useState(
    eachDayOfInterval({ start: lastSunday, end: upcomingSaturday }),
  )

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

  const upcoming = {
    name: 'Upcoming',
    id: 'upcoming',
    sections: [overdueSection],
    position: -1,
  } satisfies CollectionDetailType

  return <CollectionView collection={upcoming} />
}
