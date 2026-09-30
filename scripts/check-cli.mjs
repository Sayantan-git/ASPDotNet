import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const build = spawnSync(
  'dotnet',
  ['build', 'examples/TaskFlow.Cli', '-c', 'Release', '--verbosity', 'quiet'],
  { cwd: root, encoding: 'utf8' },
)
if (build.status !== 0) throw new Error(build.error?.message ?? `${build.stdout}\n${build.stderr}`)
const directory = await mkdtemp(join(tmpdir(), 'taskflow-cli-test-'))
const dataPath = join(directory, 'tasks.json')
const assembly = join(root, 'examples/TaskFlow.Cli/bin/Release/net10.0/TaskFlow.Cli.dll')
function run(args) {
  return spawnSync('dotnet', [assembly, ...args], {
    cwd: root,
    encoding: 'utf8',
    env: { ...process.env, TASKFLOW_DATA_PATH: dataPath },
  })
}

try {
  assert.match(run(['list']).stdout, /No tasks yet/)
  assert.equal(run(['add', '  Learn C#  ']).status, 0)
  assert.match(run(['list']).stdout, /1\. \[ \] Learn C#/)
  assert.equal(run(['complete', '1']).status, 0)
  assert.match(run(['list']).stdout, /1\. \[x\] Learn C#/)
  assert.equal(run(['complete', '1']).status, 0)
  assert.equal(run(['complete', '99']).status, 2)
  assert.equal(run(['add', '   ']).status, 2)
  assert.equal(run(['complete', 'not-a-number']).status, 2)
  assert.equal(JSON.parse(await readFile(dataPath, 'utf8')).length, 1)
  for (const invalid of [
    '{damaged data',
    'null',
    '[null]',
    '[{"id":0,"title":"Bad ID"}]',
    '[{"id":1,"title":" "}]',
  ]) {
    await writeFile(dataPath, invalid)
    assert.equal(run(['add', 'Do not overwrite']).status, 1)
    assert.equal(await readFile(dataPath, 'utf8'), invalid)
  }
  console.log(
    'CLI checks passed: persistence, normalization, completion, invalid input, and corrupt-file protection.',
  )
} finally {
  await rm(directory, { recursive: true, force: true })
}
