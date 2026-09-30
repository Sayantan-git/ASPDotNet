import { useEffect, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  BookmarkCheck,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock3,
  Code2,
  ExternalLink,
  Lightbulb,
  ListChecks,
  NotepadText,
  Printer,
  RotateCcw,
  Target,
  Terminal,
  TriangleAlert,
} from 'lucide-react'
import { chapterById, lessonById, lessons } from '../content/curriculum'
import type { CourseLesson } from '../content/curriculum'
import { useAppState } from '../state'
import { CodeBlock, Diagram, EmptyState, IconButton, Markdown } from './ui'

const tabs = [
  { id: 'understand', label: 'Understand', icon: BookOpen },
  { id: 'example', label: 'Code example', icon: Code2 },
  { id: 'interview', label: 'Interview traps', icon: TriangleAlert },
  { id: 'quiz', label: 'Quick check', icon: ListChecks },
] as const

export function LessonQuiz({
  lesson,
  onNext,
  fresh = false,
}: {
  lesson: CourseLesson
  onNext?: () => void
  fresh?: boolean
}) {
  const { progress, dispatch } = useAppState()
  const previous = fresh ? undefined : progress.answers[lesson.id]
  const [choice, setChoice] = useState<number | null>(previous ?? null)
  const [checked, setChecked] = useState(previous !== undefined)
  const correct = choice === lesson.quiz.answer
  function checkAnswer() {
    if (choice === null) return
    dispatch({ type: 'answer', id: lesson.id, value: choice })
    setChecked(true)
  }
  return (
    <section className="quiz-question">
      <div className="section-kicker">
        <Target size={15} />
        KNOWLEDGE CHECK
      </div>
      <fieldset disabled={checked}>
        <legend>{lesson.quiz.question}</legend>
        <div className="quiz-options">
          {lesson.quiz.options.map((option, index) => (
            <label
              key={option}
              className={`quiz-option ${choice === index ? 'selected' : ''} ${checked && index === lesson.quiz.answer ? 'correct' : ''} ${checked && choice === index && !correct ? 'incorrect' : ''}`}
            >
              <input
                type="radio"
                name={`question-${lesson.id}`}
                value={index}
                checked={choice === index}
                onChange={() => setChoice(index)}
              />
              <span className="option-letter">{String.fromCharCode(65 + index)}</span>
              <span>{option}</span>
              {checked && index === lesson.quiz.answer && <CheckCircle2 size={18} />}
            </label>
          ))}
        </div>
      </fieldset>
      {checked && (
        <div className={`answer-feedback ${correct ? 'is-correct' : 'is-incorrect'}`} role="status">
          <div>
            {correct ? <CheckCircle2 size={19} /> : <Lightbulb size={19} />}
            <strong>{correct ? 'You got it.' : 'A useful one to revisit.'}</strong>
          </div>
          <p>{lesson.quiz.explanation}</p>
        </div>
      )}
      <div className="quiz-actions">
        {!checked ? (
          <button className="button primary" disabled={choice === null} onClick={checkAnswer}>
            Check answer
            <ArrowRight size={16} />
          </button>
        ) : (
          <>
            <button
              className="button secondary"
              onClick={() => {
                setChoice(null)
                setChecked(false)
              }}
            >
              <RotateCcw size={15} />
              Try again
            </button>
            {onNext && (
              <button className="button primary" onClick={onNext}>
                Next question
                <ArrowRight size={16} />
              </button>
            )}
          </>
        )}
      </div>
    </section>
  )
}

export function Exercise({ lesson }: { lesson: CourseLesson }) {
  return (
    <section className="exercise-section">
      <div className="section-kicker">
        <Terminal size={15} />
        YOUR TURN
      </div>
      <h2>{lesson.exercise.title}</h2>
      <p>{lesson.exercise.brief}</p>
      <ol className="exercise-steps">
        {lesson.exercise.steps.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
      <details className="solution">
        <summary>
          <Lightbulb size={17} />
          Compare your approach
          <ChevronDown size={16} />
        </summary>
        <Markdown>{lesson.exercise.solution}</Markdown>
      </details>
    </section>
  )
}

export function InterviewTraps({ lesson }: { lesson: CourseLesson }) {
  return (
    <div className="interview-list">
      {lesson.traps.map((trap, index) => (
        <section className="interview-trap" key={trap.question}>
          <div className="section-kicker">
            <TriangleAlert size={15} />
            TRAP {String(index + 1).padStart(2, '0')}
          </div>
          <h2>{trap.question}</h2>
          <div className="trap-warning">
            <TriangleAlert size={17} />
            <p>{trap.warning}</p>
          </div>
          <h3>A strong answer</h3>
          <Markdown>{trap.answer}</Markdown>
        </section>
      ))}
    </div>
  )
}

export function LessonPage() {
  const { id } = useParams()
  const { progress, dispatch, storageError, notify } = useAppState()
  const [params, setParams] = useSearchParams()
  const [activeSection, setActiveSection] = useState(0)
  const lesson = lessonById.get(id ?? '')
  const requestedTab = params.get('tab') ?? 'understand'
  const tab = tabs.some((item) => item.id === requestedTab) ? requestedTab : 'understand'

  useEffect(() => {
    if (lesson) dispatch({ type: 'visit', id: lesson.id })
  }, [lesson, dispatch])
  useEffect(() => {
    if (!lesson || tab !== 'understand') return
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries)
          if (entry.isIntersecting)
            setActiveSection(Number((entry.target as HTMLElement).dataset.section))
      },
      { rootMargin: '-100px 0px -60% 0px' },
    )
    document.querySelectorAll('[data-section]').forEach((section) => observer.observe(section))
    return () => observer.disconnect()
  }, [lesson, tab])

  if (!lesson)
    return (
      <EmptyState icon={BookOpen} title="Lesson not found">
        <Link className="button primary" to="/roadmap">
          Open the learning path
          <ArrowRight size={16} />
        </Link>
      </EmptyState>
    )
  const chapter = chapterById.get(lesson.chapterId)!
  const index = lessons.findIndex((item) => item.id === lesson.id)
  const chapterNumber = Array.from(chapterById.keys()).indexOf(chapter.id) + 1
  const lessonNumber = chapter.lessons.findIndex((item) => item.id === lesson.id) + 1
  const isComplete = progress.completed.includes(lesson.id)
  const isBookmarked = progress.bookmarks.includes(lesson.id)
  const next = lessons[index + 1]
  const previous = lessons[index - 1]
  function showSection(sectionIndex: number) {
    if (tab !== 'understand') setParams({ tab: 'understand' })
    requestAnimationFrame(() =>
      document
        .getElementById(`lesson-section-${sectionIndex}`)
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
    )
  }
  function complete() {
    dispatch({ type: 'complete', id: lesson!.id })
    notify(isComplete ? 'Lesson marked incomplete.' : 'Lesson marked complete.')
  }

  return (
    <div className="lesson-page" data-accent={chapter.accent}>
      <div className="lesson-breadcrumb">
        <Link to="/roadmap">Learning path</Link>
        <ChevronRight size={13} />
        <span>{chapter.title}</span>
      </div>
      <div className="lesson-layout">
        <article className="lesson-article">
          <header className="lesson-heading">
            <div className="lesson-heading-top">
              <span className="chapter-label">
                <span className="status-dot" />
                CHAPTER {String(chapterNumber).padStart(2, '0')}
                <span className="label-separator" />
                {chapter.level.toUpperCase()}
              </span>
              <div className="lesson-tools">
                <IconButton
                  label={isBookmarked ? 'Remove bookmark' : 'Bookmark lesson'}
                  onClick={() => dispatch({ type: 'bookmark', id: lesson.id })}
                >
                  {isBookmarked ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
                </IconButton>
                <IconButton label="Print current lesson view" onClick={() => window.print()}>
                  <Printer size={18} />
                </IconButton>
              </div>
            </div>
            <h1>{lesson.title}</h1>
            <p className="lesson-subtitle">{lesson.subtitle}</p>
            <div className="lesson-metadata">
              <span>
                <Clock3 size={14} />
                {lesson.minutes} min study
              </span>
              <span>
                <BookOpen size={14} />
                Lesson {String(lessonNumber).padStart(2, '0')} of 05
              </span>
              {isComplete && (
                <span className="completed-meta">
                  <CheckCircle2 size={14} />
                  Completed
                </span>
              )}
            </div>
          </header>
          <div className="lesson-tabs" role="tablist" aria-label="Lesson views">
            {tabs.map(({ id: tabId, label, icon: Icon }) => (
              <button
                key={tabId}
                id={`tab-${tabId}`}
                role="tab"
                aria-selected={tab === tabId}
                aria-controls="lesson-panel"
                tabIndex={tab === tabId ? 0 : -1}
                onClick={() => setParams({ tab: tabId })}
                onKeyDown={(event) => {
                  const current = tabs.findIndex((item) => item.id === tabId)
                  const target =
                    event.key === 'ArrowRight'
                      ? (current + 1) % tabs.length
                      : event.key === 'ArrowLeft'
                        ? (current + tabs.length - 1) % tabs.length
                        : event.key === 'Home'
                          ? 0
                          : event.key === 'End'
                            ? tabs.length - 1
                            : null
                  if (target !== null) {
                    event.preventDefault()
                    setParams({ tab: tabs[target].id })
                    document.getElementById(`tab-${tabs[target].id}`)?.focus()
                  }
                }}
              >
                <Icon size={16} />
                <span>{label}</span>
                {tabId === 'interview' && <span className="tab-count">{lesson.traps.length}</span>}
              </button>
            ))}
          </div>
          <div
            id="lesson-panel"
            role="tabpanel"
            aria-labelledby={`tab-${tab}`}
            className="lesson-panel"
            key={`${lesson.id}-${tab}`}
          >
            {tab === 'understand' && (
              <>
                {lesson.sections.map((section, sectionIndex) => (
                  <div key={section.title}>
                    <section
                      id={`lesson-section-${sectionIndex}`}
                      data-section={sectionIndex}
                      className="concept-section"
                    >
                      <h2>
                        <span className="section-number">
                          {String(sectionIndex + 1).padStart(2, '0')}
                        </span>
                        {section.title}
                      </h2>
                      <Markdown>{section.body}</Markdown>
                      {section.diagram && <Diagram diagram={section.diagram} />}
                    </section>
                    {sectionIndex === 0 && <Diagram diagram={lesson.diagram} />}
                  </div>
                ))}
                <div className="concept-next">
                  <Code2 size={20} />
                  <div>
                    <strong>Put the concept to work</strong>
                    <span>{lesson.example.title}</span>
                  </div>
                  <button
                    className="text-button"
                    onClick={() => {
                      setParams({ tab: 'example' })
                      window.scrollTo({ top: 0, behavior: 'smooth' })
                    }}
                  >
                    Open example
                    <ArrowRight size={16} />
                  </button>
                </div>
              </>
            )}
            {tab === 'example' && (
              <>
                {[lesson.example, ...(lesson.additionalExamples ?? [])].map((example) => (
                  <section className="example-section" key={example.title}>
                    <div className="section-kicker">
                      <Code2 size={15} />
                      PRACTICAL EXAMPLE
                    </div>
                    <h2>{example.title}</h2>
                    <div className="setup-note">
                      <Terminal size={17} />
                      <Markdown>{example.setup}</Markdown>
                    </div>
                    <CodeBlock
                      code={example.code}
                      language={example.language}
                      filename={example.filename}
                      downloadable
                    />
                    {example.output && (
                      <div className="expected-output">
                        <div className="section-kicker">
                          <Terminal size={14} />
                          EXPECTED OUTCOME
                        </div>
                        <pre>{example.output}</pre>
                      </div>
                    )}
                    <h3>What is happening here?</h3>
                    <ol className="walkthrough">
                      {example.explanation.map((line) => (
                        <li key={line}>
                          <Markdown>{line}</Markdown>
                        </li>
                      ))}
                    </ol>
                  </section>
                ))}
                <Exercise lesson={lesson} />
              </>
            )}
            {tab === 'interview' && (
              <>
                <InterviewTraps lesson={lesson} />
                <div className="concept-next">
                  <Target size={20} />
                  <div>
                    <strong>Make the distinction stick</strong>
                    <span>{lesson.quiz.question}</span>
                  </div>
                  <button className="text-button" onClick={() => setParams({ tab: 'quiz' })}>
                    Quick check
                    <ArrowRight size={16} />
                  </button>
                </div>
              </>
            )}
            {tab === 'quiz' && (
              <>
                <LessonQuiz lesson={lesson} key={lesson.id} />
                <Exercise lesson={lesson} />
              </>
            )}
          </div>
          <div className="lesson-references">
            <h3>Go to the source</h3>
            {lesson.references.map((reference) => (
              <a href={reference.url} key={reference.url} target="_blank" rel="noopener noreferrer">
                {reference.label}
                <ExternalLink size={13} />
              </a>
            ))}
          </div>
          <footer className="lesson-footer">
            <div>
              {previous ? (
                <Link className="text-button muted-button" to={`/learn/${previous.id}`}>
                  <ArrowLeft size={16} />
                  Previous lesson
                </Link>
              ) : (
                <span className="small-label">A strong foundation starts here.</span>
              )}
            </div>
            <div className="footer-actions">
              <button
                className={`button ${isComplete ? 'secondary completed-button' : 'primary'}`}
                onClick={complete}
              >
                <Check size={16} />
                {isComplete ? 'Completed' : 'Complete lesson'}
              </button>
              <Link className="button secondary" to={next ? `/learn/${next.id}` : '/roadmap'}>
                {next ? 'Next lesson' : 'Your roadmap'}
                <ArrowRight size={16} />
              </Link>
            </div>
          </footer>
        </article>
        <aside className="lesson-aside">
          <div className="lesson-aside-inner">
            <section className="on-this-page">
              <div className="rail-heading">IN THIS LESSON</div>
              <nav aria-label="Lesson sections">
                {lesson.sections.map((section, sectionIndex) => (
                  <button
                    key={section.title}
                    className={
                      tab === 'understand' && activeSection === sectionIndex ? 'current' : ''
                    }
                    onClick={() => showSection(sectionIndex)}
                    aria-current={
                      tab === 'understand' && activeSection === sectionIndex
                        ? 'location'
                        : undefined
                    }
                  >
                    <span>{String(sectionIndex + 1).padStart(2, '0')}</span>
                    {section.title}
                  </button>
                ))}
              </nav>
            </section>
            <section className="learning-outcomes">
              <div className="rail-heading">
                <Target size={14} />
                YOUR LEARNING GOALS
              </div>
              <ul>
                {lesson.outcomes.map((outcome) => (
                  <li key={outcome}>
                    <span className="goal-dot" />
                    {outcome}
                  </li>
                ))}
              </ul>
            </section>
            <section className="rail-interview">
              <div className="rail-heading">
                <TriangleAlert size={14} />
                INTERVIEW SPOTLIGHT
              </div>
              <h3>{lesson.traps[0].question}</h3>
              <button
                className="text-button"
                onClick={() => {
                  setParams({ tab: 'interview' })
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
              >
                Explore the trap
                <ArrowRight size={15} />
              </button>
            </section>
            <section className="rail-project">
              <div className="rail-heading">
                <Terminal size={14} />
                THE RUNNING PROJECT
              </div>
              <h3>
                TaskFlow<span>01 / 03</span>
              </h3>
              <p>From your first C# class to a production-minded API.</p>
              <div className="project-mini-path">
                <span>C#</span>
                <span className="mini-path-line" />
                <span>API</span>
                <span className="mini-path-line" />
                <span>Production</span>
              </div>
              <Link className="text-button" to="/projects">
                Open the workbench
                <ArrowRight size={15} />
              </Link>
            </section>
            <section className="lesson-notes">
              <label className="rail-heading" htmlFor="lesson-note">
                <NotepadText size={14} />
                MY NOTES
              </label>
              <textarea
                id="lesson-note"
                aria-label="Notes for this lesson"
                placeholder="Your thoughts, in your words."
                rows={5}
                maxLength={20000}
                value={progress.notes[lesson.id] ?? ''}
                onChange={(event) =>
                  dispatch({ type: 'note', id: lesson.id, value: event.target.value })
                }
              />
              <span className="save-status">
                {storageError ? 'Not saved to browser storage' : 'Stored on this device'}
              </span>
            </section>
          </div>
        </aside>
      </div>
    </div>
  )
}
