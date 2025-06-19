import { useMutation, useQueryClient } from '@tanstack/react-query'
import { startOfDay } from 'date-fns'
import { useEffect, useState } from 'react'
import { FaChevronDown, FaPlus, FaRegCheckCircle } from 'react-icons/fa'

import { useAutoAnimate } from '@formkit/auto-animate/react'
import { useDragAndDrop } from '@formkit/drag-and-drop/react'
import { RxDragHandleDots2, RxSection } from 'react-icons/rx'
import AddTaskCard from './shared/AddTaskCard'
import TaskListRow from './shared/TaskListRow'
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
    <div className="container-centered">
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
  const [parent, enableAnimations] = useAutoAnimate()
  useEffect(() => {
    enableAnimations(!isCollapsed)
  }, [isCollapsed])

  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const { mutate: reorderTasks } = useMutation(
    trpc.task.reorder.mutationOptions({
      onSuccess: async () => {
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
    // console.log('setting values for section', section.id)
    setValues(section.tasks.filter((t) => !t.parentId))
  }, [section])

  return (
    <div>
      {/* heading */}
      <div className="flex items-center gap-2 border-b-1 border-b-white/30 py-2">
        {section.name !== 'Overdue' && section.name !== 'Uncategorized' ? (
          <RxDragHandleDots2 className="drag-handle" />
        ) : (
          <div className="w-4"></div>
        )}
        {
          <button type="button" onClick={() => setIsCollapsed((prev) => !prev)}>
            <FaChevronDown
              className={`${isCollapsed ? '-rotate-90' : ''} transition`}
            />
          </button>
        }

        <div
          className={`flex items-center gap-2 ${section.name === 'Uncategorized' ? 'text-gray-500' : section.name === 'Overdue' ? 'text-red-500' : ''} : ''}`}>
          {section.name}
          {section._count.tasks > 0 && (
            <span className="text-xs text-gray-300">
              {section._count.tasks}
            </span>
          )}
        </div>
      </div>
      {/* list */}
      <div ref={parent} className="ml-2 flex flex-1 flex-col gap-2">
        {!isCollapsed && (
          <>
            <div ref={parentRef} data-label={section.id} className="min-h-4">
              {draggableTasks.map((task) => (
                <TaskListRow
                  key={task.id}
                  data-label={task.id}
                  task={task}
                  collectionId={currentCollectionId}
                />
              ))}
            </div>
            {section.name !== 'Overdue' && (
              <div className="mt-2 ml-4">
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
                    className="flex items-center gap-2 rounded p-1 font-thin hover:bg-white/10">
                    <FaPlus className="text-primary" /> Add task
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
