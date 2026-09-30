import { useEffect, useId, useRef, useState } from 'react'
import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Check, Copy, Download, Expand, LoaderCircle, Network, X } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import Prism from 'prismjs'
import 'prismjs/components/prism-csharp'
import 'prismjs/components/prism-bash'
import 'prismjs/components/prism-sql'
import 'prismjs/components/prism-json'
import 'prismjs/components/prism-yaml'
import 'prismjs/components/prism-docker'
import 'prismjs/components/prism-http'
import { useAppState } from '../state'
import { downloadText } from '../lib/browser'
import type { Lesson } from '../content/types'

export function IconButton({
  label,
  children,
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return (
    <button
      type="button"
      className={`icon-button ${className}`}
      aria-label={label}
      data-tooltip={label}
      {...props}
    >
      {children}
    </button>
  )
}

export function Dialog({
  open,
  onClose,
  title,
  children,
  className = '',
}: {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  className?: string
}) {
  const dialog = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  useEffect(() => {
    const element = dialog.current
    if (!element) return
    if (open && !element.open) element.showModal()
    if (!open && element.open) element.close()
  }, [open])
  return (
    <dialog
      ref={dialog}
      className={`dialog ${className}`}
      aria-labelledby={titleId}
      onCancel={onClose}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div className="dialog-inner">
        <div className="dialog-heading">
          <h2 id={titleId}>{title}</h2>
          <IconButton label="Close dialog" onClick={onClose}>
            <X size={19} />
          </IconButton>
        </div>
        {open && children}
      </div>
    </dialog>
  )
}

export function Markdown({ children }: { children: string }) {
  return (
    <div className="prose">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ children: label, ...props }) => (
            <a {...props} target="_blank" rel="noopener noreferrer">
              {label}
            </a>
          ),
          table: ({ children: rows }) => (
            <div className="table-scroll" tabIndex={0} aria-label="Comparison table">
              <table>{rows}</table>
            </div>
          ),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  )
}

export function CodeBlock({
  code,
  language = 'csharp',
  filename = 'Program.cs',
  downloadable = false,
}: {
  code: string
  language?: string
  filename?: string
  downloadable?: boolean
}) {
  const { notify } = useAppState()
  const [copied, setCopied] = useState(false)
  const grammarName = language === 'xml' || language === 'razor' ? 'markup' : language
  const highlighted = Prism.highlight(
    code,
    Prism.languages[grammarName] ?? Prism.languages.plain,
    grammarName,
  )
  useEffect(() => {
    if (!copied) return
    const timer = setTimeout(() => setCopied(false), 2000)
    return () => clearTimeout(timer)
  }, [copied])
  async function copy() {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      notify('Code copied to clipboard.')
    } catch {
      notify('Clipboard access was blocked. Select the code or download the example.')
    }
  }
  return (
    <div className="code-block">
      <div className="code-toolbar">
        <span className="code-filename">
          <span className="code-file-dot" />
          {filename}
        </span>
        <div className="code-tools">
          <span className="code-language">{language === 'csharp' ? 'C#' : language}</span>
          {downloadable && (
            <IconButton label="Download code" onClick={() => downloadText(filename, code)}>
              <Download size={15} />
            </IconButton>
          )}
          <IconButton label={copied ? 'Code copied' : 'Copy code'} onClick={copy}>
            {copied ? <Check size={15} /> : <Copy size={15} />}
          </IconButton>
        </div>
      </div>
      <pre tabIndex={0} aria-label={`${filename} code`}>
        <code
          className={`language-${grammarName}`}
          dangerouslySetInnerHTML={{ __html: highlighted }}
        />
      </pre>
    </div>
  )
}

let enginePromise: Promise<(typeof import('mermaid'))['default']> | undefined
function diagramEngine() {
  enginePromise ??= import('mermaid').then(({ default: engine }) => {
    engine.initialize({
      startOnLoad: false,
      securityLevel: 'strict',
      suppressErrorRendering: true,
      theme: 'base',
      fontFamily: 'Manrope',
      themeVariables: {
        darkMode: true,
        background: '#14191b',
        primaryColor: '#223328',
        primaryTextColor: '#edf4e6',
        primaryBorderColor: '#819e60',
        secondaryColor: '#183239',
        tertiaryColor: '#292a20',
        lineColor: '#7a8d82',
        textColor: '#dde5df',
        fontSize: '13px',
        actorBkg: '#1b292b',
        actorBorder: '#527d77',
        actorTextColor: '#d6f1ea',
        signalColor: '#a6c5bc',
        signalTextColor: '#dce7df',
        noteBkgColor: '#303023',
        noteTextColor: '#e8dfbe',
        noteBorderColor: '#827953',
        labelTextColor: '#e1e9e1',
        edgeLabelBackground: '#14191b',
        attributeBackgroundColorOdd: '#192224',
        attributeBackgroundColorEven: '#20292b',
      },
      flowchart: { htmlLabels: false, curve: 'basis', padding: 18 },
    })
    return engine
  })
  return enginePromise
}

export function Diagram({
  diagram,
  expanded = false,
}: {
  diagram: Lesson['diagram']
  expanded?: boolean
}) {
  const [svg, setSvg] = useState('')
  const [error, setError] = useState(false)
  const [open, setOpen] = useState(false)
  const reactId = useId()
  const id = `diagram${reactId.replace(/[^a-zA-Z0-9]/g, '')}`
  useEffect(() => {
    let active = true
    diagramEngine()
      .then((engine) => engine.render(id, diagram.source))
      .then((result) => {
        if (active) setSvg(result.svg)
      })
      .catch(() => {
        if (active) setError(true)
      })
    return () => {
      active = false
    }
  }, [id, diagram.source])
  return (
    <>
      <figure className={`diagram ${expanded ? 'diagram-large' : ''}`}>
        <div className="diagram-toolbar">
          <span>
            <Network size={16} />
            {diagram.title}
          </span>
          {!expanded && (
            <IconButton label="Enlarge diagram" onClick={() => setOpen(true)}>
              <Expand size={15} />
            </IconButton>
          )}
        </div>
        {error ? (
          <div className="diagram-fallback" role="status">
            Diagram unavailable.<p>{diagram.caption}</p>
            <pre>{diagram.source}</pre>
          </div>
        ) : svg ? (
          <div
            className="diagram-canvas"
            role="img"
            aria-label={diagram.title}
            dangerouslySetInnerHTML={{ __html: svg }}
          />
        ) : (
          <div className="diagram-loading">
            <LoaderCircle size={20} className="spin" />
            <span>Rendering diagram</span>
          </div>
        )}
        <figcaption>
          <span className="diagram-caption-line" />
          {diagram.caption}
        </figcaption>
      </figure>
      {!expanded && (
        <Dialog
          open={open}
          onClose={() => setOpen(false)}
          title={diagram.title}
          className="diagram-dialog"
        >
          <Diagram diagram={diagram} expanded />
        </Dialog>
      )}
    </>
  )
}

export function EmptyState({
  icon: Icon,
  title,
  children,
}: {
  icon: LucideIcon
  title: string
  children?: ReactNode
}) {
  return (
    <div className="empty-state">
      <Icon size={32} strokeWidth={1.3} />
      <h2>{title}</h2>
      {children}
    </div>
  )
}

export function PageHeading({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string
  title: string
  description: string
  children?: ReactNode
}) {
  return (
    <header className="page-heading">
      <div>
        <div className="eyebrow">
          <span className="status-dot" />
          {eyebrow}
        </div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {children && <div className="heading-actions">{children}</div>}
    </header>
  )
}

export function SegmentedControl({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: { value: string; label: string }[]
  onChange: (value: string) => void
}) {
  return (
    <div className="segmented-control" role="group" aria-label={label}>
      {options.map((option) => (
        <button
          key={option.value}
          aria-pressed={value === option.value}
          className={value === option.value ? 'selected' : ''}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
