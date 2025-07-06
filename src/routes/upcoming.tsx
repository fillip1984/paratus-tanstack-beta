import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import {
  eachDayOfInterval,
  format,
  isSunday,
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
  const [lastSunday] = useState(isSunday(today) ? today : previousSunday(today))
  const [upcomingSaturday] = useState(nextSaturday(today))
  const [_week] = useState(
    eachDayOfInterval({ start: lastSunday, end: upcomingSaturday }),
  )

  const trpc = useTRPC()
  const { data: tasks } = useQuery(trpc.task.today.queryOptions())

  const overdueSection: SectionDetailType = {
    id: 'Overdue',
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

  const daysAsSections: SectionDetailType[] = _week.map((day) => {
    const dayTasks =
      tasks?.filter((task) => {
        if (!task.dueDate) return false
        return startOfDay(day).getTime() === startOfDay(task.dueDate).getTime()
      }) ?? []

    return {
      id: day.getTime().toString(),
      name: format(day, 'MMM dd - EEE'),
      position: day.getTime(),
      tasks: dayTasks,
      _count: {
        tasks: dayTasks.length,
      },
    } satisfies SectionDetailType
  })

  const upcoming = {
    name: 'Upcoming',
    id: 'Upcoming',
    sections: [overdueSection, ...daysAsSections],
    position: -1,
  } satisfies CollectionDetailType

  return <CollectionView collection={upcoming} />
}
