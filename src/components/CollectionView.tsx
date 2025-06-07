import { useMutation, useQueryClient } from '@tanstack/react-query'
import { startOfDay } from 'date-fns'
import { useEffect, useRef, useState } from 'react'
import { FaChevronDown, FaPlus, FaRegCheckCircle } from 'react-icons/fa'

import { RxSection } from 'react-icons/rx'
import TextareaAutosize from 'react-textarea-autosize'
import SectionPicker from './shared/SectionPicker'
import DatePicker from './shared/DatePicker'
import PriorityPicker from './shared/PriorityPicker'
import TaskModal from './shared/TaskModal'
import type { FormEvent } from 'react'
import type { PriorityOption } from '@prisma/client'
import type {
  CollectionDetailType,
  SectionDetailType,
  TaskType,
} from '@/integrations/trpc/types'
import { useTRPC } from '@/integrations/trpc/react'

export default function CollectionView({
  collection,
}: {
  collection: CollectionDetailType
}) {
  const [isAddSectionOpen, setIsAddSectionOpen] = useState(false)
  const [sectionName, setSectionName] = useState('')
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const { mutate: createSection } = useMutation(
    trpc.section.create.mutationOptions({
      onSuccess: async () => {
        console.log('section created')
        setIsAddSectionOpen(false)
        await queryClient.invalidateQueries({
          queryKey: trpc.collection.readAll.queryKey(),
        })
        await queryClient.invalidateQueries({
          queryKey: trpc.collection.readOne.queryKey({
            id: collection.id,
          }),
        })
      },
    }),
  )

  return (
    <div className="container">
      <div className="mx-6 my-10">
        <h2>{collection.heading}</h2>
        <span className="flex items-center gap-2 text-sm font-thin">
          <FaRegCheckCircle />
          {collection.taskCount} tasks
        </span>
      </div>

      <div className="flex flex-col gap-6">
        {collection.sections?.map((section) => (
          <Section
            key={section.id}
            section={section}
            defaultDueDate={
              collection.heading === 'Today' ? startOfDay(new Date()) : null
            }
          />
        ))}
      </div>
      {!isAddSectionOpen ? (
        <button
          onClick={() => setIsAddSectionOpen((prev) => !prev)}
          className="flex items-center gap-2 p-2">
          <RxSection className="text-primary" />
          <span className="">Add section</span>
        </button>
      ) : (
        <div className="flex flex-col gap-1">
          <input
            type="text"
            value={sectionName}
            onChange={(e) => setSectionName(e.target.value)}
            className="rounded border p-1"
            placeholder="Name of section..."
          />
          <div className="flex gap-2">
            <button
              onClick={() => setIsAddSectionOpen((prev) => !prev)}
              className="button-secondary">
              Cancel
            </button>
            <button
              onClick={() =>
                createSection({
                  collectionId: collection.id,
                  name: sectionName,
                })
              }
              className="button-primary">
              Add
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

const Section = ({
  section,
  defaultDueDate,
}: {
  section: SectionDetailType
  defaultDueDate?: Date | null
}) => {
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false)

  return (
    <div className="flex gap-4">
      <FaChevronDown />
      <div className="flex flex-1 flex-col gap-2">
        {section.name !== 'Uncategorized' && (
          <div className="flex items-center gap-2 border-b-1 border-b-white/30 py-2">
            {section.name}
          </div>
        )}
        <div>
          {section.tasks.map((task) => (
            <TaskRow key={task.id} task={task} />
          ))}
        </div>
        {section.nature !== 'overdue' && (
          <div>
            {isAddTaskOpen ? (
              <AddTaskCard
                currentSectionId={section.id}
                defaultDueDate={defaultDueDate ?? null}
                dismiss={() => setIsAddTaskOpen((prev) => !prev)}
              />
            ) : (
              <button
                type="button"
                onClick={() => setIsAddTaskOpen((prev) => !prev)}
                className="flex items-center gap-2 font-thin">
                <FaPlus className="text-primary" /> Add task
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

const TaskRow = ({ task }: { task: TaskType }) => {
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const { mutate: updateTask } = useMutation(
    trpc.task.update.mutationOptions({
      onSuccess: async () => {
        // await queryClient.invalidateQueries({
        //   queryKey: [trpc.task.today.queryKey()],
        // })
        await queryClient.invalidateQueries({
          queryKey: [trpc.collection.readAll.queryKey()],
        })
      },
    }),
  )

  const handleComplete = () => {
    console.log('handling complete')
    updateTask({ ...task, complete: true })
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
    <div key={task.id} className="border-b-1 border-b-white/30 py-2">
      <div>
        <div className="flex gap-2">
          <input
            type="checkbox"
            onClick={handleComplete}
            className="rounded-full bg-inherit"
          />
          <div onClick={handleTaskModal} className="flex flex-1 flex-col">
            <span className="text-sm">{task.text}</span>
            <span className="text-xs">{task.description}</span>
            <div className="mt-1 flex items-center gap-2 text-xs text-white/60">
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
              <div className="ml-auto">
                <SectionPicker
                  value={task.sectionId}
                  setValue={handleSectionChange}
                />
              </div>
            </div>
          </div>
        </div>

        {isTaskModalOpen && (
          <TaskModal task={task} dismiss={() => setIsTaskModalOpen(false)} />
        )}
      </div>
    </div>
  )
}

const AddTaskCard = ({
  currentSectionId,
  defaultDueDate,
  dismiss,
}: {
  currentSectionId: string
  defaultDueDate?: Date | null
  dismiss: () => void
}) => {
  const [text, setText] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState<Date | null>(defaultDueDate ?? null)
  const [priority, setPriority] = useState<PriorityOption | null>(null)
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
  const [sectionId, setSectionId] = useState<string | null>(null)
  const { mutate: createTask } = useMutation(
    trpc.task.create.mutationOptions({
      onSuccess: async () => {
        console.log('task created')
        dismiss()
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
        //   await queryClient.invalidateQueries({
        //     queryKey: trpc.collection.readOne.queryKey({
        //       id: selectedCollectionAndSection.collectionId,
        //     }),
        //   })
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
        <SectionPicker value={currentSectionId} setValue={setSectionId} />
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
