import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { FaAngleDown, FaInbox } from 'react-icons/fa'
import { RxSection } from 'react-icons/rx'
import PopupMenu from '../ui/popupMenu'
import { useTRPC } from '@/integrations/trpc/react'

type SectionPickerType = {
  label: React.ReactNode
  value: string
}

export default function SectionPicker({
  value,
  setValue,
}: {
  value: string | null
  setValue: (sectionId: string) => void
}) {
  const [sectionPickerValue, setSectionPickerValue] =
    useState<SectionPickerType | null>(null)
  const trpc = useTRPC()
  const { data: collections } = useQuery(trpc.collection.readAll.queryOptions())
  const [inbox, setInbox] = useState<SectionPickerType | null>(null)
  useEffect(() => {
    // initialization inbox
    if (!collections) return
    if (!inbox) {
      // console.log('CollectionSectionPicker: setting inbox')
      const inboxCollection = collections.find((c) => c.name === 'Inbox')
      // console.log('inboxCollection found', inboxCollection)
      if (inboxCollection) {
        const uncategorizedSection = inboxCollection.sections.find(
          (s) => s.name === 'Uncategorized',
        )
        // console.log('uncategorizedSection found', uncategorizedSection)
        if (uncategorizedSection) {
          setInbox({
            label: (
              <span className="flex items-center gap-2">
                <FaInbox /> Inbox
              </span>
            ),
            value: uncategorizedSection.id,
          })
        }
      }
    }
  }, [collections])
  useEffect(() => {
    // wait for collections and inbox to be fetched and set
    if (!collections || !inbox) return

    // console.log('initialization and default picker', value)
    if (!value || value === 'today') {
      console.log(
        'no suitable suggested section given, default to inbox. Given suggested value:',
        value,
      )
      setSectionPickerValue(inbox)
      return
    }

    let collection: any
    let section: any
    collections.forEach((c) => {
      const result = c.sections.find((s) => s.id === value)
      if (result) {
        collection = c
        section = result
        return false
      }
    })
    if (!collection || !section) {
      console.error(
        "Couldn't find section so can't default section picker. This shouldn't happen!",
      )
      return
    }

    if (collection.name === 'Inbox') {
      setSectionPickerValue(inbox)
      return
    }

    setSectionPickerValue({
      label: (
        <span className="flex items-center gap-2">
          # {collection.name}{' '}
          {section.name !== 'Uncategorized' ? (
            <>
              / <RxSection />
              {section.name}
            </>
          ) : (
            ''
          )}
        </span>
      ),
      value: section.id,
    })
  }, [value, collections, inbox])
  useEffect(() => {
    if (sectionPickerValue && sectionPickerValue.value !== value) {
      // console.log("only update section if there's a change in the value")
      setValue(sectionPickerValue.value)
    }
  }, [sectionPickerValue])
  return (
    <PopupMenu
      button={
        <button
          type="button"
          className="bg-accent1 flex items-center gap-1 rounded px-2 py-1 text-[11px]">
          {sectionPickerValue?.label} <FaAngleDown />
        </button>
      }
      content={
        <div className="flex-col">
          <input type="search" className="rounded border" />
          {inbox && (
            <button
              type="button"
              onClick={() => setSectionPickerValue(inbox)}
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
                          setSectionPickerValue({
                            value: section.id,
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
                          setSectionPickerValue({
                            value: section.id,
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
