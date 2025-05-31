import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'
import { FaChevronDown, FaPlus, FaRegCheckCircle } from 'react-icons/fa'
import TextareaAutosize from 'react-textarea-autosize'
import { useMutation, useQuery } from '@tanstack/react-query'
import type { FormEvent } from 'react'
import { useTRPC } from '@/integrations/trpc/react'

export const Route = createFileRoute('/today')({
  component: RouteComponent,
  // loader: async ({ context }) => {
  //   await context.queryClient.fetchQuery(
  //     context.trpc.task.readAll.queryOptions(),
  //   )
  // },
})

function RouteComponent() {
  const trpc = useTRPC()
  const { data: tasks } = useQuery(trpc.task.readAll.queryOptions())
  const { mutate: createTask } = useMutation(trpc.task.create.mutationOptions())
  return (
    <div className="flex flex-1 flex-col overflow-x-auto p-2 pb-24">
      <div className="mx-6 my-10">
        <h2>Today</h2>
        <span className="flex items-center gap-2 text-sm font-thin">
          <FaRegCheckCircle />
          {tasks?.length ?? 0} tasks
        </span>
      </div>

      <button
        onClick={() =>
          createTask({ name: 'test', position: 0, description: 'test' })
        }>
        Create task
      </button>

      {/* {tasks.} */}
      <Section />
      <Section />
      <Section />
    </div>
  )
}

const Section = () => {
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false)

  return (
    <div className="flex items-center gap-4">
      <FaChevronDown />
      <div className="flex flex-1 flex-col gap-2">
        <div className="flex items-center gap-2 border-b-1 border-b-white/30 py-2">
          Overdue
        </div>
        {isAddTaskOpen ? (
          <AddTaskCard dismiss={() => setIsAddTaskOpen((prev) => !prev)} />
        ) : (
          <button
            type="button"
            onClick={() => setIsAddTaskOpen((prev) => !prev)}
            className="flex items-center gap-2 font-thin">
            <FaPlus className="text-primary" /> Add task
          </button>
        )}
      </div>
    </div>
  )
}

const AddTaskCard = ({ dismiss }: { dismiss: () => void }) => {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isFormValid, setIsFormValid] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)
  useEffect(() => {
    if (name.trim()) {
      setIsFormValid(true)
    } else {
      setIsFormValid(false)
    }
  }, [name])

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    console.log('submitting')
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col rounded-xl border border-white/30 bg-white/5"
      ref={formRef}>
      <div className="flex flex-col p-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Task name"
          required
        />
        <TextareaAutosize
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description"
          className="text-xs"></TextareaAutosize>
      </div>
      <div className="flex justify-end gap-2 border border-x-0 border-b-0 border-t-white/30 p-2">
        <button
          onClick={dismiss}
          className="border-secondary text-secondary rounded border px-2 py-1 opacity-80 hover:opacity-100">
          Cancel
        </button>
        <button
          disabled={!isFormValid}
          className="bg-primary rounded px-2 py-1">
          Add
        </button>
      </div>
    </form>
  )
}
