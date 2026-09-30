export const pipelineLabels = {
  exception: 'Exception handler',
  authentication: 'Authentication',
  authorization: 'Authorization',
  endpoint: 'Endpoint',
} as const
export type PipelineStage = keyof typeof pipelineLabels
export const defaultPipeline: PipelineStage[] = [
  'exception',
  'authentication',
  'authorization',
  'endpoint',
]

export function simulatePipeline(order: PipelineStage[], signedIn: boolean) {
  const valid =
    order.length === 4 &&
    new Set(order).size === 4 &&
    order[0] === 'exception' &&
    order.indexOf('authentication') < order.indexOf('authorization') &&
    order.indexOf('authorization') < order.indexOf('endpoint')
  const trace: string[] = []
  let hasIdentity = false
  let status = 404
  function visit(index: number) {
    const stage = order[index]
    if (!stage) return
    trace.push(`${pipelineLabels[stage]}: enter`)
    if (stage === 'endpoint') {
      status = 200
      trace.push('Endpoint: return 200 OK')
      return
    }
    if (stage === 'authentication') {
      hasIdentity = signedIn
      trace.push(hasIdentity ? 'Identity established' : 'No authenticated identity')
    }
    if (stage === 'authorization' && !hasIdentity) {
      status = 401
      trace.push('Authorization: challenge with 401; endpoint skipped')
    } else visit(index + 1)
    trace.push(`${pipelineLabels[stage]}: exit`)
  }
  visit(0)
  return { valid, status, trace }
}

export interface LabTask {
  id: number
  title: string
  isComplete: boolean
}
export interface LabState {
  tasks: LabTask[]
  nextId: number
}
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'
export interface LabResponse {
  status: number
  body: unknown
  headers: Record<string, string>
  state: LabState
}
export function initialLabState(): LabState {
  return {
    tasks: [
      { id: 1, title: 'Learn the .NET ecosystem', isComplete: true },
      { id: 2, title: 'Build your first endpoint', isComplete: false },
    ],
    nextId: 3,
  }
}

export function simulateApi(
  state: LabState,
  method: HttpMethod,
  path: string,
  rawBody: string,
): LabResponse {
  const respond = (
    status: number,
    body: unknown,
    nextState = state,
    headers: Record<string, string> = {},
  ): LabResponse => ({
    status,
    body,
    state: nextState,
    headers:
      status === 204
        ? headers
        : {
            'Content-Type': status >= 400 ? 'application/problem+json' : 'application/json',
            ...headers,
          },
  })
  const problem = (status: number, title: string, detail: string) =>
    respond(status, { type: 'about:blank', title, status, detail })
  const match = path.trim().match(/^\/tasks(?:\/([1-9]\d*))?\/?$/)
  if (!match) return problem(404, 'Not Found', 'No simulated endpoint matches this path.')
  const id = match[1] ? Number(match[1]) : undefined
  const task = state.tasks.find((item) => item.id === id)
  if (method === 'GET')
    return id === undefined
      ? respond(200, state.tasks)
      : task
        ? respond(200, task)
        : problem(404, 'Not Found', 'The task does not exist.')
  if (
    (method === 'POST' && id !== undefined) ||
    ((method === 'PUT' || method === 'DELETE') && id === undefined)
  ) {
    const response = problem(
      405,
      'Method Not Allowed',
      'This method is not supported for this route.',
    )
    response.headers.Allow = id === undefined ? 'GET, POST' : 'GET, PUT, DELETE'
    return response
  }
  if (method === 'DELETE')
    return task
      ? respond(204, null, { ...state, tasks: state.tasks.filter((item) => item.id !== id) })
      : problem(404, 'Not Found', 'The task does not exist.')
  let body: unknown
  try {
    body = JSON.parse(rawBody)
  } catch {
    return problem(400, 'Bad Request', 'The request body must be valid JSON.')
  }
  if (
    !body ||
    typeof body !== 'object' ||
    Array.isArray(body) ||
    !('title' in body) ||
    typeof body.title !== 'string' ||
    !body.title.trim() ||
    body.title.trim().length > 120
  ) {
    return problem(
      400,
      'Validation failed',
      'Title must contain 1 to 120 non-whitespace characters after trimming.',
    )
  }
  if (method === 'POST') {
    const created = { id: state.nextId, title: body.title.trim(), isComplete: false }
    return respond(
      201,
      created,
      { tasks: [...state.tasks, created], nextId: state.nextId + 1 },
      { Location: `/tasks/${created.id}` },
    )
  }
  if (!('isComplete' in body) || typeof body.isComplete !== 'boolean')
    return problem(400, 'Validation failed', 'PUT requires a Boolean isComplete field.')
  if (!task) return problem(404, 'Not Found', 'The task does not exist.')
  const updated = { ...task, title: body.title.trim(), isComplete: body.isComplete }
  return respond(200, updated, {
    ...state,
    tasks: state.tasks.map((item) => (item.id === id ? updated : item)),
  })
}
