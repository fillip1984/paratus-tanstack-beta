import {
  endOfWeek,
  format,
  formatRelative,
  isEqual,
  isSaturday,
  nextMonday,
  nextSaturday,
  startOfDay,
  startOfTomorrow,
} from 'date-fns'
import { useEffect, useState } from 'react'
import { FaCalendarAlt, FaCalendarDay, FaSun } from 'react-icons/fa'
import { CgCalendarNext } from 'react-icons/cg'
import { MdOutlineWeekend } from 'react-icons/md'
import PopupMenu from '../ui/popupMenu'
import { capitalizeFirstLetter } from '@/utils/String'

type DateType = {
  label: string
  value: Date | null
  icon: React.ReactNode
}
const quickDateOptions = [
  {
    label: 'Today',
    value: startOfDay(new Date()),
    icon: <FaCalendarDay className="text-success flex-shrink-0" />,
  },
  {
    label: 'Tomorrow',
    value: startOfTomorrow(),
    icon: <FaSun className="text-warning flex-shrink-0" />,
  },
  {
    label: 'This weekend',
    value: startOfDay(endOfWeek(new Date())),
    icon: <MdOutlineWeekend className="text-accent1 flex-shrink-0" />,
  },
  {
    label: 'Next week',
    value: startOfDay(nextMonday(new Date())),
    icon: <CgCalendarNext className="text-accent1 flex-shrink-0" />,
  },
  {
    label: 'Next weekend',
    value: startOfDay(nextSaturday(new Date())),
    icon: <MdOutlineWeekend className="text-accent1 flex-shrink-0" />,
  },
]

export default function DatePicker({
  value,
  setValue,
}: {
  value: Date | null
  setValue: (value: Date | null) => void
}) {
  const [datePickerValue, setDatePickerValue] = useState<DateType | null>(
    value
      ? (quickDateOptions.find((d) => isEqual(d.value, value)) ?? {
          label: format(value, 'MMM/dd/yyyy'),
          value,
          icon: <FaCalendarAlt />,
        })
      : null,
  )
  useEffect(() => {
    if (
      datePickerValue &&
      datePickerValue.value?.getTime() !== value?.getTime()
    ) {
      // console.log(
      //   "only update dueDate if there's a change in the value and not initialization",
      // )
      setValue(datePickerValue.value)
    }
  }, [datePickerValue])

  return (
    <div className="flex gap-2">
      <PopupMenu
        button={
          <button
            type="button"
            className="flex items-center gap-2 rounded border border-white/30 px-2 py-1 text-sm text-white/60">
            {datePickerValue && datePickerValue.value ? (
              <span className="flex items-center gap-2">
                {datePickerValue.icon}
                {/* See why the split('at')...: https://github.com/date-fns/date-fns/issues/1218 */}
                {capitalizeFirstLetter(
                  formatRelative(datePickerValue.value, new Date()).split(
                    'at',
                  )[0],
                )}
                <span
                  onClick={() => {
                    setDatePickerValue(null)
                    setValue(null)
                  }}
                  className="text-danger ml-2 text-sm">
                  X
                </span>
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <FaCalendarDay />
                Date
              </span>
            )}
          </button>
        }
        content={
          <div className="m-2 flex flex-col gap-1">
            <input type="text" placeholder="Type a date..." />
            <div className="flex flex-col">
              {quickDateOptions
                .filter((d) =>
                  isSaturday(new Date())
                    ? d.label !== 'This weekend'
                    : d.label !== 'Next weekend',
                )
                .map((d) => (
                  <button
                    key={d.value.toString()}
                    type="button"
                    onClick={() => setDatePickerValue(d)}
                    className="hover:bg-accent1/50 flex items-center gap-2 rounded p-1 text-xs">
                    {d.icon} {d.label}
                    <span className="ml-auto">
                      {d.label === 'Today' ||
                      d.label === 'Tomorrow' ||
                      d.label === 'This weekend'
                        ? format(d.value, 'E')
                        : format(d.value, 'E MMM d')}
                    </span>
                  </button>
                ))}
            </div>
          </div>
        }
      />
    </div>
  )
}
