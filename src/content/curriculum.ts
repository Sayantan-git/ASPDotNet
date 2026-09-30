import { foundations } from './chapters/foundations'
import { csharp } from './chapters/csharp'
import { objects } from './chapters/objects'
import { language } from './chapters/language'
import { aspnet } from './chapters/aspnet'
import { apis } from './chapters/apis'
import { data } from './chapters/data'
import { security } from './chapters/security'
import { webui } from './chapters/webui'
import { quality } from './chapters/quality'
import { architecture } from './chapters/architecture'
import { shipping } from './chapters/shipping'
import type { Chapter } from './types'

export const chapters: Chapter[] = [
  foundations,
  csharp,
  objects,
  language,
  aspnet,
  apis,
  data,
  security,
  webui,
  quality,
  architecture,
  shipping,
]
export const lessons = chapters.flatMap((chapter) =>
  chapter.lessons.map((lesson) => ({ ...lesson, chapterId: chapter.id })),
)
export type CourseLesson = (typeof lessons)[number]
export const lessonById = new Map(lessons.map((lesson) => [lesson.id, lesson]))
export const chapterById = new Map(chapters.map((chapter) => [chapter.id, chapter]))
export const totalMinutes = lessons.reduce((total, lesson) => total + lesson.minutes, 0)

export function searchLessons(query: string) {
  const terms = query.toLocaleLowerCase().trim().split(/\s+/).filter(Boolean)
  if (!terms.length) return lessons
  return lessons.filter((lesson) => {
    const searchable = [
      lesson.title,
      lesson.subtitle,
      ...lesson.tags,
      ...lesson.sections.map((section) => `${section.title} ${section.body}`),
      ...lesson.traps.map((trap) => `${trap.question} ${trap.answer}`),
    ]
      .join(' ')
      .toLocaleLowerCase()
    return terms.every((term) => searchable.includes(term))
  })
}
