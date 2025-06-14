import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef, useState } from 'react'
import TextareaAutosize from 'react-textarea-autosize'
import DatePicker from './DatePicker'
import PriorityPicker from './PriorityPicker'
import SectionPicker from './SectionPicker'
import type { FormEvent } from 'react'
import type { PriorityOption } from '@prisma/client'
import { useTRPC } from '@/integrations/trpc/react'

export default function AddTaskCard({
  currentCollectionId,
  currentSectionId,
  parentTaskId,
  defaultDueDate,
  dismiss,
}: {
  currentCollectionId: string
  currentSectionId: string
  parentTaskId?: string | null
  defaultDueDate?: Date | null
  dismiss: () => void
}) {
  // steal focus
  useEffect(() => {
    formRef.current?.querySelector('input')?.focus()
  }, [])
  const [text, setText] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState<Date | null>(defaultDueDate ?? null)
  const [priority, setPriority] = useState<PriorityOption | null>(null)
  const [sectionId, setSectionId] = useState<string | null>(currentSectionId)
  const [isFormValid, setIsFormValid] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)
  useEffect(() => {
    if (text.trim()) {
      setIsFormValid(true)
    } else {
      setIsFormValid(false)
    }
  }, [text])

  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const { mutate: createTask } = useMutation(
    trpc.task.create.mutationOptions({
      onSuccess: async () => {
        console.log('task created')
        // dismiss()
        setText('')
        setDescription('')
        // TODO: figure out invalidation strategy
        await queryClient.invalidateQueries({
          queryKey: trpc.task.today.queryKey(),
        })
        await queryClient.invalidateQueries({
          queryKey: trpc.collection.readAll.queryKey(),
        })
        // if (selectedCollectionAndSection) {
        await queryClient.invalidateQueries({
          queryKey: trpc.collection.readOne.queryKey({
            id: currentCollectionId,
          }),
        })
        // }
        await queryClient.invalidateQueries({
          queryKey: trpc.collection.inbox.queryKey(),
        })
      },
    }),
  )

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    console.log('submitting')
    if (!sectionId) {
      console.error('No collection and section selected')
      return
    }
    createTask({
      text,
      description,
      dueDate: dueDate,
      priority: priority,
      sectionId: sectionId,
      parentTaskId: parentTaskId,
    })
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col rounded-xl border border-white/30 bg-white/5"
      ref={formRef}>
      <div className="flex flex-col p-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Task name"
          required
        />
        <TextareaAutosize
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description"
          className="m-0 border-0 bg-inherit p-0 text-xs"></TextareaAutosize>
        <div className="flex items-center gap-2">
          <DatePicker value={dueDate} setValue={setDueDate} />
          <PriorityPicker value={priority} setValue={setPriority} />

          {/* <button
        type="button"
        className="flex items-center gap-2 rounded border border-white/30 px-2 py-1 text-sm text-white/60">
        <FaRegClock />
        Reminders
      </button>
      <button
        type="button"
        className="flex items-center gap-2 rounded border border-white/30 px-2 py-1 text-sm text-white/60">
        <FaEllipsis />
      </button> */}
        </div>
      </div>
      <div className="flex justify-between gap-2 border border-x-0 border-b-0 border-t-white/30 p-2">
        <SectionPicker value={sectionId} setValue={setSectionId} />
        <div className="flex gap-2">
          <button
            type="button"
            onClick={dismiss}
            className="border-secondary text-secondary rounded border px-2 py-1 opacity-80 hover:opacity-100">
            Cancel
          </button>
          <button
            type="submit"
            disabled={!isFormValid}
            className="bg-primary rounded px-2 py-1">
            Add
          </button>
        </div>
      </div>
    </form>
  )
}
