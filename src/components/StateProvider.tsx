import { useEffect, useState, useSyncExternalStore } from 'react'
import type { ReactNode } from 'react'
import { createProgressStore } from '../lib/browser'
import { STORAGE_KEY } from '../lib/progress'
import { StateContext } from '../state'

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [store] = useState(createProgressStore)
  const snapshot = useSyncExternalStore(store.subscribe, store.getSnapshot)
  const [toast, setToast] = useState<{ message: string } | null>(null)

  useEffect(() => {
    function sync(event: StorageEvent) {
      if (event.key === STORAGE_KEY || event.key === null) store.acceptStorageValue(event.newValue)
    }
    window.addEventListener('storage', sync)
    return () => window.removeEventListener('storage', sync)
  }, [store])

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(null), 3800)
    return () => clearTimeout(timer)
  }, [toast])

  return (
    <StateContext.Provider
      value={{ ...snapshot, dispatch: store.dispatch, notify: (message) => setToast({ message }) }}
    >
      {children}
      {toast && (
        <div className="toast" role="status">
          {toast.message}
        </div>
      )}
    </StateContext.Provider>
  )
}
