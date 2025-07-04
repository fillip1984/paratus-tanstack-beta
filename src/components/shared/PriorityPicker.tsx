import { PriorityOption } from '@prisma/client'
import { useEffect, useState } from 'react'
import { FaFlag, FaRegFlag } from 'react-icons/fa'
import PopupMenu from '../ui/popupMenu'

type PriorityType = {
  label: string
  shortLabel: string | null
  value: PriorityOption | null
  icon: React.ReactNode
}
const priorities = [
  {
    label: 'Urgent & important',
    shortLabel: 'U&I',
    value: PriorityOption.URGENT_AND_IMPORTANT,
    icon: <FaFlag className="text-danger flex-shrink-0" />,
  },
  {
    label: 'Urgent',
    shortLabel: 'U',
    value: PriorityOption.URGENT,
    icon: <FaFlag className="text-warning flex-shrink-0" />,
  },
  {
    label: 'Important',
    shortLabel: 'I',
    value: PriorityOption.IMPORTANT,
    icon: <FaRegFlag className="text-success flex-shrink-0" />,
  },
  {
    label: 'No priority',
    shortLabel: '',
    value: null,
    icon: <FaRegFlag className="flex-shrink-0" />,
  },
]

export default function PriorityPicker({
  value,
  setValue,
}: {
  value: PriorityOption | null
  setValue: (value: PriorityOption | null) => void
}) {
  const [priorityPickerValue, setPriorityPickerValue] =
    useState<PriorityType | null>(
      value ? (priorities.find((p) => p.value === value) ?? null) : null,
    )

  useEffect(() => {
    if (value && priorityPickerValue?.value !== value) {
      const foundPriority = priorities.find((p) => p.value === value)
      setPriorityPickerValue(foundPriority ?? null)
    }
  }, [value, priorityPickerValue?.value])

  const handleUpdate = (newValue: PriorityType) => {
    setPriorityPickerValue(newValue)
    setValue(newValue.value)
  }

  return (
    <PopupMenu
      button={
        <button
          type="button"
          className="flex items-center gap-2 rounded border border-white/30 px-2 py-1 text-sm text-white/60"
        >
          {priorityPickerValue?.value ? (
            <span className="flex items-center gap-2 text-xs">
              {priorityPickerValue.icon} {priorityPickerValue.shortLabel}
              <span
                onClick={() => {
                  setPriorityPickerValue(null)
                  setValue(null)
                }}
                className="text-danger ml-1 text-sm"
              >
                X
              </span>
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <FaRegFlag /> Priority
            </span>
          )}
        </button>
      }
      content={
        <div className="flex w-[185px] flex-col gap-1 p-1">
          {priorities.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => handleUpdate(p)}
              className="hover:bg-accent1/50 flex items-center gap-2 rounded p-2 text-xs"
            >
              {p.icon} {p.label}
            </button>
          ))}
        </div>
      }
    />
  )
}
