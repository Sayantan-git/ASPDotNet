import { startTransition, useDeferredValue, useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import {
  HashRouter,
  Link,
  Navigate,
  NavLink,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from 'react-router-dom'
import {
  ArrowRight,
  BookOpen,
  BrainCircuit,
  Check,
  ChevronDown,
  ChevronRight,
  Code2,
  Command,
  ExternalLink,
  Layers3,
  Library,
  Menu,
  NotebookPen,
  Search,
  Terminal,
  TriangleAlert,
  X,
} from 'lucide-react'
import { chapters, chapterById, lessonById, lessons, searchLessons } from './content/curriculum'
import { useAppState } from './state'
import { AppStateProvider } from './components/StateProvider'
import { LessonPage } from './components/LessonPage'
import { NotebookPage, ProjectsPage, ReferencePage, RoadmapPage } from './components/WorkspaceViews'
import { PracticePage } from './components/PracticePage'
import { Dialog, EmptyState, IconButton } from './components/ui'

function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { progress } = useAppState()
  const location = useLocation()
  const currentLesson = lessonById.get(location.pathname.split('/')[2])
  const [chapterSelection, setChapterSelection] = useState<{
    lessonId?: string
    chapterId: string | null
  }>({ lessonId: currentLesson?.id, chapterId: currentLesson?.chapterId ?? chapters[0].id })
  const openedChapter =
    chapterSelection.lessonId === currentLesson?.id
      ? chapterSelection.chapterId
      : (currentLesson?.chapterId ?? chapters[0].id)
  const setOpenedChapter = (chapterId: string | null) =>
    setChapterSelection({ lessonId: currentLesson?.id, chapterId })
  const percentage = Math.round((progress.completed.length / lessons.length) * 100)
  return (
    <div className="sidebar-inner">
      <Link
        to={`/learn/${progress.lastLesson}`}
        className="brand"
        aria-label=".NET Atlas home"
        onClick={onNavigate}
      >
        <span className="brand-mark">
          <img src={`${import.meta.env.BASE_URL}dotnet.svg`} width="36" height="36" alt="" />
        </span>
        <span>
          Atlas<span className="brand-label">THE .NET LEARNING WORKSPACE</span>
        </span>
      </Link>
      <div className="sidebar-scroll">
        <div className="sidebar-label">YOUR WORKSPACE</div>
        <nav className="primary-nav" aria-label="Workspace">
          <NavLink
            to="/roadmap"
            className={({ isActive }) =>
              isActive || !!currentLesson ? 'nav-link active' : 'nav-link'
            }
            onClick={onNavigate}
          >
            <Layers3 size={18} />
            <span>Learning path</span>
            <span className="nav-counter">12</span>
          </NavLink>
          <NavLink to="/practice" className="nav-link" onClick={onNavigate}>
            <BrainCircuit size={18} />
            <span>Practice room</span>
          </NavLink>
          <NavLink to="/projects" className="nav-link" onClick={onNavigate}>
            <Terminal size={18} />
            <span>Project workbench</span>
          </NavLink>
          <NavLink to="/notebook" className="nav-link" onClick={onNavigate}>
            <NotebookPen size={18} />
            <span>My notebook</span>
            {progress.bookmarks.length > 0 && (
              <span className="nav-counter">{progress.bookmarks.length}</span>
            )}
          </NavLink>
        </nav>
        <div className="sidebar-section-heading">
          <span className="sidebar-label">THE CURRICULUM</span>
          <span>60 lessons</span>
        </div>
        <nav className="curriculum-nav" aria-label="Course chapters">
          {chapters.map((chapter, index) => {
            const open = openedChapter === chapter.id
            const complete = chapter.lessons.every((lesson) =>
              progress.completed.includes(lesson.id),
            )
            return (
              <div
                className={`sidebar-chapter ${open ? 'open' : ''}`}
                key={chapter.id}
                data-accent={chapter.accent}
              >
                <button
                  className="sidebar-chapter-toggle"
                  aria-expanded={open}
                  onClick={() => setOpenedChapter(open ? null : chapter.id)}
                >
                  <span className="chapter-nav-number">
                    {complete ? <Check size={13} /> : String(index + 1).padStart(2, '0')}
                  </span>
                  <span>{chapter.title}</span>
                  <ChevronDown size={12} className={open ? 'rotated' : ''} />
                </button>
                {open && (
                  <div className="sidebar-lesson-list">
                    {chapter.lessons.map((lesson) => (
                      <NavLink
                        to={`/learn/${lesson.id}`}
                        key={lesson.id}
                        className="sidebar-lesson"
                        onClick={onNavigate}
                      >
                        <span
                          className={`sidebar-lesson-dot ${progress.completed.includes(lesson.id) ? 'done' : ''}`}
                        >
                          {progress.completed.includes(lesson.id) && <Check size={9} />}
                        </span>
                        <span>{lesson.title}</span>
                        {currentLesson?.id === lesson.id && (
                          <span className="current-lesson-marker" />
                        )}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </nav>
        <NavLink to="/reference" className="nav-link reference-nav" onClick={onNavigate}>
          <Library size={18} />
          <span>Reference shelf</span>
          <ExternalLink size={13} />
        </NavLink>
      </div>
      <div className="sidebar-footer">
        <div className="course-progress">
          <div
            className="progress-ring"
            style={{ '--progress': `${percentage}%` } as CSSProperties}
          >
            <span>
              {percentage}
              <small>%</small>
            </span>
          </div>
          <div>
            <strong>Your progress</strong>
            <span>
              {progress.completed.length} of {lessons.length} lessons
            </span>
          </div>
        </div>
        <div className="sidebar-footer-meta">
          <span className="status-dot" />A little progress, every day.
        </div>
      </div>
    </div>
  )
}

function SearchContent({ onClose }: { onClose: () => void }) {
  const { progress } = useAppState()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const deferred = useDeferredValue(query)
  const [selected, setSelected] = useState(0)
  const found = deferred.trim()
    ? searchLessons(deferred)
    : lessons.filter((lesson) =>
        [
          progress.lastLesson,
          'async-and-await',
          'dependency-injection',
          'middleware-pipeline',
          'concurrency-and-data-access',
        ].includes(lesson.id),
      )
  const results = found.slice(0, 12)
  function open(id: string) {
    startTransition(() => navigate(`/learn/${id}`))
    onClose()
  }
  return (
    <div className="search-dialog-content">
      <div className="command-search">
        <Search size={21} />
        <input
          autoFocus
          placeholder="Search C#, ASP.NET, a concept..."
          aria-label="Search lessons"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={results.length > 0}
          aria-controls="search-results"
          aria-activedescendant={results[selected] ? `search-${results[selected].id}` : undefined}
          value={query}
          onChange={(event) => {
            setQuery(event.target.value)
            setSelected(0)
          }}
          onKeyDown={(event) => {
            if (event.key === 'ArrowDown') {
              event.preventDefault()
              setSelected((index) => Math.min(index + 1, results.length - 1))
            }
            if (event.key === 'ArrowUp') {
              event.preventDefault()
              setSelected((index) => Math.max(0, index - 1))
            }
            if (event.key === 'Enter' && results[selected]) {
              event.preventDefault()
              open(results[selected].id)
            }
          }}
        />
        {query && (
          <IconButton
            label="Clear search"
            onClick={() => {
              setQuery('')
              setSelected(0)
            }}
          >
            <X size={16} />
          </IconButton>
        )}
      </div>
      <div className="search-results-label">
        {deferred.trim() ? `${found.length} matching lessons` : 'CONTINUE OR EXPLORE'}
      </div>
      <div
        id="search-results"
        role="listbox"
        aria-label="Matching lessons"
        className="search-results"
      >
        {results.map((lesson, index) => (
          <button
            role="option"
            aria-selected={selected === index}
            id={`search-${lesson.id}`}
            className={selected === index ? 'selected' : ''}
            key={lesson.id}
            onClick={() => open(lesson.id)}
            onMouseEnter={() => setSelected(index)}
          >
            <span className="search-result-icon">
              <BookOpen size={17} />
            </span>
            <span>
              <strong>{lesson.title}</strong>
              <small>{chapterById.get(lesson.chapterId)?.title}</small>
            </span>
            <ArrowRight size={15} />
          </button>
        ))}
      </div>
      {!results.length && (
        <div className="search-no-results">
          <Search size={24} />
          <h3>No matching concepts</h3>
          <p>Try a broader term such as async, HTTP, or SQL.</p>
        </div>
      )}
    </div>
  )
}

function RouteEffects() {
  const location = useLocation()
  const previousPath = useRef(location.pathname)
  useEffect(() => {
    const lesson = lessonById.get(location.pathname.split('/')[2])
    const names: Record<string, string> = {
      '/roadmap': 'Learning path',
      '/practice': 'Practice room',
      '/projects': 'Project workbench',
      '/notebook': 'My notebook',
      '/reference': 'Reference shelf',
    }
    document.title = `${lesson?.title ?? names[location.pathname] ?? 'Learn C# & ASP.NET Core'} | .NET Atlas`
    if (previousPath.current !== location.pathname) {
      window.scrollTo({ top: 0 })
      document.getElementById('main-content')?.focus({ preventScroll: true })
      previousPath.current = location.pathname
    }
  }, [location.pathname])
  return null
}

function Shell() {
  const { progress, storageError } = useAppState()
  const [searchOpen, setSearchOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  useEffect(() => {
    function shortcut(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setSearchOpen((open) => !open)
      }
    }
    window.addEventListener('keydown', shortcut)
    return () => window.removeEventListener('keydown', shortcut)
  }, [])
  return (
    <div className="app-shell">
      <a
        href="#main-content"
        className="skip-link"
        onClick={(event) => {
          event.preventDefault()
          document.getElementById('main-content')?.focus()
        }}
      >
        Skip to content
      </a>
      <aside className="desktop-sidebar">
        <Sidebar />
      </aside>
      <div className="app-main">
        <header className="topbar">
          <div className="topbar-heading">
            <IconButton
              className="mobile-menu-button"
              label="Open navigation"
              onClick={() => setMenuOpen(true)}
            >
              <Menu size={21} />
            </IconButton>
            <span className="workspace-symbol">
              <Code2 size={19} />
            </span>
            <span className="workspace-name">C# & ASP.NET Core</span>
            <ChevronRight size={13} className="topbar-divider" />
            <span className="workspace-subtitle">Learning workspace</span>
          </div>
          <div className="topbar-actions">
            <button
              className="global-search-button"
              onClick={() => setSearchOpen(true)}
              aria-label="Search the course"
            >
              <Search size={16} />
              <span>Search anything</span>
              <kbd>
                <Command size={11} /> K
              </kbd>
            </button>
            <span className="version-pill">
              <span className="status-dot" />
              .NET 10 LTS
            </span>
            <Link className="profile-link" to="/notebook" aria-label="Open my notebook">
              <NotebookPen size={18} />
            </Link>
          </div>
        </header>
        {storageError && (
          <div className="storage-alert" role="alert">
            <TriangleAlert size={18} />
            <span>{storageError}</span>
            <Link to="/notebook">
              Backup options
              <ArrowRight size={14} />
            </Link>
          </div>
        )}
        <main id="main-content" tabIndex={-1}>
          <RouteEffects />
          <Routes>
            <Route path="/" element={<Navigate to={`/learn/${progress.lastLesson}`} replace />} />
            <Route path="/learn/:id" element={<LessonPage />} />
            <Route path="/roadmap" element={<RoadmapPage />} />
            <Route path="/practice" element={<PracticePage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/projects/:projectId" element={<ProjectsPage />} />
            <Route path="/notebook" element={<NotebookPage />} />
            <Route path="/reference" element={<ReferencePage />} />
            <Route
              path="*"
              element={
                <EmptyState icon={BookOpen} title="This page is off the path.">
                  <Link className="button primary" to="/roadmap">
                    Open the learning path
                    <ArrowRight size={16} />
                  </Link>
                </EmptyState>
              }
            />
          </Routes>
        </main>
        <footer className="app-footer">
          <span>
            .NET Atlas
            <span className="inline-dot" />
            Built for understanding.
          </span>
          <Link to="/reference">
            Sources & further reading
            <ArrowRight size={13} />
          </Link>
        </footer>
      </div>
      <Dialog
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        title="Find your next connection"
        className="search-dialog"
      >
        <SearchContent onClose={() => setSearchOpen(false)} />
      </Dialog>
      <Dialog
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        title="Your workspace"
        className="mobile-nav-dialog"
      >
        <Sidebar onNavigate={() => setMenuOpen(false)} />
      </Dialog>
    </div>
  )
}

export default function App() {
  return (
    <HashRouter>
      <AppStateProvider>
        <Shell />
      </AppStateProvider>
    </HashRouter>
  )
}
