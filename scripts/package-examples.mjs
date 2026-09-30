import { readdir, readFile, mkdir, writeFile, rename, rm } from 'node:fs/promises'
import { dirname, extname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { unzipSync, zipSync } from 'fflate'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const source = join(root, 'examples')
const target = join(root, 'public', 'taskflow-starter.zip')
const entries = {}
const extensions = new Set(['.cs', '.csproj', '.md', '.config', '.http', '.slnx'])

async function collect(directory) {
  const children = await readdir(directory, { withFileTypes: true })
  for (const entry of children.sort((left, right) => left.name.localeCompare(right.name))) {
    if (entry.isSymbolicLink() || ['bin', 'obj', 'TestResults'].includes(entry.name)) continue
    const path = join(directory, entry.name)
    if (entry.isDirectory()) await collect(path)
    else if (extensions.has(extname(entry.name).toLowerCase())) {
      const name = `taskflow-starter/${relative(source, path).split('\\').join('/')}`
      entries[name] = [new Uint8Array(await readFile(path)), { mtime: new Date(2026, 0, 1) }]
    }
  }
}

await collect(source)
const archive = zipSync(entries, { level: 9 })
const verified = unzipSync(archive)
for (const required of [
  'README.md',
  'NuGet.Config',
  'TaskFlow.Cli/Program.cs',
  'TaskFlow.Api/Program.cs',
  'TaskFlow.Api.Tests/TaskFlowTests.cs',
]) {
  if (!verified[`taskflow-starter/${required}`])
    throw new Error(`Missing required starter file: ${required}`)
}
if (Object.keys(verified).some((name) => /\/(bin|obj)\/|\.db$|\.env$/.test(name)))
  throw new Error('Unexpected generated or private file in archive')
await mkdir(dirname(target), { recursive: true })
const temporary = `${target}.${process.pid}.tmp`
try {
  await writeFile(temporary, archive, { flag: 'wx' })
  await rename(temporary, target)
} finally {
  await rm(temporary, { force: true })
}
console.log(
  `Packaged and verified ${Object.keys(verified).length} starter files (${Math.round(archive.length / 1024)} KB).`,
)
