import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import {
  FaChevronDown,
  FaChevronUp,
  FaParagraph,
  FaTrash,
} from 'react-icons/fa'
import { FaEllipsis, FaPlus, FaX } from 'react-icons/fa6'
import TextareaAutosize from 'react-textarea-autosize'
import { set } from 'date-fns'
import PopupMenu from '../ui/popupMenu'
import DatePicker from './DatePicker'
import type { FormEvent } from 'react'
import type { TaskType } from '@/integrations/trpc/types'
import { useTRPC } from '@/integrations/trpc/react'

export default function TaskModal({
  collectionId,
  task,
  dismiss,
}: {
  collectionId: string
  task: TaskType
  dismiss: () => void
}) {
  const [text, setText] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState<Date | null>(task.dueDate ?? null)

  useEffect(() => {
    setText(task.text)
    setDescription(task.description ?? '')
  }, [task])

  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const { mutate: deleteTask } = useMutation(
    trpc.task.delete.mutationOptions({
      onSuccess: async () => {
        console.log('task deleted')
        dismiss()
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
        // await queryClient.invalidateQueries({
        //   queryKey: [
        //     trpc.task.today.queryKey(),
        //     trpc.collection.readAll.queryKey(),
        //     trpc.collection.readAll.queryKey(),
        //     trpc.collection.readOne.queryKey({
        //       id: collectionId,
        //     }),
        //   ],
        // })
      },
    }),
  )
  const handleUpdateTextAndDescription = (e: FormEvent) => {
    updateTask({ ...task, text, description })
  }

  const handleComplete = () => {
    console.log('handling complete')
    updateTask({ ...task, complete: true })
  }

  const handleDueDate = (date: Date | null) => {
    setDueDate(date)
    updateTask({ ...task, dueDate: date ?? null })
  }

  return (
    <div className="flex h-[400px] w-[600px] flex-col">
      {/* header */}
      <div className="flex items-center justify-between p-2">
        {/* leading */}
        <div>
          <span>List name</span>
        </div>

        {/* trailing */}
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <FaChevronUp />
            <FaChevronDown />
          </span>
          <PopupMenu
            button={
              <span>
                <FaEllipsis />
              </span>
            }
            content={
              <div className="flex w-[100px] flex-col gap-1 p-1">
                <span
                  className="flex cursor-pointer items-center gap-2 rounded p-1 text-white hover:bg-white/10"
                  onClick={() => deleteTask({ id: task.id })}>
                  <FaTrash className="text-danger flex-shrink-0" /> Delete
                </span>
              </div>
            }
          />

          <span onClick={dismiss} className="cursor-pointer">
            <FaX />
          </span>
        </div>
      </div>

      {/* main content */}
      <div className="grid h-full grid-cols-3 border-t">
        {/* main */}
        <div className="col-span-2 flex flex-col p-2">
          {/* <form onSubmit={handleSaveTask}> */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              onClick={handleComplete}
              className="rounded-full bg-inherit"
            />
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Task..."
            />
          </div>
          <div className="ml-6 flex flex-col">
            <TextareaAutosize
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description..."
              className="text-muted m-0 border-0 bg-inherit p-0 text-xs"></TextareaAutosize>
            <button type="button" className="flex items-center gap-2 text-sm">
              <FaPlus /> Add checklist item
            </button>
          </div>
          <div>
            <button type="button" onClick={handleUpdateTextAndDescription}>
              Save
            </button>
          </div>
        </div>
        {/* aside */}
        <aside className="flex flex-col rounded-br-xl bg-stone-800 p-2">
          Side
          <span>
            <DatePicker value={dueDate} setValue={handleDueDate} />
          </span>
        </aside>
      </div>
    </div>
  )
}
