import { emptyProgress, parseBackup, progressReducer, STORAGE_KEY } from './progress'
import type { Progress, ProgressAction } from './progress'

type StorageIO = Pick<Storage, 'getItem' | 'setItem'>
interface Snapshot {
  progress: Progress
  storageError: string
}

export function createProgressStore(getStorage: () => StorageIO = () => window.localStorage) {
  let snapshot: Snapshot = { progress: emptyProgress(), storageError: '' }
  const listeners = new Set<() => void>()
  try {
    const raw = getStorage().getItem(STORAGE_KEY)
    if (raw) snapshot.progress = parseBackup(raw)
  } catch {
    snapshot.storageError =
      'Saved progress could not be read. A fresh in-memory session is open; export a backup before closing if storage remains unavailable.'
  }
  function emit() {
    for (const listener of listeners) listener()
  }
  return {
    getSnapshot: () => snapshot,
    subscribe: (listener: () => void) => {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },
    dispatch(action: ProgressAction) {
      const progress = progressReducer(snapshot.progress, action)
      if (progress === snapshot.progress) return
      let storageError = ''
      try {
        const serialized = JSON.stringify(progress)
        const storage = getStorage()
        if (storage.getItem(STORAGE_KEY) !== serialized) storage.setItem(STORAGE_KEY, serialized)
      } catch {
        storageError =
          'Browser storage is unavailable or full. Changes are kept in this session only. Export your progress from the notebook before closing.'
      }
      snapshot = { progress, storageError }
      emit()
    },
    acceptStorageValue(value: string | null) {
      try {
        snapshot = { progress: value ? parseBackup(value) : emptyProgress(), storageError: '' }
      } catch {
        snapshot = {
          ...snapshot,
          storageError:
            'Another tab wrote an unreadable progress record. This session has kept its current data.',
        }
      }
      emit()
    },
  }
}

export function downloadText(filename: string, content: string, type = 'text/plain;charset=utf-8') {
  const url = URL.createObjectURL(new Blob([content], { type }))
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
