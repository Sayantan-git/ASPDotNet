import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { readFile } from 'node:fs/promises'
import { unzipSync } from 'fflate'
import { lessons } from '../src/content/curriculum'
import { emptyProgress, STORAGE_KEY } from '../src/lib/progress'

test('lesson tabs, code, notes, bookmarks, and completion persist', async ({ page }) => {
  await page.goto('/#/learn/dotnet-ecosystem')
  await expect(
    page.getByRole('heading', { name: '.NET, C# & ASP.NET Core', exact: true }),
  ).toBeVisible()
  await expect(page.locator('.diagram-canvas svg')).toBeVisible()
  await page.getByRole('button', { name: 'Bookmark lesson', exact: true }).click()
  await page
    .getByRole('textbox', { name: 'Notes for this lesson' })
    .fill('C# is the language; .NET is the platform.')
  await page.getByRole('button', { name: 'Complete lesson', exact: true }).click()
  await page.reload()
  await expect(page.getByRole('button', { name: 'Remove bookmark', exact: true })).toBeVisible()
  await expect(page.getByRole('textbox', { name: 'Notes for this lesson' })).toHaveValue(
    'C# is the language; .NET is the platform.',
  )
  await expect(page.getByRole('button', { name: 'Completed', exact: true })).toBeVisible()
  await page.getByRole('tab', { name: 'Code example' }).click()
  await expect(page.locator('.code-block code')).toContainText('Environment.Version.Major')
  const downloadEvent = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Download code', exact: true }).click()
  const download = await downloadEvent
  expect(download.suggestedFilename()).toBe('Program.cs')
  await page.getByRole('tab', { name: 'Interview traps' }).click()
  await expect(
    page.getByRole('tabpanel').getByRole('heading', { name: 'Is C# the same thing as .NET?' }),
  ).toBeVisible()
  await page.getByRole('tab', { name: 'Quick check' }).click()
  await page.locator('.quiz-option').nth(0).click()
  await page.getByRole('button', { name: 'Check answer', exact: true }).click()
  await expect(page.getByText('A useful one to revisit.')).toBeVisible()
  await page.getByRole('button', { name: 'Try again', exact: true }).click()
  await page.locator('.quiz-option').nth(1).click()
  await page.getByRole('button', { name: 'Check answer', exact: true }).click()
  await expect(page.getByText('You got it.')).toBeVisible()
})

test('global concept search and roadmap filters navigate to real lessons', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Search the course' }).click()
  await page.getByRole('combobox', { name: 'Search lessons' }).fill('captive dependency')
  await expect(
    page.getByRole('option').filter({ hasText: 'Dependency injection & service lifetimes' }),
  ).toBeVisible()
  await page
    .getByRole('option')
    .filter({ hasText: 'Dependency injection & service lifetimes' })
    .click()
  await expect(
    page.getByRole('heading', { name: 'Dependency injection & service lifetimes', exact: true }),
  ).toBeVisible()
  await expect(page.getByRole('dialog')).not.toBeVisible()
  await page.goto('/#/roadmap')
  await page.getByRole('textbox', { name: 'Filter learning path' }).fill('xyz-no-such-lesson')
  await expect(page.getByRole('heading', { name: 'No matching lessons' })).toBeVisible()
  await page.getByRole('button', { name: 'Clear filters' }).click()
  await page.getByRole('combobox', { name: 'Lesson difficulty' }).selectOption('Advanced')
  await expect(page.locator('.roadmap-chapter')).toHaveCount(2)
})

test('notebook exports and validates backups before replacement', async ({ page }, testInfo) => {
  await page.goto('/#/learn/dotnet-ecosystem')
  await page.getByRole('textbox', { name: 'Notes for this lesson' }).fill('My original note')
  await page.goto('/#/notebook')
  const downloadEvent = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Export backup' }).click()
  const download = await downloadEvent
  const path = testInfo.outputPath('progress.json')
  await download.saveAs(path)
  const exported = JSON.parse(await readFile(path, 'utf8'))
  expect(exported.notes['dotnet-ecosystem']).toBe('My original note')
  const input = page.getByLabel('Import progress backup file')
  await input.setInputFiles({
    name: 'invalid.json',
    mimeType: 'application/json',
    buffer: Buffer.from('{}'),
  })
  await expect(page.getByRole('status')).toContainText('not a valid')
  await expect(page.getByRole('textbox', { name: 'Notes: .NET, C# & ASP.NET Core' })).toHaveValue(
    'My original note',
  )
  const replacement = {
    ...emptyProgress(),
    bookmarks: ['async-and-await'],
    notes: { 'async-and-await': 'Async is not a new thread.' },
  }
  await input.setInputFiles({
    name: 'valid.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify(replacement)),
  })
  await expect(page.getByRole('dialog', { name: 'Restore your progress?' })).toBeVisible()
  await page.getByRole('button', { name: 'Cancel', exact: true }).click()
  await expect(page.getByRole('textbox', { name: 'Notes: .NET, C# & ASP.NET Core' })).toHaveValue(
    'My original note',
  )
  await input.setInputFiles({
    name: 'valid.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify(replacement)),
  })
  await page.getByRole('button', { name: 'Restore backup', exact: true }).click()
  await expect(
    page.getByRole('textbox', { name: 'Notes: Async, await & the thread-pool trap' }),
  ).toHaveValue('Async is not a new thread.')
  await expect(page.getByRole('textbox', { name: 'Notes: .NET, C# & ASP.NET Core' })).toHaveCount(0)
})

test('quiz sessions and flashcard self-review work end to end', async ({ page }) => {
  await page.goto('/#/practice')
  await page.getByRole('combobox', { name: 'Session length' }).selectOption('5')
  await page.getByRole('button', { name: 'Start 5 questions' }).click()
  for (let index = 0; index < 5; index++) {
    const question = await page.locator('.quiz-question legend').innerText()
    const lesson = lessons.find((item) => item.quiz.question === question)!
    await page.locator('.quiz-option').nth(lesson.quiz.answer).click()
    await page.getByRole('button', { name: 'Check answer', exact: true }).click()
    await expect(page.getByText('You got it.')).toBeVisible()
    await page.getByRole('button', { name: 'Next question' }).click()
  }
  await expect(page.getByRole('heading', { name: '5 of 5 correct' })).toBeVisible()
  await page.getByRole('button', { name: 'Interview flashcards', exact: true }).click()
  await page.getByRole('button', { name: 'Reveal answer' }).click()
  await expect(page.locator('.flashcard-answer')).toBeVisible()
  await page.getByRole('button', { name: 'Needs review', exact: true }).click()
  await page.getByRole('checkbox', { name: 'Needs review only' }).check()
  await expect(page.locator('.flashcard-toolbar')).toContainText('1 / 1 cards')
  await page.getByRole('button', { name: 'Reveal answer' }).click()
  await page.getByRole('button', { name: 'Got it', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'No cards in this review list' })).toBeVisible()
})

test('HTTP and middleware labs compute behavior and expose invalid states', async ({ page }) => {
  await page.goto('/#/practice?mode=labs')
  await page.getByRole('combobox', { name: 'HTTP scenario' }).selectOption('create')
  await page.getByRole('button', { name: 'Send request' }).click()
  await expect(page.locator('.http-status')).toHaveText('201 Created')
  await expect(page.locator('.response-headers')).toContainText('/tasks/3')
  await page.getByRole('combobox', { name: 'HTTP scenario' }).selectOption('invalid')
  await page.getByRole('button', { name: 'Send request' }).click()
  await expect(page.locator('.http-status')).toHaveText('400 Bad Request')
  await page.getByRole('button', { name: 'Middleware pipeline', exact: true }).click()
  await page.getByRole('button', { name: 'Run pipeline' }).click()
  await expect(page.locator('.pipeline-verdict')).toContainText('The order is correct')
  await page.getByRole('button', { name: 'Move Authorization earlier' }).click()
  await page.getByRole('button', { name: 'Run pipeline' }).click()
  await expect(page.locator('.pipeline-verdict')).toContainText('The order needs attention')
  await expect(page.locator('.pipeline-result')).toContainText('401')
  await page.getByRole('button', { name: 'Reset middleware order' }).click()
  await page.getByRole('checkbox', { name: 'Signed-in request' }).uncheck()
  await page.getByRole('button', { name: 'Run pipeline' }).click()
  await expect(page.locator('.pipeline-verdict')).toContainText('The order is correct')
  await expect(page.locator('.pipeline-result')).toContainText('endpoint skipped')
})

test('project milestones persist and starter ZIP contains source, not build outputs', async ({
  page,
  request,
}) => {
  await page.goto('/#/projects/taskflow-api')
  const milestone = page.getByRole('checkbox', {
    name: 'Complete milestone: Understand the host and pipeline',
  })
  await milestone.check()
  await page.reload()
  await expect(milestone).toBeChecked()
  const response = await request.get('/taskflow-starter.zip')
  expect(response.status()).toBe(200)
  const entries = Object.keys(unzipSync(await response.body()))
  expect(entries).toContain('taskflow-starter/TaskFlow.Api/Program.cs')
  expect(entries).toContain('taskflow-starter/TaskFlow.Api.Tests/TaskFlowTests.cs')
  expect(entries).toContain('taskflow-starter/README.md')
  expect(entries.some((name) => /\/(bin|obj)\/|\.db$/.test(name))).toBe(false)
})

test('all sixty lessons render their actual diagrams without browser errors', async ({ page }) => {
  test.setTimeout(180000)
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  for (const lesson of lessons) {
    await page.goto(`/#/learn/${lesson.id}`)
    await expect(page.getByRole('heading', { name: lesson.title, exact: true })).toBeVisible()
    const expectedDiagrams = 1 + lesson.sections.filter((section) => section.diagram).length
    const diagrams = page.locator('.diagram-canvas svg')
    await expect(diagrams).toHaveCount(expectedDiagrams)
    for (let index = 0; index < expectedDiagrams; index++) {
      await expect(diagrams.nth(index)).toBeVisible()
      expect(
        await diagrams.nth(index).evaluate((element) => element.getBoundingClientRect().height),
      ).toBeGreaterThan(30)
    }
    await expect(page.locator('.diagram-fallback')).toHaveCount(0)
  }
  expect(errors).toEqual([])
})

test('desktop, tablet, and mobile views fit and remain navigable', async ({ page }, testInfo) => {
  for (const viewport of [
    { width: 1440, height: 1000 },
    { width: 980, height: 900 },
    { width: 768, height: 1024 },
    { width: 390, height: 844 },
  ]) {
    await page.setViewportSize(viewport)
    for (const route of [
      '/learn/dotnet-ecosystem',
      '/roadmap',
      '/practice?mode=labs',
      '/projects',
      '/notebook',
      '/reference',
      '/reference?view=review',
      '/reference?view=revision',
      '/learn/sql-and-relational-data?tab=example',
    ]) {
      await page.goto(`/#${route}`)
      await expect(page.locator('h1')).toBeVisible()
      await page.evaluate(() => document.fonts.ready)
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth - innerWidth),
        `${route} at ${viewport.width}`,
      ).toBeLessThanOrEqual(1)
      if (route === '/learn/dotnet-ecosystem')
        await expect(page.locator('.diagram-canvas svg')).toBeVisible()
      if (viewport.width === 1440 || viewport.width === 390)
        await page.screenshot({
          path: testInfo.outputPath(`${viewport.width}-${route.replace(/[^a-z0-9-]/gi, '_')}.png`),
        })
    }
    if (viewport.width === 390) {
      await page.getByRole('button', { name: 'Open navigation' }).click()
      await page
        .getByRole('dialog')
        .getByRole('link', { name: 'Project workbench', exact: true })
        .click()
      await expect(page.getByRole('heading', { name: 'The project workbench' })).toBeVisible()
      await expect(page.getByRole('dialog')).not.toBeVisible()
    }
  }
})

test('core views meet automated WCAG A and AA checks', async ({ page }) => {
  test.setTimeout(120000)
  for (const route of [
    '/learn/dotnet-ecosystem',
    '/learn/dotnet-ecosystem?tab=quiz',
    '/roadmap',
    '/practice?mode=labs',
    '/projects',
    '/notebook',
    '/reference',
    '/reference?view=review',
    '/reference?view=revision',
    '/learn/sql-and-relational-data?tab=example',
  ]) {
    await page.goto(`/#${route}`)
    await expect(page.locator('h1')).toBeVisible()
    await page.evaluate(() => document.fonts.ready)
    if (route === '/learn/dotnet-ecosystem')
      await expect(page.locator('.diagram-canvas svg')).toBeVisible()
    const result = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze()
    expect(
      result.violations.map((item) => ({
        id: item.id,
        nodes: item.nodes.map((node) => node.target),
      })),
      route,
    ).toEqual([])
  }
})

test('PDF review, revisions, and supplementary examples remain reachable', async ({ page }) => {
  await page.goto('/#/reference?view=review')
  await expect(
    page.getByRole('heading', { name: 'Master Interview Study Reference', exact: true }),
  ).toBeVisible()
  await expect(page.locator('.source-coverage')).toHaveCount(13)
  await expect(page.getByRole('heading', { name: 'Corrections worth remembering' })).toBeVisible()
  const sqlCoverage = page
    .locator('.source-coverage')
    .filter({ hasText: 'SQL interview fundamentals' })
  await sqlCoverage
    .getByRole('link', { name: 'Relational data, SQL & indexes', exact: true })
    .click()
  await page.getByRole('tab', { name: 'Code example' }).click()
  await expect(page.locator('.example-section')).toHaveCount(4)
  await expect(
    page.getByRole('heading', { name: 'Rank task estimates without losing ties' }),
  ).toBeVisible()
  await expect(
    page
      .locator('.example-section')
      .filter({ hasText: 'Rank task estimates without losing ties' })
      .locator('code')
      .last(),
  ).toContainText('DENSE_RANK')
  await page.goto('/#/reference?view=revision')
  await expect(
    page.getByRole('heading', { name: 'Rapid recall, with the caveats intact' }),
  ).toBeVisible()
  await expect(page.locator('.reference-scenario')).toHaveCount(6)
  const scenario = page
    .locator('.reference-scenario')
    .filter({ hasText: 'A credential may have been stolen' })
  await scenario.locator('summary').click()
  await expect(scenario.locator('.scenario-prompt')).toBeVisible()
  await expect(scenario.locator('.scenario-follow-up')).toContainText('HttpOnly')
  await page.reload()
  await expect(page.getByRole('button', { name: 'Quick revision', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  )
  await page.goto('/#/practice?mode=flashcards')
  const totalTraps = lessons.reduce((count, lesson) => count + lesson.traps.length, 0)
  await expect(page.locator('.practice-metrics')).toContainText(`/ ${totalTraps}`)
})

test('existing progress survives the expanded reference curriculum', async ({ page }) => {
  const previous = {
    ...emptyProgress(),
    completed: ['linq-and-execution'],
    bookmarks: ['sql-and-relational-data'],
    notes: { 'linq-and-execution': 'My existing note' },
    answers: { 'dotnet-ecosystem': 1 },
    reviews: { 'cookies-jwt-and-oidc:1': 'known' },
    lastLesson: 'linq-and-execution',
  }
  await page.addInitScript(({ key, value }) => localStorage.setItem(key, JSON.stringify(value)), {
    key: STORAGE_KEY,
    value: previous,
  })
  await page.goto('/')
  await expect(
    page.getByRole('heading', { name: 'LINQ & deferred execution', exact: true }),
  ).toBeVisible()
  await expect(page.getByRole('textbox', { name: 'Notes for this lesson' })).toHaveValue(
    'My existing note',
  )
  await expect(page.getByRole('button', { name: 'Completed', exact: true })).toBeVisible()
  const stored = await page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key) ?? '{}'),
    STORAGE_KEY,
  )
  expect(stored.bookmarks).toEqual(previous.bookmarks)
  expect(stored.answers).toEqual(previous.answers)
  expect(stored.reviews).toEqual(previous.reviews)
})

test('storage failure is visible and notes still work in memory', async ({ page }) => {
  await page.addInitScript(() => {
    Storage.prototype.setItem = () => {
      throw new DOMException('Storage disabled', 'QuotaExceededError')
    }
  })
  await page.goto('/#/learn/dotnet-ecosystem')
  await page.getByRole('textbox', { name: 'Notes for this lesson' }).fill('Keep this in memory')
  await expect(page.getByRole('alert')).toContainText('storage is unavailable')
  await expect(page.getByRole('textbox', { name: 'Notes for this lesson' })).toHaveValue(
    'Keep this in memory',
  )
})

test('progress synchronizes between tabs without a reload', async ({ page, context }) => {
  await page.goto('/#/learn/dotnet-ecosystem')
  const other = await context.newPage()
  await other.goto('/#/learn/dotnet-ecosystem')
  await expect(other.getByRole('textbox', { name: 'Notes for this lesson' })).toBeVisible()
  await page
    .getByRole('textbox', { name: 'Notes for this lesson' })
    .fill('Shared across these browser tabs')
  await expect(other.getByRole('textbox', { name: 'Notes for this lesson' })).toHaveValue(
    'Shared across these browser tabs',
  )
  const saved = await other.evaluate(
    (key) => JSON.parse(localStorage.getItem(key) ?? '{}'),
    STORAGE_KEY,
  )
  expect(saved.notes['dotnet-ecosystem']).toBe('Shared across these browser tabs')
})
