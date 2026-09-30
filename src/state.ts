import { createContext, useContext } from 'react'
import type { Dispatch } from 'react'
import type { Progress, ProgressAction } from './lib/progress'

interface AppState {
  progress: Progress
  dispatch: Dispatch<ProgressAction>
  storageError: string
  notify: (message: string) => void
}

export const StateContext = createContext<AppState | null>(null)

export function useAppState() {
  const context = useContext(StateContext)
  if (!context) throw new Error('AppStateProvider is required')
  return context
}
