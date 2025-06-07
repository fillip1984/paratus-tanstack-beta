import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { FaAngleDown, FaInbox } from 'react-icons/fa'
import { RxSection } from 'react-icons/rx'
import PopupMenu from '../ui/popupMenu'
import { useTRPC } from '@/integrations/trpc/react'

export type CollectionAndSectionType = {
  label: React.ReactNode
  collectionId: string
  sectionId: string
}
export default function CollectionSectionPicker({
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
}) {
  const [inbox, setInbox] = useState<CollectionAndSectionType | null>(null)
  const trpc = useTRPC()
  const { data: collections } = useQuery(trpc.collection.readAll.queryOptions())
  useEffect(() => {
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
    // console.log('attempting to default collection and section picker')
    const defaultCollection = collections?.find(
      (c) => c.id === currentCollectionId,
    )
    // console.log(`default collection: ${defaultCollection?.name}`)
    if (defaultCollection && defaultCollection.name !== 'Inbox') {
      const uncategorizedSection = defaultCollection.sections.find(
        (s) => s.id === currentSectionId,
      )
      if (uncategorizedSection) {
        // console.log(`defaulting to collection: ${defaultCollection.name}`)
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
        console.warn(`unable to find current section: ${currentSectionId}`)
      }
    } else {
      // console.log('defaulting to inbox')
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
