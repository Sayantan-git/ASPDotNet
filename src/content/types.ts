export type Accent = 'lime' | 'cyan' | 'coral' | 'gold'

export interface Lesson {
  id: string
  title: string
  subtitle: string
  minutes: number
  tags: string[]
  outcomes: string[]
  sections: { title: string; body: string; diagram?: Lesson['diagram'] }[]
  diagram: { title: string; source: string; caption: string }
  example: {
    title: string
    filename: string
    language: 'csharp' | 'bash' | 'sql' | 'json' | 'yaml' | 'docker' | 'xml' | 'razor' | 'http'
    setup: string
    code: string
    output?: string
    explanation: string[]
  }
  additionalExamples?: Lesson['example'][]
  traps: { question: string; answer: string; warning: string }[]
  exercise: { title: string; brief: string; steps: string[]; solution: string }
  quiz: { question: string; options: string[]; answer: number; explanation: string }
  references: { label: string; url: string }[]
}

export interface Chapter {
  id: string
  title: string
  description: string
  level: 'Beginner' | 'Intermediate' | 'Advanced'
  accent: Accent
  lessons: Lesson[]
}
