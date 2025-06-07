import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { FaChevronDown, FaChevronUp, FaTrash } from 'react-icons/fa'
import { FaEllipsis, FaX } from 'react-icons/fa6'
import type { FormEvent } from 'react'
import type { TaskType } from '@/integrations/trpc/types'
import { useTRPC } from '@/integrations/trpc/react'

export default function TaskModal({
  task,
  dismiss,
}: {
  task: TaskType
  dismiss: () => void
}) {
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
