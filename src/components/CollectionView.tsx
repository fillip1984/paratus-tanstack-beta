import { useMutation, useQueryClient } from '@tanstack/react-query'
import { startOfDay } from 'date-fns'
import { useEffect, useRef, useState } from 'react'
import { FaChevronDown, FaPlus, FaRegCheckCircle } from 'react-icons/fa'

import { RxDragHandleDots2, RxSection } from 'react-icons/rx'
import TextareaAutosize from 'react-textarea-autosize'
import { useDragAndDrop } from '@formkit/drag-and-drop/react'
import { useAutoAnimate } from '@formkit/auto-animate/react'
import SectionPicker from './shared/SectionPicker'
import DatePicker from './shared/DatePicker'
import PriorityPicker from './shared/PriorityPicker'
import TaskModal from './shared/TaskModal'
import Modal from './ui/modal'
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
  const { mutate: reorderSections } = useMutation(
    trpc.section.reoder.mutationOptions({
      onSuccess: async () => {
        console.log('sections reordered')
        await queryClient.invalidateQueries({
          queryKey: trpc.collection.readAll.queryKey(),
        })
        await queryClient.invalidateQueries({
          queryKey: trpc.collection.readOne.queryKey({
            id: collection.id,
          }),
        })
        await queryClient.invalidateQueries({
          queryKey: trpc.task.today.queryKey(),
        })
        await queryClient.invalidateQueries({
          queryKey: trpc.collection.inbox.queryKey(),
        })
      },
    }),
  )

  const [parentRef, draggableSections, setValues] = useDragAndDrop<
    HTMLDivElement,
    SectionDetailType
  >([], {
    dragHandle: '.drag-handle',
    group: 'collection',
    onDragend: (data) => {
      reorderSections(
        data.values.map((section, index) => ({
          id: (section as SectionDetailType).id,
          position: index,
        })),
      )
    },
  })
  useEffect(() => {
    if (collection.sections) {
      setValues(collection.sections)
    }
  }, [collection])

  return (
    <div className="container">
      <div className="mx-6 my-10">
        <h2>{collection.name}</h2>
        <span className="flex items-center gap-2 text-sm font-thin">
          <FaRegCheckCircle />
          {collection.sections?.map((s) => s.tasks).flat(1).length} tasks
        </span>
      </div>

      <div
        ref={parentRef}
        data-label={collection.id}
        className="flex flex-col gap-6">
        {draggableSections.map((section) => (
          <Section
            key={section.id}
            data-label={section.id}
            currentCollectionId={collection.id}
            section={section}
            defaultDueDate={
              collection.name === 'Today' ? startOfDay(new Date()) : null
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
  currentCollectionId,
  section,
  defaultDueDate,
}: {
  currentCollectionId: string
  section: SectionDetailType
  defaultDueDate?: Date | null
}) => {
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  // const sectionRef = useRef<HTMLDivElement>(null)
  const [parent, enableAnimations] = useAutoAnimate()
  useEffect(() => {
    enableAnimations(!isCollapsed)
  }, [isCollapsed])
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const { mutate: reorderTasks } = useMutation(
    trpc.task.reoder.mutationOptions({
      onSuccess: async () => {
        console.log('tasks reordered')
        await queryClient.invalidateQueries({
          queryKey: trpc.collection.readAll.queryKey(),
        })
        await queryClient.invalidateQueries({
          queryKey: trpc.collection.readOne.queryKey({
            id: currentCollectionId,
          }),
        })
        await queryClient.invalidateQueries({
          queryKey: trpc.task.today.queryKey(),
        })
        await queryClient.invalidateQueries({
          queryKey: trpc.collection.inbox.queryKey(),
        })
      },
    }),
  )
  const [parentRef, draggableTasks, setValues] = useDragAndDrop<
    HTMLDivElement,
    TaskType
  >([], {
    dragHandle: '.drag-handle',
    group: 'section',
    onDragend: (data) => {
      const sectionId = data.parent.el.dataset['label']
      if (!sectionId) {
        console.error('No sectionId found for reorder')
        return
      }
      reorderTasks(
        data.values.map((task, index) => ({
          id: (task as TaskType).id,
          position: index,
          sectionId: sectionId,
        })),
      )
    },
  })
  useEffect(() => {
    setValues(section.tasks)
  }, [section])

  return (
    <div ref={parent} className="flex items-start gap-4">
      {section.name !== 'Overdue' && section.name !== 'Uncategorized' && (
        <RxDragHandleDots2 className="drag-handle" />
      )}
      {section.tasks.length > 0 && (
        <button type="button" onClick={() => setIsCollapsed((prev) => !prev)}>
          <FaChevronDown
            className={`${isCollapsed ? '-rotate-90' : ''} transition`}
          />
        </button>
      )}
      <div className="flex flex-1 flex-col gap-2">
        {section.name !== 'Uncategorized' && (
          <div className="flex items-center gap-2 border-b-1 border-b-white/30 py-2">
            {section.name}
            {section._count.tasks > 0 && (
              <span className="text-xs text-gray-300">
                {section._count.tasks}
              </span>
            )}
          </div>
        )}
        {!isCollapsed && (
          <div>
            <div ref={parentRef} data-label={section.id} className="min-h-4">
              {draggableTasks.map((task) => (
                <TaskRow
                  key={task.id}
                  data-label={task.id}
                  task={task}
                  collectionId={currentCollectionId}
                />
              ))}
            </div>
            {section.name !== 'Overdue' && (
              <div>
                {isAddTaskOpen ? (
                  <AddTaskCard
                    currentCollectionId={currentCollectionId}
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
        )}
      </div>
    </div>
  )
}

const TaskRow = ({
  task,
  collectionId,
}: {
  task: TaskType
  collectionId: string
}) => {
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
    <>
      <div className="hover:bg-foreground/40 cursor-pointer border-b-1 border-b-white/30 py-2">
        <div>
          <div className="flex gap-2">
            <RxDragHandleDots2 className="drag-handle" />
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
        </div>
      </div>
      <Modal isOpen={isTaskModalOpen} close={() => setIsTaskModalOpen(false)}>
        <TaskModal
          task={task}
          dismiss={() => setIsTaskModalOpen(false)}
          collectionId={collectionId}
        />
      </Modal>
    </>
  )
}

const AddTaskCard = ({
  currentCollectionId,
  currentSectionId,
  defaultDueDate,
  dismiss,
}: {
  currentCollectionId: string
  currentSectionId: string
  defaultDueDate?: Date | null
  dismiss: () => void
}) => {
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
