import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import React, { useEffect, useRef, useState } from 'react'
import {
  FaAngleDown,
  FaChevronDown,
  FaInbox,
  FaPlus,
  FaRegCheckCircle,
  FaTrash,
} from 'react-icons/fa'
import { FaChevronUp, FaEllipsis, FaX } from 'react-icons/fa6'
import { RxSection } from 'react-icons/rx'
import TextareaAutosize from 'react-textarea-autosize'
import PopupMenu from './popupMenu'
import type { FormEvent } from 'react'
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
            currentCollectionId={collection.id}
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
  currentCollectionId,
}: {
  section: SectionDetailType
  currentCollectionId: string
}) => {
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false)

  return (
    <div className="bg-background flex gap-4">
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
            // <div
            //   key={task.id}
            //   className="flex items-center gap-2 rounded-lg border border-white/30 bg-white/5 p-2">
            //   <span className="text-sm">{task.text}</span>
            // </div>
          ))}
        </div>
        {section.nature !== 'overdue' && (
          <div>
            {isAddTaskOpen ? (
              <AddTaskCard
                currentCollectionId={currentCollectionId}
                currentSectionId={section.id}
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
        await queryClient.invalidateQueries({
          queryKey: [trpc.task.today.queryKey()],
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

  return (
    <div key={task.id} className="border-b-1 border-b-white/30 py-2">
      <div>
        <div className="flex gap-2">
          <input
            type="checkbox"
            onClick={handleComplete}
            className="rounded-full bg-inherit"
          />
          <button
            onClick={handleTaskModal}
            type="button"
            className="flex flex-col">
            <span className="text-xs">{task.text}</span>
            <span>{task.description}</span>
          </button>
        </div>

        {isTaskModalOpen && (
          <TaskModal task={task} dismiss={() => setIsTaskModalOpen(false)} />
        )}
      </div>
    </div>
  )
}

const AddTaskCard = ({
  currentCollectionId,
  currentSectionId,
  dismiss,
}: {
  currentCollectionId: string
  currentSectionId: string
  dismiss: () => void
}) => {
  const [text, setText] = useState('')
  const [description, setDescription] = useState('')
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
  const [selectedCollectionAndSection, setSelectedCollectionAndSection] =
    useState<CollectionAndSectionType | null>(null)
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
        if (selectedCollectionAndSection) {
          await queryClient.invalidateQueries({
            queryKey: trpc.collection.readOne.queryKey({
              id: selectedCollectionAndSection.collectionId,
            }),
          })
        }
        await queryClient.invalidateQueries({
          queryKey: trpc.collection.inbox.queryKey(),
        })
      },
    }),
  )

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    console.log('submitting')
    if (!selectedCollectionAndSection) {
      console.error('No collection and section selected')
      return
    }
    createTask({
      text,
      description,
      sectionId: selectedCollectionAndSection.sectionId,
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
      </div>
      <div className="flex justify-between gap-2 border border-x-0 border-b-0 border-t-white/30 p-2">
        <CollectionSectionPicker
          currentCollectionId={currentCollectionId}
          currentSectionId={currentSectionId}
          selectedCollectionAndSection={selectedCollectionAndSection}
          setSelectedCollectionAndSection={setSelectedCollectionAndSection}
        />
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

type CollectionAndSectionType = {
  label: React.ReactNode
  collectionId: string
  sectionId: string
}
const CollectionSectionPicker = ({
  currentCollectionId,
  currentSectionId,
  selectedCollectionAndSection,
  setSelectedCollectionAndSection,
}: {
  currentCollectionId: string
  currentSectionId: string
  selectedCollectionAndSection: CollectionAndSectionType | null
  setSelectedCollectionAndSection: React.Dispatch<
    React.SetStateAction<CollectionAndSectionType | null>
  >
}) => {
  const [inbox, setInbox] = useState<CollectionAndSectionType | null>(null)
  const trpc = useTRPC()
  const { data: collections } = useQuery(trpc.collection.readAll.queryOptions())
  useEffect(() => {
    console.log('collections', collections)
    const inboxCollection = collections?.find((c) => c.name === 'Inbox')
    if (!inboxCollection) {
      throw new Error('Inbox collection not found')
    }
    const uncategorizedSection = inboxCollection.sections.find(
      (s) => s.name === 'Uncategorized',
    )
    if (!uncategorizedSection) {
      throw new Error('Uncategorized section not found in Inbox collection')
    }
    setInbox({
      label: (
        <span className="flex items-center gap-2">
          <FaInbox /> Inbox
        </span>
      ),
      collectionId: inboxCollection.id,
      sectionId: uncategorizedSection.id,
    } as CollectionAndSectionType)
  }, [collections])
  useEffect(() => {
    console.log('attempting to default collection and section picker')
    const defaultCollection = collections?.find(
      (c) => c.id === currentCollectionId,
    )
    console.log(`default collection: ${defaultCollection?.name}`)
    if (defaultCollection && defaultCollection.name !== 'Inbox') {
      const uncategorizedSection = defaultCollection.sections.find(
        (s) => s.id === currentSectionId,
      )
      if (uncategorizedSection) {
        console.log(`defaulting to collection: ${defaultCollection.name}`)
        setSelectedCollectionAndSection({
          label: (
            <span className="flex items-center gap-2">
              # {defaultCollection.name} / <RxSection />{' '}
              {uncategorizedSection.name}
            </span>
          ),
          collectionId: defaultCollection.id,
          sectionId: uncategorizedSection.id,
        } as CollectionAndSectionType)
      } else {
        console.log(`unable to find current section: ${currentSectionId}`)
      }
    } else {
      console.log('defaulting to inbox')
      if (!inbox) {
        console.warn(
          'Inbox not found, defaulting to Inbox collection and Uncategorized section',
        )
        return
        // throw new Error('Uncategorized section not found in default collection')
      }
      setSelectedCollectionAndSection({
        label: inbox.label,
        collectionId: inbox.collectionId,
        sectionId: inbox.sectionId,
      })
    }
  }, [inbox, collections])

  return (
    <PopupMenu
      button={
        <button
          type="button"
          className="bg-accent1 flex items-center gap-2 rounded px-2 py-1 text-xs">
          {selectedCollectionAndSection?.label} <FaAngleDown />
        </button>
      }
      content={
        <div className="flex-col">
          <input type="search" className="rounded border" />
          {inbox && (
            <button
              type="button"
              onClick={() => setSelectedCollectionAndSection(inbox)}
              className="hover:bg-accent1/50 flex w-full items-center gap-2 rounded px-2 py-1 text-xs">
              {inbox.label}
            </button>
          )}
          <span>Collections</span>
          {collections
            ?.filter((c) => c.name !== 'Inbox')
            .map((collection) => (
              <div key={collection.id} className="flex flex-col gap-1 p-1">
                {collection.sections.map((section, i) => (
                  <div key={`${collection.id}-${i}`} className="w-full">
                    {section.name === 'Uncategorized' ? (
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedCollectionAndSection({
                            collectionId: collection.id,
                            sectionId: section.id,
                            label: `# ${collection.name}`,
                          })
                        }
                        className="hover:bg-accent1/50 flex w-full rounded px-2 py-1 text-xs">
                        # {collection.name}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedCollectionAndSection({
                            collectionId: collection.id,
                            sectionId: section.id,
                            label: (
                              <span className="flex items-center gap-2">
                                # {collection.name} / <RxSection />
                                {section.name}
                              </span>
                            ),
                          })
                        }
                        className="hover:bg-accent1/50 ml-2 flex w-full items-center gap-2 rounded px-2 py-1 text-xs">
                        <RxSection />
                        {section.name}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ))}
        </div>
      }></PopupMenu>
  )
}

const TaskModal = ({
  task,
  dismiss,
}: {
  task: TaskType
  dismiss: () => void
}) => {
  const [text, setText] = useState('')
  const [description, setDescription] = useState('')

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
      },
    }),
  )
  const { mutate: updateTask } = useMutation({
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: [
          trpc.task.today.queryKey(),
          trpc.collection.readAll.queryKey(),
          trpc.collection.readAll.queryKey(),
        ],
      })
    },
  })
  const handleSaveTask = (e: FormEvent) => {
    console.log('adding task')
    e.preventDefault()
    // updateTask({
    //   text,
    //   description,
    //   complete: false,
    // });
  }

  return (
    <div className="absolute inset-0 z-[1000] flex h-screen w-screen items-center justify-center">
      {/* backdrop */}
      <div
        onClick={dismiss}
        className="absolute inset-0 z-[1000] h-screen w-screen bg-black/50"></div>

      {/* modal content */}
      <div className="z-[1001] mx-5 flex h-4/5 w-full flex-col rounded-xl bg-stone-900">
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
            <span>
              <FaEllipsis />
            </span>
            <span
              className="cursor-pointer rounded-full bg-red-500 p-1 text-white"
              onClick={() => deleteTask({ id: task.id })}>
              <FaTrash />
            </span>
            <span>
              <FaX />
            </span>
          </div>
        </div>

        {/* main content */}
        <div className="grid h-full grid-cols-3 border-t">
          {/* main */}
          <div className="col-span-2 p-2">
            <form onSubmit={handleSaveTask}>
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Task..."
              />
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description..."
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={dismiss}
                  className="rounded border border-white px-4 py-2">
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded bg-orange-400 px-4 py-2">
                  Save
                </button>
              </div>
            </form>
          </div>
          {/* aside */}
          <aside className="rounded-br-xl bg-stone-800 p-2">Side</aside>
        </div>
      </div>
    </div>
  )
}
