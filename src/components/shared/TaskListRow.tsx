import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { RxDragHandleDots2 } from 'react-icons/rx'
import { CgListTree } from 'react-icons/cg'
import { TbProgressCheck } from 'react-icons/tb'
import TaskModal from '../TaskModal'
import Modal from '../ui/modal'
import DatePicker from './DatePicker'
import PriorityPicker from './PriorityPicker'
import SectionPicker from './SectionPicker'
import type { TaskType } from '@/integrations/trpc/types'
import { useTRPC } from '@/integrations/trpc/react'

export default function TaskRow({
  task,
  collectionId,
}: {
  task: TaskType
  collectionId: string
}) {
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const { mutate: updateTask } = useMutation(
    trpc.task.update.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: trpc.task.today.queryKey(),
        })
        await queryClient.invalidateQueries({
          queryKey: trpc.collection.readAll.queryKey(),
        })
        await queryClient.invalidateQueries({
          queryKey: trpc.collection.inbox.queryKey(),
        })
        await queryClient.invalidateQueries({
          queryKey: trpc.collection.readOne.queryKey({
            id: collectionId,
          }),
        })
      },
    }),
  )

  const handleToggleComplete = () => {
    console.log('handling complete')
    updateTask({ ...task, complete: !task.complete })
  }

  const handleTaskModal = () => {
    console.log('showing task modal')
    setIsTaskModalOpen(true)
  }

  const handleTaskDueDateChange = (dueDate: Date | null) => {
    updateTask({ ...task, dueDate })
  }

  const handleSectionChange = (sectionId: string) => {
    updateTask({ ...task, sectionId })
  }
  return (
    <div>
      <div className="hover:bg-foreground/40 cursor-pointer border-b-1 border-b-white/30 py-2">
        <div>
          <div className="flex gap-2">
            <RxDragHandleDots2 className="drag-handle" />
            <input
              type="checkbox"
              checked={task.complete}
              onClick={handleToggleComplete}
              className="rounded-full bg-inherit"
            />
            <div onClick={handleTaskModal} className="flex flex-1 flex-col">
              <span
                className={`text-sm ${task.complete ? 'line-through' : ''}`}>
                {task.text}
              </span>
              <span className="text-xs">{task.description}</span>
              <div className="mt-1 flex items-center gap-2 text-xs text-white/60">
                {task.children && task.children.length > 0 && (
                  <div className="flex items-center gap-1">
                    <CgListTree />{' '}
                    {task.children.filter((t) => t.complete).length}/
                    {task.children.length}
                  </div>
                )}
                {task.parentId && <TbProgressCheck />}
                <DatePicker
                  value={task.dueDate}
                  setValue={handleTaskDueDateChange}
                />
                <PriorityPicker
                  value={task.priority}
                  setValue={(priority) => {
                    updateTask({ ...task, priority })
                  }}
                />
                {task.parentId === null && (
                  <div className="ml-auto">
                    <SectionPicker
                      value={task.sectionId}
                      setValue={handleSectionChange}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Modal isOpen={isTaskModalOpen} close={() => setIsTaskModalOpen(false)}>
        <TaskModal
          task={task}
          dismiss={() => setIsTaskModalOpen(false)}
          collectionId={collectionId}
        />
      </Modal>
    </div>
  )
}
