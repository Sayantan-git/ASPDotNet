import { useDeferredValue, useRef, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  BookmarkCheck,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  Download,
  ExternalLink,
  FileText,
  HardDrive,
  Library,
  ListChecks,
  NotebookPen,
  Rocket,
  Search,
  Server,
  Terminal,
  Upload,
} from 'lucide-react'
import {
  chapters,
  chapterById,
  lessonById,
  lessons,
  searchLessons,
  totalMinutes,
} from '../content/curriculum'
import { projects } from '../content/projects'
import {
  glossary,
  referenceLinks,
  specializations,
  studyReference,
  referenceCoverage,
  referenceCorrections,
  revisionPrompts,
  interviewScenarios,
} from '../content/reference'
import { parseBackup, quizStats } from '../lib/progress'
import type { Progress } from '../lib/progress'
import { useAppState } from '../state'
import { downloadText } from '../lib/browser'
import { CodeBlock, Dialog, EmptyState, IconButton, PageHeading, SegmentedControl } from './ui'

export function RoadmapPage() {
  const { progress } = useAppState()
  const [query, setQuery] = useState('')
  const [level, setLevel] = useState('all')
  const [incomplete, setIncomplete] = useState(false)
  const [expanded, setExpanded] = useState<string[]>([
    lessonById.get(progress.lastLesson)?.chapterId ?? chapters[0].id,
  ])
  const deferredQuery = useDeferredValue(query)
  const matching = new Set(searchLessons(deferredQuery).map((lesson) => lesson.id))
  const visible = chapters
    .filter((chapter) => level === 'all' || chapter.level === level)
    .map((chapter) => ({
      ...chapter,
      visibleLessons: chapter.lessons.filter(
        (lesson) =>
          matching.has(lesson.id) && (!incomplete || !progress.completed.includes(lesson.id)),
      ),
    }))
    .filter((chapter) => chapter.visibleLessons.length)
  const filtered = query.trim() || level !== 'all' || incomplete
  return (
    <div className="workspace-page">
      <PageHeading
        eyebrow="THE COMPLETE PATH"
        title="Your .NET learning path"
        description="First principles. Working code. Production decisions."
      >
        <Link className="button primary" to={`/learn/${progress.lastLesson}`}>
          Continue learning
          <ArrowRight size={17} />
        </Link>
      </PageHeading>
      <div className="metrics-strip">
        <div>
          <strong>{lessons.length}</strong>
          <span>In-depth lessons</span>
        </div>
        <div>
          <strong>{lessons.reduce((total, lesson) => total + lesson.traps.length, 0)}</strong>
          <span>Interview pitfalls</span>
        </div>
        <div>
          <strong>
            ~{Math.round(totalMinutes / 60)} <small>hr</small>
          </strong>
          <span>Estimated guided study</span>
        </div>
        <div>
          <strong>
            {progress.completed.length}
            <small> / {lessons.length}</small>
          </strong>
          <span>Marked complete</span>
        </div>
      </div>
      <div className="filter-toolbar">
        <label className="search-field">
          <Search size={17} />
          <input
            aria-label="Filter learning path"
            placeholder="Find a lesson or concept"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        <select
          aria-label="Lesson difficulty"
          value={level}
          onChange={(event) => setLevel(event.target.value)}
        >
          <option value="all">All levels</option>
          <option>Beginner</option>
          <option>Intermediate</option>
          <option>Advanced</option>
        </select>
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={incomplete}
            onChange={(event) => setIncomplete(event.target.checked)}
          />
          Not completed
        </label>
      </div>
      <div className="list-heading">
        <span>
          {visible.reduce((count, chapter) => count + chapter.visibleLessons.length, 0)} LESSONS
          <span className="inline-dot" />
          {visible.length} CHAPTERS
        </span>
        <button
          className="text-button"
          onClick={() =>
            setExpanded(
              expanded.length === chapters.length ? [] : chapters.map((chapter) => chapter.id),
            )
          }
        >
          {expanded.length === chapters.length ? 'Collapse all' : 'Expand all'}
          <ChevronDown size={15} />
        </button>
      </div>
      <div className="roadmap-list">
        {visible.map((chapter) => {
          const open = !!filtered || expanded.includes(chapter.id)
          const count = chapter.lessons.filter((lesson) =>
            progress.completed.includes(lesson.id),
          ).length
          const number = chapters.findIndex((item) => item.id === chapter.id) + 1
          return (
            <section className="roadmap-chapter" data-accent={chapter.accent} key={chapter.id}>
              <button
                className="chapter-summary"
                aria-expanded={open}
                onClick={() =>
                  setExpanded((current) =>
                    current.includes(chapter.id)
                      ? current.filter((id) => id !== chapter.id)
                      : [...current, chapter.id],
                  )
                }
              >
                <span className="roadmap-number">{String(number).padStart(2, '0')}</span>
                <span className="chapter-summary-text">
                  <span className="chapter-title">
                    {chapter.title}
                    <span className="level-tag">{chapter.level}</span>
                  </span>
                  <span className="chapter-description">{chapter.description}</span>
                </span>
                <span className="chapter-progress">{count} / 5</span>
                <ChevronDown size={17} className={open ? 'rotated' : ''} />
              </button>
              {open && (
                <div className="chapter-lessons">
                  {chapter.visibleLessons.map((lesson) => (
                    <Link to={`/learn/${lesson.id}`} className="roadmap-lesson" key={lesson.id}>
                      {progress.completed.includes(lesson.id) ? (
                        <CheckCircle2 size={18} className="color-lime" />
                      ) : (
                        <span className="lesson-node" />
                      )}
                      <span>{lesson.title}</span>
                      {progress.bookmarks.includes(lesson.id) && <Bookmark size={13} />}
                      <small>{lesson.minutes} min</small>
                      <ArrowRight size={15} />
                    </Link>
                  ))}
                </div>
              )}
            </section>
          )
        })}
      </div>
      {!visible.length && (
        <EmptyState icon={Search} title="No matching lessons">
          <button
            className="button secondary"
            onClick={() => {
              setQuery('')
              setLevel('all')
              setIncomplete(false)
            }}
          >
            Clear filters
          </button>
        </EmptyState>
      )}
    </div>
  )
}

const projectIcons = { terminal: Terminal, server: Server, rocket: Rocket }

export function ProjectsPage() {
  const { projectId } = useParams()
  const { progress, dispatch } = useAppState()
  const project = projects.find((item) => item.id === projectId)
  if (projectId && !project)
    return (
      <EmptyState icon={Terminal} title="Project not found">
        <Link to="/projects" className="button primary">
          All projects
          <ArrowRight size={16} />
        </Link>
      </EmptyState>
    )
  if (project)
    return (
      <div className="workspace-page project-detail" data-accent={project.accent}>
        <Link className="back-link" to="/projects">
          <ArrowLeft size={15} />
          All projects
        </Link>
        <PageHeading
          eyebrow={`${project.level.toUpperCase()} PROJECT`}
          title={project.title}
          description={project.subtitle}
        >
          <a
            className="button primary"
            href={`${import.meta.env.BASE_URL}taskflow-starter.zip`}
            download
          >
            <Download size={16} />
            Download starters
          </a>
        </PageHeading>
        <p className="project-brief">{project.brief}</p>
        <div className="stack-tags">
          {project.stack.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
        <CodeBlock code={project.commands} language="bash" filename="Terminal" />
        <div className="section-title-row">
          <h2>Build milestones</h2>
          <span>
            {project.milestones.filter((step) => progress.projectSteps.includes(step.id)).length} /{' '}
            {project.milestones.length} checked
          </span>
        </div>
        <p className="small-label milestone-disclaimer">Self-reported implementation checklist</p>
        <div className="milestone-list">
          {project.milestones.map((step, index) => (
            <section
              className={`milestone ${progress.projectSteps.includes(step.id) ? 'done' : ''}`}
              key={step.id}
            >
              <label className="milestone-check">
                <input
                  type="checkbox"
                  aria-label={`Complete milestone: ${step.title}`}
                  checked={progress.projectSteps.includes(step.id)}
                  onChange={() => dispatch({ type: 'project', id: step.id })}
                />
                <span>{String(index + 1).padStart(2, '0')}</span>
              </label>
              <div>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
                <ul>
                  {step.criteria.map((criterion) => (
                    <li key={criterion}>{criterion}</li>
                  ))}
                </ul>
                <Link className="text-button" to={`/learn/${step.lessonId}`}>
                  <BookOpen size={14} />
                  {lessonById.get(step.lessonId)?.title}
                  <ArrowRight size={14} />
                </Link>
              </div>
            </section>
          ))}
        </div>
      </div>
    )
  return (
    <div className="workspace-page">
      <PageHeading
        eyebrow="LEARN BY BUILDING"
        title="The project workbench"
        description="One idea. Three increasingly capable applications."
      >
        <a
          className="button primary"
          href={`${import.meta.env.BASE_URL}taskflow-starter.zip`}
          download
        >
          <Download size={16} />
          Download starters
        </a>
      </PageHeading>
      <div className="project-grid">
        {projects.map((item, index) => {
          const Icon = projectIcons[item.icon]
          const count = item.milestones.filter((step) =>
            progress.projectSteps.includes(step.id),
          ).length
          return (
            <article className="project-card" data-accent={item.accent} key={item.id}>
              <div className="project-card-top">
                <span className="project-icon">
                  <Icon size={28} strokeWidth={1.4} />
                </span>
                <span className="small-label">PROJECT {String(index + 1).padStart(2, '0')}</span>
              </div>
              <span className="level-tag">{item.level}</span>
              <h2>{item.title}</h2>
              <p>{item.subtitle}</p>
              <div className="stack-tags">
                {item.stack.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
              <div className="project-card-progress">
                <span>
                  {count} / {item.milestones.length} milestones
                </span>
                <progress
                  value={count}
                  max={item.milestones.length}
                  aria-label={`${item.title} milestone progress`}
                />
              </div>
              <Link to={`/projects/${item.id}`} className="project-card-link">
                Open project
                <ArrowRight size={17} />
              </Link>
            </article>
          )
        })}
      </div>
      <section className="project-principle">
        <div className="section-kicker">
          <ListChecks size={16} />
          THE STANDARD
        </div>
        <h2>Working behavior. Clear explanations.</h2>
        <div className="principle-grid">
          <div>
            <span>01</span>
            <h3>Build it</h3>
            <p>Implement a real workflow and its invalid-input paths.</p>
          </div>
          <div>
            <span>02</span>
            <h3>Verify it</h3>
            <p>Use focused tests and inspect the persisted result.</p>
          </div>
          <div>
            <span>03</span>
            <h3>Explain it</h3>
            <p>Name the tradeoff, the failure mode, and the next constraint.</p>
          </div>
        </div>
      </section>
    </div>
  )
}

export function NotebookPage() {
  const { progress, dispatch, storageError, notify } = useAppState()
  const [mode, setMode] = useState('all')
  const [query, setQuery] = useState('')
  const [pending, setPending] = useState<Progress | null>(null)
  const fileInput = useRef<HTMLInputElement>(null)
  const deferredQuery = useDeferredValue(query).toLowerCase().trim()
  const saved = lessons.filter((lesson) => {
    const note = progress.notes[lesson.id]
    const bookmarked = progress.bookmarks.includes(lesson.id)
    return (
      (mode === 'notes' ? !!note : mode === 'bookmarks' ? bookmarked : !!note || bookmarked) &&
      `${lesson.title} ${note ?? ''}`.toLowerCase().includes(deferredQuery)
    )
  })
  async function importFile(file?: File) {
    if (!file) return
    try {
      if (file.size > 2_000_000) throw new Error('Choose a .NET Atlas backup under 2 MB.')
      setPending(parseBackup(await file.text()))
    } catch (error) {
      notify(error instanceof Error ? error.message : 'The backup could not be read.')
    }
    if (fileInput.current) fileInput.current.value = ''
  }
  return (
    <div className="workspace-page notebook-page">
      <PageHeading
        eyebrow="YOUR KNOWLEDGE, IN YOUR WORDS"
        title="My notebook"
        description={`${Object.keys(progress.notes).length} lesson notes and ${progress.bookmarks.length} bookmarks.`}
      >
        <IconButton label="Import progress backup" onClick={() => fileInput.current?.click()}>
          <Upload size={19} />
        </IconButton>
        <button
          className="button secondary"
          onClick={() => {
            downloadText(
              `dotnet-atlas-progress-${new Date().toISOString().slice(0, 10)}.json`,
              JSON.stringify(progress, null, 2),
              'application/json',
            )
            notify('Progress backup prepared for download.')
          }}
        >
          <Download size={16} />
          Export backup
        </button>
        <input
          type="file"
          ref={fileInput}
          accept=".json,application/json"
          aria-label="Import progress backup file"
          className="visually-hidden"
          onChange={(event) => void importFile(event.target.files?.[0])}
        />
      </PageHeading>
      <div className="notebook-status">
        <HardDrive size={15} />
        <span>
          {storageError ? 'Session-only changes: browser storage unavailable' : 'On this device'}
        </span>
        <span className="notebook-score">
          {quizStats(progress).correct} / {quizStats(progress).attempted} latest quiz answers
          correct
        </span>
      </div>
      <div className="filter-toolbar">
        <SegmentedControl
          label="Notebook filter"
          value={mode}
          onChange={setMode}
          options={[
            { value: 'all', label: 'All saved' },
            { value: 'notes', label: 'Notes' },
            { value: 'bookmarks', label: 'Bookmarks' },
          ]}
        />
        <label className="search-field">
          <Search size={17} />
          <input
            aria-label="Search notebook"
            placeholder="Search your notes"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
      </div>
      <div className="saved-lessons">
        {saved.map((lesson) => (
          <section className="saved-lesson" key={lesson.id}>
            <div className="saved-lesson-heading">
              <div>
                <span className="section-kicker">{chapterById.get(lesson.chapterId)?.title}</span>
                <h2>
                  <Link to={`/learn/${lesson.id}`}>
                    {lesson.title}
                    <ArrowRight size={17} />
                  </Link>
                </h2>
              </div>
              <IconButton
                label={
                  progress.bookmarks.includes(lesson.id)
                    ? `Remove bookmark: ${lesson.title}`
                    : `Bookmark: ${lesson.title}`
                }
                onClick={() => dispatch({ type: 'bookmark', id: lesson.id })}
              >
                {progress.bookmarks.includes(lesson.id) ? (
                  <BookmarkCheck size={18} />
                ) : (
                  <Bookmark size={18} />
                )}
              </IconButton>
            </div>
            <textarea
              aria-label={`Notes: ${lesson.title}`}
              placeholder="Your notes for this lesson"
              rows={4}
              maxLength={20000}
              value={progress.notes[lesson.id] ?? ''}
              onChange={(event) =>
                dispatch({ type: 'note', id: lesson.id, value: event.target.value })
              }
            />
          </section>
        ))}
      </div>
      {!saved.length && (
        <EmptyState
          icon={NotebookPen}
          title={query ? 'No matching notes' : 'A little space for what clicks.'}
        >
          <p>
            {query
              ? 'No saved lesson matches this search.'
              : 'No notes or bookmarks in this view yet.'}
          </p>
          <Link className="button primary" to={`/learn/${progress.lastLesson}`}>
            Open a lesson
            <ArrowRight size={16} />
          </Link>
        </EmptyState>
      )}
      <Dialog
        open={pending !== null}
        onClose={() => setPending(null)}
        title="Restore your progress?"
      >
        <p className="dialog-copy">
          This replaces the progress and notes in this browser with the selected backup.
        </p>
        {pending && (
          <div className="restore-summary">
            <span>
              <strong>{pending.completed.length}</strong> completed lessons
            </span>
            <span>
              <strong>{Object.keys(pending.notes).length}</strong> notes
            </span>
            <span>
              <strong>{pending.bookmarks.length}</strong> bookmarks
            </span>
          </div>
        )}
        <div className="dialog-actions">
          <button className="button secondary" onClick={() => setPending(null)}>
            Cancel
          </button>
          <button
            className="button primary"
            onClick={() => {
              if (pending) dispatch({ type: 'restore', value: pending })
              setPending(null)
              notify('Progress and notes restored.')
            }}
          >
            <Upload size={15} />
            Restore backup
          </button>
        </div>
      </Dialog>
    </div>
  )
}

export function ReferencePage() {
  const [params, setParams] = useSearchParams()
  const requestedMode = params.get('view') ?? 'sources'
  const mode = ['sources', 'glossary', 'revision', 'review', 'deeper'].includes(requestedMode)
    ? requestedMode
    : 'sources'
  const [query, setQuery] = useState('')
  const deferredQuery = useDeferredValue(query).toLowerCase().trim()
  const terms = glossary
    .filter((item) => `${item.term} ${item.definition}`.toLowerCase().includes(deferredQuery))
    .sort((left, right) => left.term.localeCompare(right.term))
  return (
    <div className="workspace-page reference-page">
      <PageHeading
        eyebrow="KEEP THE ORIGINAL SOURCES CLOSE"
        title="The reference shelf"
        description="Official sources, practical revision, and the reviewed study reference."
      />
      <div className="version-banner">
        <img src={`${import.meta.env.BASE_URL}dotnet.svg`} width="50" height="38" alt=".NET" />
        <div>
          <strong>
            .NET 10 LTS <span className="inline-dot" /> C# 14
          </strong>
          <p>Course baseline: September 2026. .NET 10 support ends November 14, 2028.</p>
        </div>
        <a
          href="https://dotnet.microsoft.com/en-us/platform/support/policy/dotnet-core"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Read current .NET support policy"
        >
          <ExternalLink size={18} />
        </a>
      </div>
      <div className="filter-toolbar">
        <SegmentedControl
          label="Reference view"
          value={mode}
          onChange={(value) => setParams({ view: value })}
          options={[
            { value: 'sources', label: 'Official sources' },
            { value: 'glossary', label: 'Glossary' },
            { value: 'revision', label: 'Quick revision' },
            { value: 'review', label: 'PDF review' },
            { value: 'deeper', label: 'Go deeper' },
          ]}
        />
        {mode === 'glossary' && (
          <label className="search-field">
            <Search size={17} />
            <input
              aria-label="Search glossary"
              placeholder="Find a term"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
        )}
      </div>
      {mode === 'sources' && (
        <div className="resource-grid">
          {referenceLinks.map((item, index) => (
            <a
              className="resource-item"
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              key={item.title}
              data-accent={(['lime', 'cyan', 'gold', 'coral'] as const)[index % 4]}
            >
              <span className="resource-icon">
                <BookOpen size={22} strokeWidth={1.5} />
              </span>
              <div>
                <span className="section-kicker">{item.category}</span>
                <h2>{item.title}</h2>
                <p>{item.description}</p>
              </div>
              <ExternalLink size={16} />
            </a>
          ))}
        </div>
      )}
      {mode === 'glossary' && (
        <div className="glossary-list">
          {terms.map((item) => (
            <section key={item.term}>
              <h2>{item.term}</h2>
              <div>
                <p>{item.definition}</p>
                <Link className="text-button" to={`/learn/${item.lessonId}`}>
                  Study the concept
                  <ArrowRight size={14} />
                </Link>
              </div>
            </section>
          ))}
          {!terms.length && <EmptyState icon={Search} title="No matching terms" />}
        </div>
      )}
      {mode === 'revision' && (
        <section className="reference-revision">
          <div className="reference-section-heading">
            <span className="section-kicker">INTERVIEW DAY</span>
            <h2>Rapid recall, with the caveats intact</h2>
            <p>A short answer should explain a mechanism, not replace it with a slogan.</p>
          </div>
          <div className="glossary-list">
            {revisionPrompts.map((item) => (
              <section key={item.title}>
                <h2>{item.title}</h2>
                <div>
                  <p>{item.answer}</p>
                  <Link className="text-button" to={`/learn/${item.lessonId}`}>
                    Review the lesson
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </section>
            ))}
          </div>
          <div className="reference-section-heading">
            <span className="section-kicker">SIX PRODUCTION SCENARIOS</span>
            <h2>Reason through the situation</h2>
            <p>Clarify assumptions, choose a discriminating check, and explain the tradeoff.</p>
          </div>
          {interviewScenarios.map((item) => (
            <details className="solution reference-scenario" key={item.title}>
              <summary>
                <FileText size={17} />
                {item.title}
                <ChevronDown size={16} />
              </summary>
              <p className="scenario-prompt">{item.prompt}</p>
              <p>{item.answer}</p>
              <p className="scenario-follow-up">
                <strong>Follow-up:</strong> {item.followUp}
              </p>
              <Link className="text-button" to={`/learn/${item.lessonId}`}>
                Study the underlying concept
                <ArrowRight size={14} />
              </Link>
            </details>
          ))}
        </section>
      )}
      {mode === 'review' && (
        <section className="reference-review">
          <div className="reference-section-heading">
            <span className="section-kicker">ATTACHED REFERENCE REVIEW</span>
            <h2>{studyReference.title}</h2>
            <p>
              {studyReference.pageCount} pages reviewed. Source: {studyReference.issued}. Review:{' '}
              {studyReference.reviewed}.
            </p>
          </div>
          <div className="reference-note">
            <FileText size={21} />
            <p>{studyReference.description}</p>
          </div>
          <div className="reference-section-heading">
            <h2>Where the material lives</h2>
            <p>The original lesson links and saved progress remain unchanged.</p>
          </div>
          <div className="source-coverage-list">
            {referenceCoverage.map((item) => (
              <section className="source-coverage" key={item.title}>
                <div>
                  <span className="section-kicker">
                    PDF PAGES {item.pages[0]}-{item.pages[1]}
                  </span>
                  <h3>{item.title}</h3>
                  <p>{item.summary}</p>
                </div>
                <nav aria-label={`${item.title} lesson links`}>
                  {item.lessonIds.map((id) => (
                    <Link key={id} to={`/learn/${id}`}>
                      <BookOpen size={13} />
                      <span>{lessonById.get(id)?.title}</span>
                      <ArrowRight size={13} />
                    </Link>
                  ))}
                </nav>
              </section>
            ))}
          </div>
          <div className="reference-section-heading">
            <span className="section-kicker">IMPORTANT DISTINCTIONS</span>
            <h2>Corrections worth remembering</h2>
            <p>
              The reference is a study checklist, not an authority for every framework or database.
            </p>
          </div>
          <div className="reference-corrections">
            {referenceCorrections.map((item) => (
              <section key={item.title}>
                <span className="section-kicker">PDF PAGES {item.pages}</span>
                <h3>{item.title}</h3>
                <p>{item.detail}</p>
                <Link className="text-button" to={`/learn/${item.lessonId}`}>
                  Read the explanation
                  <ArrowRight size={14} />
                </Link>
              </section>
            ))}
          </div>
        </section>
      )}
      {mode === 'deeper' && (
        <>
          <div className="reference-note">
            <Library size={21} />
            <p>
              Specialist paths beyond the core course. Choose the depth your role needs; these are
              external study resources, not additional completed lessons.
            </p>
          </div>
          <div className="specialization-list">
            {specializations.map((item) => (
              <a key={item.title} href={item.url} target="_blank" rel="noopener noreferrer">
                <FileText size={20} />
                <div>
                  <h2>{item.title}</h2>
                  <p>{item.description}</p>
                </div>
                <ExternalLink size={16} />
              </a>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
