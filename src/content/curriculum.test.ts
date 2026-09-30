import { describe, expect, it } from 'vitest'
import { chapters, lessons, searchLessons } from './curriculum'
import {
  glossary,
  interviewScenarios,
  referenceCorrections,
  referenceCoverage,
  revisionPrompts,
  studyReference,
} from './reference'

describe('authored curriculum', () => {
  it('contains all twelve planned chapters and sixty lessons', () => {
    expect(chapters).toHaveLength(12)
    expect(lessons).toHaveLength(60)
    expect(chapters.every((chapter) => chapter.lessons.length === 5)).toBe(true)
  })

  it('has unique, URL-safe chapter and lesson identifiers', () => {
    expect(new Set(chapters.map((chapter) => chapter.id)).size).toBe(chapters.length)
    expect(new Set(lessons.map((lesson) => lesson.id)).size).toBe(lessons.length)
    for (const lesson of lessons) expect(lesson.id).toMatch(/^[a-z0-9-]+$/)
  })

  it.each(lessons)('$id contains teaching, practice, diagrams, and references', (lesson) => {
    expect(lesson.sections.length).toBeGreaterThanOrEqual(3)
    expect(lesson.sections.map((section) => section.body).join('').length).toBeGreaterThan(1500)
    expect(lesson.outcomes.length).toBeGreaterThanOrEqual(3)
    for (const example of [lesson.example, ...(lesson.additionalExamples ?? [])]) {
      expect(example.code.length).toBeGreaterThan(50)
      expect(example.setup.length).toBeGreaterThan(30)
      expect(example.explanation.length).toBeGreaterThanOrEqual(2)
    }
    for (const diagram of [
      lesson.diagram,
      ...lesson.sections.flatMap((section) => (section.diagram ? [section.diagram] : [])),
    ]) {
      expect(diagram.source).toMatch(/^(flowchart|sequenceDiagram|classDiagram|erDiagram)/)
      expect(diagram.caption.length).toBeGreaterThan(20)
    }
    expect(lesson.traps.length).toBeGreaterThanOrEqual(2)
    expect(lesson.exercise.steps.length).toBeGreaterThanOrEqual(2)
    expect(lesson.exercise.solution.length).toBeGreaterThan(70)
    expect(lesson.quiz.options).toHaveLength(4)
    expect(new Set(lesson.quiz.options).size).toBe(4)
    expect(lesson.quiz.answer).toBeGreaterThanOrEqual(0)
    expect(lesson.quiz.answer).toBeLessThan(4)
    expect(lesson.quiz.explanation.length).toBeGreaterThan(80)
    expect(lesson.references.length).toBeGreaterThanOrEqual(1)
    for (const reference of lesson.references)
      expect(new URL(reference.url).protocol).toBe('https:')
  })

  it('searches concepts and traps, not just titles', () => {
    expect(searchLessons('JIT').some((lesson) => lesson.id === 'dotnet-ecosystem')).toBe(true)
    expect(searchLessons('  HTTP   TLS ').some((lesson) => lesson.id === 'http-fundamentals')).toBe(
      true,
    )
    expect(searchLessons('xyz-no-matching-concept')).toEqual([])
    expect(searchLessons('')).toHaveLength(lessons.length)
  })

  it('indexes the SQL reference additions without changing existing lesson IDs', () => {
    for (const concept of ['DENSE_RANK', 'CTE', 'TRUNCATE', 'BCNF', 'deadlock', 'COALESCE']) {
      expect(searchLessons(concept).some((lesson) => lesson.id === 'sql-and-relational-data')).toBe(
        true,
      )
    }
  })

  it('indexes the reference configuration, mapping, and identity topics', () => {
    const concepts = [
      ['launchSettings.json', 'hosting-and-configuration'],
      ['AutoMapper', 'validation-and-problem-details'],
      ['SSO', 'cookies-jwt-and-oidc'],
      ['SAML', 'cookies-jwt-and-oidc'],
      ['refresh rotation', 'cookies-jwt-and-oidc'],
      ['stored procedures', 'concurrency-and-data-access'],
    ]
    for (const [concept, id] of concepts) {
      expect(searchLessons(concept).some((lesson) => lesson.id === id)).toBe(true)
    }
  })

  it('maps the supplied reference and revision prompts to existing lessons', () => {
    expect(studyReference.pageCount).toBe(41)
    expect(referenceCoverage).toHaveLength(13)
    expect(interviewScenarios).toHaveLength(6)
    const knownIds = new Set(lessons.map((lesson) => lesson.id))
    const coveredPages = new Set<number>()
    for (const item of referenceCoverage) {
      expect(item.pages[0]).toBeGreaterThanOrEqual(1)
      expect(item.pages[1]).toBeLessThanOrEqual(studyReference.pageCount)
      expect(item.pages[1]).toBeGreaterThanOrEqual(item.pages[0])
      for (let page = item.pages[0]; page <= item.pages[1]; page++) coveredPages.add(page)
      for (const id of item.lessonIds) expect(knownIds.has(id)).toBe(true)
    }
    expect(coveredPages.size).toBe(41)
    for (const item of [
      ...glossary,
      ...interviewScenarios,
      ...referenceCorrections,
      ...revisionPrompts,
    ]) {
      expect(knownIds.has(item.lessonId)).toBe(true)
    }
    expect(new Set(glossary.map((item) => item.term)).size).toBe(glossary.length)
  })
})
