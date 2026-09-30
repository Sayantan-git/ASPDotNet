import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  BrainCircuit,
  Check,
  CheckCircle2,
  Code2,
  FlaskConical,
  Lightbulb,
  Play,
  RotateCcw,
  Send,
  Shuffle,
  Target,
  Terminal,
  TriangleAlert,
  X,
} from 'lucide-react'
import { chapters, chapterById, lessonById, lessons } from '../content/curriculum'
import { quizStats } from '../lib/progress'
import {
  defaultPipeline,
  initialLabState,
  pipelineLabels,
  simulateApi,
  simulatePipeline,
} from '../lib/simulations'
import type { HttpMethod, LabResponse, PipelineStage } from '../lib/simulations'
import { useAppState } from '../state'
import { CodeBlock, EmptyState, IconButton, Markdown, PageHeading, SegmentedControl } from './ui'
import { LessonQuiz } from './LessonPage'

function shuffled<T>(items: T[]) {
  const result = [...items]
  for (let index = result.length - 1; index > 0; index--) {
    const other = Math.floor(Math.random() * (index + 1))
    ;[result[index], result[other]] = [result[other], result[index]]
  }
  return result
}

export function PracticePage() {
  const { progress, dispatch } = useAppState()
  const [params, setParams] = useSearchParams()
  const mode = ['quiz', 'flashcards', 'labs'].includes(params.get('mode') ?? '')
    ? params.get('mode')!
    : 'quiz'
  const [chapterId, setChapterId] = useState('all')
  const [questionCount, setQuestionCount] = useState(10)
  const [session, setSession] = useState<string[]>([])
  const [questionIndex, setQuestionIndex] = useState(0)
  const [sessionRun, setSessionRun] = useState(0)
  const [finished, setFinished] = useState(false)
  const [cardIndex, setCardIndex] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [reviewOnly, setReviewOnly] = useState(false)
  const pool =
    chapterId === 'all' ? lessons : lessons.filter((lesson) => lesson.chapterId === chapterId)
  const stats = quizStats(progress)
  const cards = pool
    .flatMap((lesson) =>
      lesson.traps.map((trap, index) => ({ ...trap, id: `${lesson.id}:${index}`, lesson })),
    )
    .filter((card) => !reviewOnly || progress.reviews[card.id] === 'again')
  const card = cards.length ? cards[cardIndex % cards.length] : undefined
  const current = lessonById.get(session[questionIndex])
  const sessionCorrect = session.filter(
    (id) => progress.answers[id] === lessonById.get(id)?.quiz.answer,
  ).length
  function startSession() {
    setSession(
      shuffled(pool)
        .slice(0, questionCount)
        .map((lesson) => lesson.id),
    )
    setQuestionIndex(0)
    setSessionRun((run) => run + 1)
    setFinished(false)
  }
  function nextCard(delta: number) {
    setCardIndex((index) => (index + delta + cards.length) % Math.max(cards.length, 1))
    setRevealed(false)
  }
  function review(value: 'again' | 'known') {
    if (!card) return
    dispatch({ type: 'review', id: card.id, value })
    setCardIndex(reviewOnly ? 0 : (cardIndex + 1) % cards.length)
    setRevealed(false)
  }
  return (
    <div className="workspace-page practice-page">
      <PageHeading
        eyebrow="RECALL. REASON. BUILD."
        title="The practice room"
        description="Test a concept. Untangle a trap. Follow the behavior."
      />
      <div className="metrics-strip practice-metrics">
        <div>
          <strong>
            {stats.attempted}
            <small> / 60</small>
          </strong>
          <span>Questions attempted</span>
        </div>
        <div>
          <strong>{stats.correct}</strong>
          <span>Latest answers correct</span>
        </div>
        <div>
          <strong>
            {Object.keys(progress.reviews).length}
            <small> / {lessons.reduce((count, lesson) => count + lesson.traps.length, 0)}</small>
          </strong>
          <span>Flashcards self-reviewed</span>
        </div>
      </div>
      <div className="practice-navigation">
        <div className="mode-tabs" role="group" aria-label="Practice mode">
          {[
            { id: 'quiz', label: 'Knowledge checks', icon: Target },
            { id: 'flashcards', label: 'Interview flashcards', icon: BrainCircuit },
            { id: 'labs', label: 'Code labs', icon: FlaskConical },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              className={mode === id ? 'active' : ''}
              aria-pressed={mode === id}
              onClick={() => setParams({ mode: id })}
            >
              <Icon size={17} />
              {label}
            </button>
          ))}
        </div>
        {mode !== 'labs' && (
          <select
            aria-label="Practice chapter"
            value={chapterId}
            disabled={mode === 'quiz' && session.length > 0 && !finished}
            onChange={(event) => {
              setChapterId(event.target.value)
              setCardIndex(0)
              setRevealed(false)
            }}
          >
            <option value="all">All chapters</option>
            {chapters.map((chapter, index) => (
              <option key={chapter.id} value={chapter.id}>
                {String(index + 1).padStart(2, '0')} {chapter.title}
              </option>
            ))}
          </select>
        )}
      </div>
      {mode === 'quiz' &&
        (!session.length ? (
          <section className="practice-start">
            <div className="practice-start-mark">
              <Target size={45} strokeWidth={1.2} />
            </div>
            <div>
              <div className="section-kicker">A FOCUSED PRACTICE SESSION</div>
              <h2>Can you explain why?</h2>
              <p>
                {pool.length} questions in{' '}
                {chapterId === 'all' ? 'the complete course' : chapterById.get(chapterId)?.title}.
                Every answer includes the reasoning.
              </p>
              <div className="start-controls">
                <label>
                  Session length
                  <select
                    aria-label="Session length"
                    value={questionCount}
                    onChange={(event) => setQuestionCount(Number(event.target.value))}
                  >
                    <option value={5}>5 questions</option>
                    <option value={10}>10 questions</option>
                    <option value={20}>20 questions</option>
                  </select>
                </label>
                <button className="button primary" onClick={startSession}>
                  Start {Math.min(questionCount, pool.length)} questions
                  <ArrowRight size={17} />
                </button>
              </div>
            </div>
          </section>
        ) : finished ? (
          <section className="session-summary">
            <div className="summary-icon">
              <CheckCircle2 size={35} />
            </div>
            <div className="section-kicker">SESSION COMPLETE</div>
            <h2>
              {sessionCorrect} of {session.length} correct
            </h2>
            <p>Based on your latest answers, including retries.</p>
            {sessionCorrect < session.length && (
              <div className="review-links">
                <h3>Worth another look</h3>
                {session
                  .filter((id) => progress.answers[id] !== lessonById.get(id)?.quiz.answer)
                  .map((id) => (
                    <Link to={`/learn/${id}`} key={id}>
                      {lessonById.get(id)?.title}
                      <ArrowRight size={16} />
                    </Link>
                  ))}
              </div>
            )}
            <div className="quiz-actions">
              <button className="button primary" onClick={startSession}>
                <RotateCcw size={16} />
                New session
              </button>
              <Link className="button secondary" to="/roadmap">
                Back to the path
                <ArrowRight size={16} />
              </Link>
            </div>
          </section>
        ) : (
          current && (
            <div className="active-session">
              <div className="session-progress">
                <div>
                  <span>
                    QUESTION {String(questionIndex + 1).padStart(2, '0')} /{' '}
                    {String(session.length).padStart(2, '0')}
                  </span>
                  <span>{chapterById.get(current.chapterId)?.title}</span>
                </div>
                <IconButton label="End practice session" onClick={() => setSession([])}>
                  <X size={18} />
                </IconButton>
                <progress
                  value={questionIndex}
                  max={session.length}
                  aria-label="Quiz session progress"
                />
              </div>
              <LessonQuiz
                lesson={current}
                key={`${sessionRun}-${current.id}`}
                fresh
                onNext={() => {
                  if (questionIndex === session.length - 1) setFinished(true)
                  else setQuestionIndex(questionIndex + 1)
                }}
              />
            </div>
          )
        ))}
      {mode === 'flashcards' && (
        <div className="flashcard-workspace">
          <div className="flashcard-toolbar">
            <span>
              {cards.length ? (cardIndex % cards.length) + 1 : 0} / {cards.length} cards
            </span>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={reviewOnly}
                onChange={(event) => {
                  setReviewOnly(event.target.checked)
                  setCardIndex(0)
                  setRevealed(false)
                }}
              />
              Needs review only
            </label>
            <IconButton
              label="Random flashcard"
              disabled={!cards.length}
              onClick={() => {
                setCardIndex(Math.floor(Math.random() * cards.length))
                setRevealed(false)
              }}
            >
              <Shuffle size={17} />
            </IconButton>
          </div>
          {card ? (
            <>
              <section className={`flashcard ${revealed ? 'revealed' : ''}`}>
                <div className="flashcard-top">
                  <span className="section-kicker">
                    <TriangleAlert size={15} />
                    THE INTERVIEW TRAP
                  </span>
                  <span>{chapterById.get(card.lesson.chapterId)?.title}</span>
                </div>
                <h2>{card.question}</h2>
                {revealed ? (
                  <div className="flashcard-answer">
                    <div className="section-kicker">
                      <Lightbulb size={15} />
                      THE DISTINCTION THAT MATTERS
                    </div>
                    <Markdown>{card.answer}</Markdown>
                    <div className="flashcard-warning">{card.warning}</div>
                    <Link className="text-button" to={`/learn/${card.lesson.id}?tab=interview`}>
                      Read the full lesson
                      <ArrowRight size={15} />
                    </Link>
                  </div>
                ) : (
                  <div className="flashcard-reveal">
                    <button className="button primary" onClick={() => setRevealed(true)}>
                      Reveal answer
                      <ArrowRight size={16} />
                    </button>
                  </div>
                )}
              </section>
              <div className="flashcard-actions">
                <IconButton label="Previous flashcard" onClick={() => nextCard(-1)}>
                  <ArrowLeft size={19} />
                </IconButton>
                {revealed && (
                  <div>
                    <button className="button secondary" onClick={() => review('again')}>
                      <RotateCcw size={15} />
                      Needs review
                    </button>
                    <button className="button primary" onClick={() => review('known')}>
                      <Check size={16} />
                      Got it
                    </button>
                  </div>
                )}
                <IconButton label="Next flashcard" onClick={() => nextCard(1)}>
                  <ArrowRight size={19} />
                </IconButton>
              </div>
            </>
          ) : (
            <EmptyState icon={BrainCircuit} title="No cards in this review list">
              <button className="button secondary" onClick={() => setReviewOnly(false)}>
                Show all flashcards
              </button>
            </EmptyState>
          )}
        </div>
      )}
      {mode === 'labs' && <CodeLabs />}
    </div>
  )
}

function CodeLabs() {
  const [lab, setLab] = useState('http')
  return (
    <div className="labs-workspace">
      <div className="lab-heading">
        <SegmentedControl
          label="Code lab"
          value={lab}
          onChange={setLab}
          options={[
            { value: 'http', label: 'HTTP sandbox' },
            { value: 'pipeline', label: 'Middleware pipeline' },
          ]}
        />
        <span className="simulation-label">
          <span className="status-dot" />
          IN-BROWSER SIMULATION
        </span>
      </div>
      <p className="lab-disclaimer">
        A model of HTTP and pipeline behavior, not a C# compiler or a running .NET server.
      </p>
      {lab === 'http' ? <HttpLab /> : <PipelineLab />}
      <div className="real-code-link">
        <Code2 size={18} />
        <Link to="/projects/taskflow-api">
          Run the real ASP.NET Core project
          <ArrowRight size={15} />
        </Link>
      </div>
    </div>
  )
}

function HttpLab() {
  const [state, setState] = useState(initialLabState)
  const [method, setMethod] = useState<HttpMethod>('GET')
  const [path, setPath] = useState('/tasks')
  const [body, setBody] = useState('{\n  "title": "Practice HTTP"\n}')
  const [response, setResponse] = useState<LabResponse | null>(null)
  function send() {
    const next = simulateApi(state, method, path, body)
    setState(next.state)
    setResponse(next)
  }
  function scenario(value: string) {
    const choices: Record<string, { method: HttpMethod; path: string; body: string }> = {
      list: { method: 'GET', path: '/tasks', body: '' },
      missing: { method: 'GET', path: '/tasks/99', body: '' },
      create: { method: 'POST', path: '/tasks', body: '{\n  "title": "Practice HTTP"\n}' },
      invalid: { method: 'POST', path: '/tasks', body: '{\n  "title": "   "\n}' },
      update: {
        method: 'PUT',
        path: '/tasks/2',
        body: '{\n  "title": "Build a tested API",\n  "isComplete": true\n}',
      },
      remove: { method: 'DELETE', path: '/tasks/2', body: '' },
    }
    const choice = choices[value]
    if (choice) {
      setMethod(choice.method)
      setPath(choice.path)
      setBody(choice.body)
      setResponse(null)
    }
  }
  const statusLabels: Record<number, string> = {
    200: 'OK',
    201: 'Created',
    204: 'No Content',
    400: 'Bad Request',
    404: 'Not Found',
    405: 'Method Not Allowed',
  }
  return (
    <div className="http-lab">
      <div className="lab-scenario">
        <label>
          Scenario
          <select
            aria-label="HTTP scenario"
            defaultValue="list"
            onChange={(event) => scenario(event.target.value)}
          >
            <option value="list">List tasks</option>
            <option value="missing">Look up an unknown task</option>
            <option value="create">Create a task</option>
            <option value="invalid">Reject a blank title</option>
            <option value="update">Update a task</option>
            <option value="remove">Delete a task</option>
          </select>
        </label>
        <IconButton
          label="Reset HTTP sample data"
          onClick={() => {
            setState(initialLabState())
            setResponse(null)
          }}
        >
          <RotateCcw size={17} />
        </IconButton>
      </div>
      <div className="request-bar">
        <select
          aria-label="HTTP method"
          value={method}
          onChange={(event) => setMethod(event.target.value as HttpMethod)}
        >
          {['GET', 'POST', 'PUT', 'DELETE'].map((value) => (
            <option key={value}>{value}</option>
          ))}
        </select>
        <input
          aria-label="Request path"
          value={path}
          onChange={(event) => setPath(event.target.value)}
          spellCheck={false}
        />
        <button className="button primary" onClick={send}>
          <Send size={15} />
          Send request
        </button>
      </div>
      <div className="http-panels">
        <section className="request-panel">
          <div className="section-kicker">REQUEST BODY</div>
          <textarea
            aria-label="JSON request body"
            value={body}
            disabled={method === 'GET' || method === 'DELETE'}
            onChange={(event) => setBody(event.target.value)}
            rows={9}
            spellCheck={false}
          />{' '}
          <div className="sample-data-count">{state.tasks.length} sample tasks in memory</div>
        </section>
        <section className="response-panel">
          <div className="response-heading">
            <span className="section-kicker">RESPONSE</span>
            {response && (
              <span className={`http-status ${response.status < 400 ? 'success' : 'failure'}`}>
                {response.status} {statusLabels[response.status]}
              </span>
            )}
          </div>
          {response ? (
            <>
              <div className="response-headers">
                {Object.entries(response.headers).map(([name, value]) => (
                  <div key={name}>
                    <span>{name}:</span> {value}
                  </div>
                ))}
              </div>
              {response.status === 204 ? (
                <p className="no-content">No response body.</p>
              ) : (
                <CodeBlock
                  code={JSON.stringify(response.body, null, 2)}
                  language="json"
                  filename="response.json"
                />
              )}
            </>
          ) : (
            <div className="waiting-response">
              <Terminal size={25} />
              <span>Awaiting a request</span>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

function PipelineLab() {
  const [order, setOrder] = useState<PipelineStage[]>([...defaultPipeline])
  const [signedIn, setSignedIn] = useState(true)
  const [result, setResult] = useState<ReturnType<typeof simulatePipeline> | null>(null)
  function move(index: number, delta: number) {
    const next = [...order]
    const target = index + delta
    if (target < 0 || target >= next.length) return
    ;[next[index], next[target]] = [next[target], next[index]]
    setOrder(next)
    setResult(null)
  }
  return (
    <div className="pipeline-lab">
      <div className="pipeline-intro">
        <h2>Order changes the outcome.</h2>
        <p>
          For this four-stage model, exception handling wraps the pipeline, authentication
          establishes identity, and authorization protects the endpoint.
        </p>
      </div>
      <div className="pipeline-panels">
        <section>
          <div className="section-kicker">REQUEST ORDER</div>
          <ol className="pipeline-order">
            {order.map((stage, index) => (
              <li key={stage} data-stage={stage}>
                <span className="pipeline-index">{index + 1}</span>
                <span>{pipelineLabels[stage]}</span>
                <div>
                  <IconButton
                    label={`Move ${pipelineLabels[stage]} earlier`}
                    disabled={index === 0}
                    onClick={() => move(index, -1)}
                  >
                    <ArrowUp size={16} />
                  </IconButton>
                  <IconButton
                    label={`Move ${pipelineLabels[stage]} later`}
                    disabled={index === order.length - 1}
                    onClick={() => move(index, 1)}
                  >
                    <ArrowDown size={16} />
                  </IconButton>
                </div>
              </li>
            ))}
          </ol>
          <div className="pipeline-controls">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={signedIn}
                onChange={(event) => {
                  setSignedIn(event.target.checked)
                  setResult(null)
                }}
              />
              Signed-in request
            </label>
            <IconButton
              label="Reset middleware order"
              onClick={() => {
                setOrder([...defaultPipeline])
                setResult(null)
              }}
            >
              <RotateCcw size={17} />
            </IconButton>
          </div>
          <button
            className="button primary"
            onClick={() => setResult(simulatePipeline(order, signedIn))}
          >
            <Play size={15} />
            Run pipeline
          </button>
        </section>
        <section className="pipeline-result">
          <div className="section-kicker">EXECUTION TRACE</div>
          {result ? (
            <>
              <div
                className={`pipeline-verdict ${result.valid ? 'valid' : 'invalid'}`}
                role="status"
              >
                {result.valid ? <CheckCircle2 size={17} /> : <TriangleAlert size={17} />}
                <strong>
                  {result.valid ? 'The order is correct' : 'The order needs attention'}
                </strong>
                <span>{result.status}</span>
              </div>
              <CodeBlock
                code={result.trace.join('\n')}
                language="bash"
                filename="Execution trace"
              />
              <p className="small-label">
                {result.valid
                  ? signedIn
                    ? 'The endpoint runs, then the outer middleware unwinds.'
                    : 'Authorization challenges the anonymous request. The endpoint does not run.'
                  : 'An early endpoint can bypass checks; authorization before authentication cannot see the intended identity.'}
              </p>
            </>
          ) : (
            <div className="waiting-response">
              <Lightbulb size={26} />
              <span>Predict the trace before running.</span>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
