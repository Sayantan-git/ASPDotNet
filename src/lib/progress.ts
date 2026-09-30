import { z } from 'zod'
import { lessonById, lessons } from '../content/curriculum'
import { projectStepIds } from '../content/projects'

export const STORAGE_KEY = 'dotnet-atlas.progress.v1'
const lessonId = z.string().refine((id) => lessonById.has(id), 'Unknown lesson')
const unique = (values: string[]) => [...new Set(values)]
const reviewIds = new Set(
  lessons.flatMap((lesson) => lesson.traps.map((_, index) => `${lesson.id}:${index}`)),
)

export const progressSchema = z
  .object({
    version: z.literal(1),
    completed: z.array(lessonId).max(60).transform(unique),
    bookmarks: z.array(lessonId).max(60).transform(unique),
    notes: z.record(lessonId, z.string().max(20000)),
    answers: z.record(lessonId, z.number().int().min(0).max(3)),
    reviews: z.record(
      z.string().refine((id) => reviewIds.has(id)),
      z.enum(['again', 'known']),
    ),
    projectSteps: z
      .array(z.string().refine((id) => projectStepIds.has(id)))
      .max(16)
      .transform(unique),
    lastLesson: lessonId,
    activity: z.array(z.iso.date()).max(366).transform(unique),
  })
  .strict()

export type Progress = z.infer<typeof progressSchema>
export type ProgressAction =
  | { type: 'complete' | 'bookmark' | 'visit' | 'project'; id: string }
  | { type: 'note'; id: string; value: string }
  | { type: 'answer'; id: string; value: number }
  | { type: 'review'; id: string; value: 'again' | 'known' }
  | { type: 'restore'; value: Progress }

export function emptyProgress(): Progress {
  return {
    version: 1,
    completed: [],
    bookmarks: [],
    notes: {},
    answers: {},
    reviews: {},
    projectSteps: [],
    lastLesson: lessons[0].id,
    activity: [],
  }
}

export function parseBackup(text: string): Progress {
  if (text.length > 2_000_000)
    throw new Error('This backup is too large. Choose a .NET Atlas progress export under 2 MB.')
  try {
    return progressSchema.parse(JSON.parse(text))
  } catch {
    throw new Error(
      'This is not a valid .NET Atlas v1 backup. Your current progress has not changed.',
    )
  }
}

const toggle = (values: string[], value: string) =>
  values.includes(value) ? values.filter((item) => item !== value) : [...values, value]

export function progressReducer(state: Progress, action: ProgressAction): Progress {
  if (action.type === 'restore') return progressSchema.parse(action.value)
  if (action.type === 'visit')
    return !lessonById.has(action.id) || state.lastLesson === action.id
      ? state
      : { ...state, lastLesson: action.id }
  const today = new Date().toISOString().slice(0, 10)
  const activity = unique([...state.activity, today]).slice(-366)
  if (action.type === 'project')
    return projectStepIds.has(action.id)
      ? { ...state, projectSteps: toggle(state.projectSteps, action.id), activity }
      : state
  if (action.type === 'review')
    return reviewIds.has(action.id)
      ? { ...state, reviews: { ...state.reviews, [action.id]: action.value }, activity }
      : state
  if (!lessonById.has(action.id)) return state
  if (action.type === 'complete')
    return { ...state, completed: toggle(state.completed, action.id), activity }
  if (action.type === 'bookmark') return { ...state, bookmarks: toggle(state.bookmarks, action.id) }
  if (action.type === 'answer') {
    if (!Number.isInteger(action.value) || action.value < 0 || action.value > 3) return state
    return { ...state, answers: { ...state.answers, [action.id]: action.value }, activity }
  }
  if (action.type === 'note') {
    const notes = { ...state.notes }
    if (action.value.trim()) notes[action.id] = action.value.slice(0, 20000)
    else delete notes[action.id]
    return { ...state, notes, activity }
  }
  return state
}

export function quizStats(progress: Progress) {
  const attempted = Object.keys(progress.answers).length
  const correct = Object.entries(progress.answers).filter(
    ([id, answer]) => lessonById.get(id)?.quiz.answer === answer,
  ).length
  return { attempted, correct, accuracy: attempted ? Math.round((correct / attempted) * 100) : 0 }
}
