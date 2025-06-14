import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef, useState } from 'react'
import { FaChevronDown, FaChevronUp, FaTrash } from 'react-icons/fa'
import { FaEllipsis, FaPlus, FaX } from 'react-icons/fa6'
import TextareaAutosize from 'react-textarea-autosize'
import PopupMenu from '../ui/popupMenu'
import DatePicker from './DatePicker'
import PriorityPicker from './PriorityPicker'
import SectionPicker from './SectionPicker'
import type { PriorityOption } from '@prisma/client'
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
  const textEditingRef = useRef<HTMLInputElement>(null)
  const descriptionEditingRef = useRef<HTMLTextAreaElement>(null)
  const [
    isEditingTextOrDescriptionTarget,
    setIsEditingTextOrDescriptionTarget,
  ] = useState('')
  const [text, setText] = useState('')
  const [description, setDescription] = useState('')
  // const [dueDate, setDueDate] = useState<Date | null>(task.dueDate ?? null)

  useEffect(() => {
    setText(task.text)
    setDescription(task.description ?? '')
  }, [task])

  useEffect(() => {
    if (isEditingTextOrDescriptionTarget === 'text') {
      textEditingRef.current?.focus()
    } else if (isEditingTextOrDescriptionTarget === 'description') {
      descriptionEditingRef.current?.focus()
      descriptionEditingRef.current?.setSelectionRange(
        descriptionEditingRef.current.value.length,
        descriptionEditingRef.current.value.length,
      )
    }
  }, [isEditingTextOrDescriptionTarget])

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
  const handleUpdateTextAndDescription = () => {
    updateTask({ ...task, text, description })
    setIsEditingTextOrDescriptionTarget('')
  }

  const handleComplete = () => {
    console.log('handling complete')
    updateTask({ ...task, complete: true })
  }

  const handleSectionUpdate = (newSectionId: string) => {
    updateTask({ ...task, sectionId: newSectionId })
  }

  const handleDueDate = (date: Date | null) => {
    updateTask({ ...task, dueDate: date ?? null })
  }

  const handlePriorityUpdate = (priority: PriorityOption | null) => {
    updateTask({ ...task, priority: priority })
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
      <div className="grid h-full grid-cols-5 border-t">
        {/* main */}
        <div className="col-span-3 flex flex-col p-2">
          <div className="flex gap-2">
            <input
              type="checkbox"
              onClick={handleComplete}
              className="mt-1 rounded-full bg-inherit"
            />
            <div className="flex flex-1 flex-col">
              {isEditingTextOrDescriptionTarget ? (
                <div className="rounded-lg border border-white/30 p-1">
                  <input
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    ref={textEditingRef}
                    placeholder="Task..."
                  />
                  <TextareaAutosize
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    ref={descriptionEditingRef}
                    placeholder="Description..."
                    className="text-muted m-0 border-0 bg-inherit p-0 text-xs"></TextareaAutosize>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      className="button-secondary button-compact"
                      onClick={() => setIsEditingTextOrDescriptionTarget('')}>
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="button-primary button-compact"
                      onClick={handleUpdateTextAndDescription}>
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-1 flex-col">
                  <span
                    onClick={() => setIsEditingTextOrDescriptionTarget('text')}>
                    {text}
                  </span>
                  <span
                    onClick={() =>
                      setIsEditingTextOrDescriptionTarget('description')
                    }
                    className="text-muted m-0 border-0 bg-inherit p-0 text-xs">
                    {description.length > 0 ? description : 'Description...'}
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className="mt-4 ml-6 flex flex-col">
            <button
              type="button"
              className="flex w-fit items-center gap-2 rounded p-1 text-sm hover:bg-white/30">
              <FaPlus /> Add checklist item
            </button>
          </div>
        </div>
        {/* aside */}
        <aside className="col-span-2 flex flex-col gap-2 rounded-br-xl bg-white/10 p-2">
          <div className="border-b-muted flex flex-col gap-1 border-b-1 p-2">
            <span className="text-sm font-bold">Collection</span>
            <SectionPicker
              value={task.sectionId}
              setValue={handleSectionUpdate}
            />
          </div>
          <div className="border-b-muted flex flex-col gap-1 border-b-1 p-2">
            <span className="text-sm font-bold">Due Date</span>
            <DatePicker value={task.dueDate} setValue={handleDueDate} />
          </div>
          <div className="border-b-muted flex flex-col gap-1 border-b-1 p-2">
            <span className="text-sm font-bold">Priority</span>
            <PriorityPicker
              value={task.priority}
              setValue={(priority) => handlePriorityUpdate(priority)}
            />
          </div>
        </aside>
      </div>
    </div>
  )
}
