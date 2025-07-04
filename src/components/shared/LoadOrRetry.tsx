import { FaCircleNotch, FaExclamationTriangle } from 'react-icons/fa'

export default function LoadOrRetry({
  isLoading,
  isError,
  retry,
}: {
  isLoading: boolean
  isError: boolean
  retry: () => void
}) {
  return (
    <div className="flex items-center justify-center flex-1">
      {isLoading && <FaCircleNotch className="animate-spin text-9xl" />}

      {isError && (
        <div>
          <h2 className="flex mb-0 items-center justify-center gap-2 uppercase">
            <FaExclamationTriangle /> error
          </h2>
          <p>An error has occurred, would you like to retry?</p>

          <button
            type="button"
            onClick={retry}
            className="mt-4 w-full rounded bg-slate-400 px-4 py-2 text-3xl"
          >
            Retry
          </button>
        </div>
      )}
    </div>
  )
}
