import { describe, expect, it } from 'vitest'
import { emptyProgress, parseBackup, progressReducer, quizStats } from './progress'
import { defaultPipeline, initialLabState, simulateApi, simulatePipeline } from './simulations'
import { lessonById, lessons } from '../content/curriculum'
import { projects } from '../content/projects'
import { createProgressStore } from './browser'

describe('browser storage boundary', () => {
  it('persists updates before notifying subscribers', () => {
    let stored: string | null = null
    const store = createProgressStore(() => ({
      getItem: () => stored,
      setItem: (_key, value) => {
        stored = value
      },
    }))
    let changes = 0
    const unsubscribe = store.subscribe(() => {
      changes++
    })
    store.dispatch({ type: 'complete', id: lessons[0].id })
    expect(changes).toBe(1)
    expect(parseBackup(stored!).completed).toEqual([lessons[0].id])
    unsubscribe()
    store.acceptStorageValue(JSON.stringify(emptyProgress()))
    expect(store.getSnapshot().progress.completed).toEqual([])
    expect(changes).toBe(1)
  })
  it('keeps a failed write in memory and reports the missing persistence', () => {
    const store = createProgressStore(() => ({
      getItem: () => null,
      setItem: () => {
        throw new Error('Unavailable')
      },
    }))
    store.dispatch({ type: 'note', id: lessons[0].id, value: 'Keep my note' })
    expect(store.getSnapshot().progress.notes[lessons[0].id]).toBe('Keep my note')
    expect(store.getSnapshot().storageError).toContain('session only')
    store.acceptStorageValue('bad data')
    expect(store.getSnapshot().progress.notes[lessons[0].id]).toBe('Keep my note')
  })
})

describe('progress and backups', () => {
  const id = lessons[0].id
  it('toggles completion and bookmarks independently', () => {
    let state = progressReducer(emptyProgress(), { type: 'complete', id })
    state = progressReducer(state, { type: 'bookmark', id })
    expect(state.completed).toEqual([id])
    expect(state.bookmarks).toEqual([id])
    expect(progressReducer(state, { type: 'complete', id }).completed).toEqual([])
    expect(state.activity).toHaveLength(1)
  })
  it('preserves notes and computes quiz results from the actual answer key', () => {
    let state = progressReducer(emptyProgress(), {
      type: 'note',
      id,
      value: 'A runtime is not an SDK.',
    })
    state = progressReducer(state, { type: 'answer', id, value: lessons[0].quiz.answer })
    expect(quizStats(state)).toEqual({ attempted: 1, correct: 1, accuracy: 100 })
    expect(parseBackup(JSON.stringify(state))).toEqual(state)
    expect(progressReducer(state, { type: 'note', id, value: ' ' }).notes).toEqual({})
  })
  it('rejects malformed and unsupported backups without mutating current data', () => {
    const state = emptyProgress()
    for (const text of [
      'bad JSON',
      '{}',
      JSON.stringify({ ...state, version: 2 }),
      JSON.stringify({ ...state, completed: ['unknown'] }),
      JSON.stringify({ ...state, answers: { [id]: 10 } }),
      JSON.stringify({ ...state, notes: { __proto__: 'unsafe' }, unexpected: true }),
    ]) {
      expect(() => parseBackup(text)).toThrow()
    }
    expect(state).toEqual(emptyProgress())
  })
  it('ignores unknown action IDs and out-of-range quiz answers', () => {
    const state = emptyProgress()
    expect(progressReducer(state, { type: 'complete', id: 'missing' })).toBe(state)
    expect(progressReducer(state, { type: 'answer', id, value: -1 })).toBe(state)
  })
  it('has real lesson links in every project milestone', () => {
    expect(projects).toHaveLength(3)
    for (const project of projects)
      for (const step of project.milestones) expect(lessonById.has(step.lessonId)).toBe(true)
  })
})

describe('middleware model', () => {
  it('unwinds a correctly ordered signed-in request', () => {
    const result = simulatePipeline(defaultPipeline, true)
    expect(result.valid).toBe(true)
    expect(result.status).toBe(200)
    expect(result.trace.at(-1)).toBe('Exception handler: exit')
  })
  it('short-circuits anonymous requests and exposes a wrong order', () => {
    const anonymous = simulatePipeline(defaultPipeline, false)
    expect(anonymous.status).toBe(401)
    expect(anonymous.trace).not.toContain('Endpoint: return 200 OK')
    const wrongOrder = simulatePipeline(
      ['exception', 'authorization', 'authentication', 'endpoint'],
      true,
    )
    expect(wrongOrder.valid).toBe(false)
    expect(wrongOrder.status).toBe(401)
    expect(
      simulatePipeline(['endpoint', 'exception', 'authentication', 'authorization'], false).valid,
    ).toBe(false)
  })
})

describe('in-browser HTTP model', () => {
  it('supports a complete CRUD round trip without reusing deleted IDs', () => {
    const created = simulateApi(initialLabState(), 'POST', '/tasks', '{"title":" Test "}')
    expect(created.status).toBe(201)
    expect(created.headers.Location).toBe('/tasks/3')
    expect(simulateApi(created.state, 'GET', '/tasks/3', '').body).toEqual({
      id: 3,
      title: 'Test',
      isComplete: false,
    })
    const updated = simulateApi(
      created.state,
      'PUT',
      '/tasks/3',
      '{"title":"Updated","isComplete":true}',
    )
    expect(updated.status).toBe(200)
    const deleted = simulateApi(updated.state, 'DELETE', '/tasks/3', '')
    expect(deleted.status).toBe(204)
    expect(deleted.body).toBeNull()
    expect(simulateApi(deleted.state, 'GET', '/tasks/3', '').status).toBe(404)
    expect(simulateApi(deleted.state, 'POST', '/tasks', '{"title":"Next"}').headers.Location).toBe(
      '/tasks/4',
    )
  })
  it('rejects invalid JSON, invalid fields, and unsupported routes/methods', () => {
    const state = initialLabState()
    for (const body of ['oops', '[]', '{}', '{"title":" "}', '{"title":12}'])
      expect(simulateApi(state, 'POST', '/tasks', body).status).toBe(400)
    expect(simulateApi(state, 'PUT', '/tasks/1', '{"title":"Missing state"}').status).toBe(400)
    expect(simulateApi(state, 'GET', '/missing', '').status).toBe(404)
    expect(simulateApi(state, 'POST', '/tasks/1', '{}').status).toBe(405)
    expect(state).toEqual(initialLabState())
  })
})
