import { useMutation, useQueryClient } from '@tanstack/react-query'
import { startOfDay } from 'date-fns'
import { useEffect, useRef, useState } from 'react'
import {
  FaChevronDown,
  FaPlus,
  FaRegCheckCircle,
  FaTrash,
} from 'react-icons/fa'

import { useAutoAnimate } from '@formkit/auto-animate/react'
import { useDragAndDrop } from '@formkit/drag-and-drop/react'
import { RxDragHandleDots2, RxSection } from 'react-icons/rx'
import { FaEllipsis } from 'react-icons/fa6'
import { useNavigate } from '@tanstack/react-router'
import AddTaskCard from './shared/AddTaskCard'
import TaskListRow from './shared/TaskListRow'
import PopupMenu from './ui/popupMenu'
import Modal from './ui/modal'
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
  const trpc = useTRPC()
  const queryClient = useQueryClient()

  const [isAddSectionOpen, setIsAddSectionOpen] = useState(false)
  const [sectionName, setSectionName] = useState('')
  const addSectionRef = useRef<HTMLInputElement | null>(null)
  const { mutate: createSection } = useMutation(
    trpc.section.create.mutationOptions({
      onSuccess: async () => {
        console.log('section created')
        setIsAddSectionOpen(false)
        setSectionName('')
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
  useEffect(() => {
    if (isAddSectionOpen) {
      addSectionRef.current?.focus()
    }
  }, [isAddSectionOpen])

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

  const [isEditingCollection, setIsEditingCollection] = useState(false)
  const currentCollectionNameRef = useRef<HTMLInputElement | null>(null)
  const [currentCollectionName, setCurrentCollectionName] = useState('')
  const { mutate: updateCollectionName } = useMutation(
    trpc.collection.update.mutationOptions({
      onSuccess: async () => {
        console.log('Collection updated')
        setIsEditingCollection(false)
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
  useEffect(() => {
    if (collection.name) {
      setCurrentCollectionName(collection.name)
    }
  }, [collection])
  useEffect(() => {
    if (isEditingCollection) {
      currentCollectionNameRef.current?.focus()
    }
  }, [isEditingCollection])

  const [
    isDeleteCollectionConfirmationOpen,
    setIsDeleteCollectionConfirmationOpen,
  ] = useState(false)
  const navigate = useNavigate()
  const { mutate: deleteCollection } = useMutation(
    trpc.collection.delete.mutationOptions({
      onSuccess: async () => {
        console.log('Collection deleted')
        setIsDeleteCollectionConfirmationOpen(false)
        navigate({
          to: '/today',
        })
        await queryClient.invalidateQueries({
          queryKey: trpc.collection.readAll.queryKey(),
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

  return (
    <>
      <div className="container-centered">
        <div className="mx-6 my-10 flex items-center justify-between">
          <div className="flex flex-col">
            {!isEditingCollection ? (
              <h2
                onClick={() => {
                  if (
                    currentCollectionName !== 'Inbox' &&
                    currentCollectionName !== 'Today' &&
                    currentCollectionName !== 'Upcoming'
                  ) {
                    setIsEditingCollection((prev) => !prev)
                  }
                }}>
                {collection.name}
              </h2>
            ) : (
              <input
                type="text"
                ref={currentCollectionNameRef}
                value={currentCollectionName}
                onChange={(e) => setCurrentCollectionName(e.target.value)}
                onBlur={() =>
                  updateCollectionName({
                    ...collection,
                    name: currentCollectionName,
                  })
                }
                className="rounded border p-1"
              />
            )}
            <span className="flex items-center gap-2 text-sm font-thin">
              <FaRegCheckCircle />
              {collection.sections?.map((s) => s.tasks).flat(1).length} tasks
            </span>
          </div>
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
                  onClick={() =>
                    setIsDeleteCollectionConfirmationOpen((prev) => !prev)
                  }>
                  <FaTrash className="text-danger flex-shrink-0" /> Delete
                </span>
              </div>
            }
          />
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
              ref={addSectionRef}
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

      <Modal
        isOpen={isDeleteCollectionConfirmationOpen}
        close={() => setIsDeleteCollectionConfirmationOpen(false)}>
        <div className="bg-foreground rounded-xl p-2">
          <h3 className="text-danger">Are you sure?</h3>
          <p>
            Deleting this collection will also delete all of the associated
            tasks and outcomes
          </p>
          <div className="mt-4 flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => deleteCollection({ id: collection.id })}
              className="button-primary bg-danger">
              Delete
            </button>
            <button
              type="button"
              onClick={() => setIsDeleteCollectionConfirmationOpen(false)}
              className="button-secondary">
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </>
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

  const [isEditingSection, setIsEditingSection] = useState(false)
  const currentSectionNameRef = useRef<HTMLInputElement | null>(null)
  const [currentSectionName, setCurrentSectionName] = useState(section.name)
  const { mutate: updateSectionName } = useMutation(
    trpc.section.update.mutationOptions({
      onSuccess: async () => {
        console.log('section updated')
        setIsEditingSection(false)
        await queryClient.invalidateQueries({
          queryKey: trpc.collection.readAll.queryKey(),
        })
        await queryClient.invalidateQueries({
          queryKey: trpc.collection.readOne.queryKey({
            id: currentCollectionId,
          }),
        })
      },
    }),
  )
  useEffect(() => {
    if (isEditingSection) {
      currentSectionNameRef.current?.focus()
    }
  }, [isEditingSection])

  const [isDeleteSectionConfirmationOpen, setIsDeleteSectionConfirmationOpen] =
    useState(false)
  const { mutate: deleteSection } = useMutation(
    trpc.section.delete.mutationOptions({
      onSuccess: async () => {
        console.log('Section deleted')
        setIsDeleteSectionConfirmationOpen(false)
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
        <div className="flex-1">
          {!isEditingSection ? (
            <div
              className={`flex items-center gap-2 ${section.name === 'Uncategorized' ? 'text-gray-500' : section.name === 'Overdue' ? 'text-red-500' : ''} : ''}`}>
              <span
                onClick={() => {
                  if (currentSectionName !== 'Uncategorized') {
                    setIsEditingSection((prev) => !prev)
                  }
                }}>
                {currentSectionName}
              </span>
              {section._count.tasks > 0 && (
                <span className="text-xs text-gray-300">
                  {section._count.tasks}
                </span>
              )}
            </div>
          ) : (
            <div>
              <input
                type="text"
                ref={currentSectionNameRef}
                value={currentSectionName}
                onChange={(e) => setCurrentSectionName(e.target.value)}
                onBlur={() =>
                  updateSectionName({
                    id: section.id,
                    name: currentSectionName,
                  })
                }
                className="rounded border p-1"
              />
            </div>
          )}
        </div>
        {section.name !== 'Uncategorized' && section.name !== 'Overdue' && (
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
                  onClick={() =>
                    setIsDeleteSectionConfirmationOpen((prev) => !prev)
                  }>
                  <FaTrash className="text-danger flex-shrink-0" /> Delete
                </span>
              </div>
            }
          />
        )}
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

      <Modal
        isOpen={isDeleteSectionConfirmationOpen}
        close={() => setIsDeleteSectionConfirmationOpen(false)}>
        <div className="bg-foreground rounded-xl p-2">
          <h3 className="text-danger">Are you sure?</h3>
          <p>
            Deleting this section will also delete all of the associated tasks
            and outcomes
          </p>
          <div className="mt-4 flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => deleteSection({ id: section.id })}
              className="button-primary bg-danger">
              Delete
            </button>
            <button
              type="button"
              onClick={() => setIsDeleteSectionConfirmationOpen(false)}
              className="button-secondary">
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
