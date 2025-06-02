import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { use, useEffect, useState } from 'react'
import { FaSearch } from 'react-icons/fa'
import {
  FaCalendarDay,
  FaCalendarWeek,
  FaInbox,
  FaPlus,
  FaX,
} from 'react-icons/fa6'
import Modal from './modal'
import { useTRPC } from '@/integrations/trpc/react'

export default function SideNav() {
  const navItems = [
    { to: '/search', label: 'Search', icon: FaSearch },
    { to: '/inbox', label: 'Inbox', icon: FaInbox },
    { to: '/today', label: 'Today', icon: FaCalendarDay },
    { to: '/upcoming', label: 'Upcoming', icon: FaCalendarWeek },
  ]
  const [isAddCollectionOpen, setIsAddCollectionOpen] = useState(false)

  const trpc = useTRPC()
  const { data: collections } = useQuery(trpc.collection.readAll.queryOptions())

  return (
    <>
      <nav className="bg-foreground m-2 flex min-w-[250px] flex-col gap-1 rounded-xl py-2 transition duration-150">
        {navItems.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={`[&.active]:text-primary [&.active]:bg-background hover:bg-background/60 mx-2 flex items-center rounded-xl p-2 transition duration-200`}>
            <item.icon className="mr-2" />
            {item.label}
          </Link>
        ))}

        <div className="flex items-center justify-between px-2">
          <h4>Collections</h4>
          <button
            onClick={() => setIsAddCollectionOpen(true)}
            className="text-primary">
            <FaPlus />
          </button>
        </div>
        <div className="flex flex-col gap-1 px-3 text-sm">
          {collections
            ?.filter((c) => c.name !== 'Inbox')
            .map((collection) => (
              <Link
                key={collection.id}
                to="/collections/$collectionId"
                params={{ collectionId: collection.id }}
                className="hover:bg-background flex items-center justify-between rounded-xl px-2 py-1">
                <span># {collection.name}</span>
                {collection._taskCount ?? 0}
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

  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const { mutate: createCollection } = useMutation(
    trpc.collection.create.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: trpc.collection.readAll.queryKey(),
        })
        close()
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
        className="bg-foreground flex h-full w-full flex-col rounded-lg text-white">
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
