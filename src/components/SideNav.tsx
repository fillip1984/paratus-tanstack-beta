import { useDragAndDrop } from '@formkit/drag-and-drop/react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { FaSearch } from 'react-icons/fa'
import {
  FaCalendarDay,
  FaCalendarWeek,
  FaInbox,
  FaPlus,
  FaX,
} from 'react-icons/fa6'
import { useTRPC } from '@/integrations/trpc/react'
import type { CollectionSummaryType } from '@/integrations/trpc/types'
import Modal from './ui/modal'

export default function SideNav() {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const { data: collections } = useQuery(trpc.collection.readAll.queryOptions())
  const { data: inbox } = useQuery(trpc.collection.inbox.queryOptions())
  const { data: today } = useQuery(trpc.task.today.queryOptions())

  const navItems = [
    {
      to: '/search',
      label: 'Search',
      icon: FaSearch,
    },
    {
      to: '/inbox',
      label: 'Inbox',
      icon: FaInbox,
      count: (
        <span className="ml-auto text-xs text-gray-300">
          {inbox?.taskCount && inbox.taskCount > 0 ? inbox.taskCount : ''}
        </span>
      ),
    },
    {
      to: '/today',
      label: 'Today',
      icon: FaCalendarDay,
      count: (
        <span className="ml-auto text-xs text-gray-300">
          {today?.length && today.length > 0 ? today.length : ''}
        </span>
      ),
    },
    { to: '/upcoming', label: 'Upcoming', icon: FaCalendarWeek },
  ]
  const [isAddCollectionOpen, setIsAddCollectionOpen] = useState(false)

  const [parentRef, draggableCollections, setValues] = useDragAndDrop<
    HTMLDivElement,
    CollectionSummaryType
  >([], {
    onDragend: (data) => {
      console.log('dragend', data)
      reorderCollections(
        data.values.map((collection, index) => ({
          id: (collection as CollectionSummaryType).id,
          position: index + 1,
        })),
      )
    },
  })
  useEffect(() => {
    if (collections) {
      setValues(
        collections.filter(
          (c) => c.name !== 'Inbox',
        ) as Array<CollectionSummaryType>,
      )
    }
  }, [collections, setValues])
  const { mutate: reorderCollections } = useMutation(
    trpc.collection.reorder.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: trpc.collection.readAll.queryKey(),
        })
      },
    }),
  )

  return (
    <>
      <nav className="bg-foreground m-2 flex min-w-[250px] flex-col gap-1 rounded-xl py-2 transition duration-150">
        {navItems.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={`[&.active]:text-primary [&.active]:bg-background hover:bg-background/60 mx-2 flex items-center rounded-xl p-2 transition duration-200 select-none`}
          >
            <item.icon className="mr-2" />
            {item.label}
            {item.count}
          </Link>
        ))}

        <div className="flex items-center justify-between px-2">
          <h4>Collections</h4>
          <button
            onClick={() => setIsAddCollectionOpen(true)}
            className="text-primary"
          >
            <FaPlus />
          </button>
        </div>
        <div ref={parentRef} className="flex flex-col gap-1 px-3 text-sm">
          {draggableCollections.map((collection) => (
            <Link
              to="/collections/$collectionId"
              params={{ collectionId: collection.id }}
              key={collection.id}
              data-label={collection.id}
              className={`[&.active]:text-primary [&.active]:bg-background hover:bg-background/60 mx-2 flex items-center justify-between rounded-xl p-2 transition duration-200 select-none`}
            >
              <span># {collection.name}</span>
              <span className="text-xs text-gray-300">
                {collection.taskCount > 0 && collection.taskCount}
              </span>
            </Link>
          ))}
        </div>
      </nav>

      <AddCollectionModal
        isOpen={isAddCollectionOpen}
        close={() => setIsAddCollectionOpen(false)}
      />
    </>
  )
}

const AddCollectionModal = ({
  isOpen,
  close,
}: {
  isOpen: boolean
  close: () => void
}) => {
  const [name, setName] = useState('')
  const [isValid, setIsValid] = useState(false)
  useEffect(() => {
    setIsValid(name.trim() !== '')
  }, [name])

  const navigate = useNavigate()
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const { mutate: createCollection } = useMutation(
    trpc.collection.create.mutationOptions({
      onSuccess: async (data) => {
        await queryClient.invalidateQueries({
          queryKey: trpc.collection.readAll.queryKey(),
        })
        close()
        setName('')
        navigate({
          to: '/collections/$collectionId',
          params: { collectionId: data.id },
        })
      },
    }),
  )
  const handleCreateCollection = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim() === '') {
      return
    }
    createCollection({ name })
  }

  return (
    <Modal isOpen={isOpen} close={close}>
      <form
        onSubmit={handleCreateCollection}
        className="bg-foreground flex h-full w-full flex-col rounded-lg text-white"
      >
        <div className="flex items-center justify-between border-b border-b-white/30 px-4 py-1">
          <h4>Add collection</h4>
          <button type="button" onClick={close} className="text-primary">
            <FaX />
          </button>
        </div>
        <div className="flex flex-1 flex-col gap-2 p-2">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name..."
            className="rounded border p-2"
          />
        </div>
        <div className="ml-auto flex gap-2 p-2">
          <button type="button" onClick={close} className="button-secondary">
            Cancel
          </button>
          <button type="submit" disabled={!isValid} className="button-primary">
            Add
          </button>
        </div>
      </form>
    </Modal>
  )
}
