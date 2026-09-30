import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const server = await createServer({
  configFile: false,
  root,
  appType: 'custom',
  server: { middlewareMode: true },
})
let lessons
try {
  ;({ lessons } = await server.ssrLoadModule('/src/content/curriculum.ts'))
} finally {
  await server.close()
}

const consoleIds = [
  'dotnet-ecosystem',
  'first-csharp-program',
  'types-and-variables',
  'control-flow',
  'methods-and-parameters',
  'strings-and-nullability',
  'collections-and-generics',
  'classes-and-encapsulation',
  'interfaces-and-polymorphism',
  'value-reference-records',
  'solid-and-composition',
  'delegates-events-lambdas',
  'linq-and-execution',
  'exceptions-and-errors',
  'async-and-await',
  'cancellation-and-concurrency',
  'memory-and-disposal',
  'modern-csharp-and-migration',
]
const webIds = [
  'http-fundamentals',
  'hosting-and-configuration',
  'minimal-apis-and-routing',
  'middleware-pipeline',
  'dependency-injection',
  'validation-and-problem-details',
  'controllers-and-binding',
  'pagination-and-versioning',
  'caching-and-rate-limiting',
  'web-security',
  'secrets-and-data-protection',
  'logging-and-observability',
  'production-operations',
]
const directory = await mkdtemp(join(tmpdir(), 'dotnet-atlas-snippets-'))
const examples = [...consoleIds, ...webIds].map((id) => {
  const lesson = lessons.find((item) => item.id === id)
  assert(lesson, `Unknown snippet ${id}`)
  return { id, web: webIds.includes(id), example: lesson.example }
})
for (const filename of ['ValidateProjectId.cs', 'MapTaskResponse.cs']) {
  const example = lessons
    .find((lesson) => lesson.id === 'validation-and-problem-details')
    ?.additionalExamples?.find((item) => item.filename === filename)
  assert(example, `Missing reference example ${filename}`)
  examples.push({ id: filename.replace('.cs', ''), web: false, example })
}
const sqlFilenames = ['task-rankings.sql', 'second-highest-estimate.sql', 'duplicate-emails.sql']
const sqlExamples = sqlFilenames.map((filename) => {
  const example = lessons
    .find((lesson) => lesson.id === 'sql-and-relational-data')
    ?.additionalExamples?.find((item) => item.filename === filename)
  assert(example?.output, `Missing SQL result fixture ${filename}`)
  return { title: example.title, code: example.code, output: example.output }
})
const sqlProjectId = 'sql-reference-checks'
const ids = [...examples.map((item) => item.id), sqlProjectId]

function dotnet(args) {
  const result = spawnSync('dotnet', args, { cwd: directory, encoding: 'utf8', timeout: 300000 })
  if (result.status !== 0)
    throw new Error(result.error?.message ?? `${result.stdout}\n${result.stderr}`)
  return result.stdout.replaceAll('\r\n', '\n').trim()
}

try {
  await writeFile(
    join(directory, 'NuGet.Config'),
    await readFile(join(root, 'examples/NuGet.Config')),
  )
  for (const { id, web, example } of examples) {
    const projectDirectory = join(directory, id)
    await mkdir(projectDirectory)
    const sdk = web ? 'Microsoft.NET.Sdk.Web' : 'Microsoft.NET.Sdk'
    await writeFile(
      join(projectDirectory, `${id}.csproj`),
      `<Project Sdk="${sdk}"><PropertyGroup><OutputType>Exe</OutputType><TargetFramework>net10.0</TargetFramework><ImplicitUsings>enable</ImplicitUsings><Nullable>enable</Nullable><TreatWarningsAsErrors>true</TreatWarningsAsErrors></PropertyGroup></Project>`,
    )
    await writeFile(join(projectDirectory, 'Program.cs'), example.code)
  }
  const sqlProjectDirectory = join(directory, sqlProjectId)
  await mkdir(sqlProjectDirectory)
  await writeFile(
    join(sqlProjectDirectory, `${sqlProjectId}.csproj`),
    '<Project Sdk="Microsoft.NET.Sdk"><PropertyGroup><OutputType>Exe</OutputType><TargetFramework>net10.0</TargetFramework><ImplicitUsings>enable</ImplicitUsings><Nullable>enable</Nullable><TreatWarningsAsErrors>true</TreatWarningsAsErrors></PropertyGroup><ItemGroup><PackageReference Include="Microsoft.Data.Sqlite" Version="10.0.12" /></ItemGroup></Project>',
  )
  await writeFile(
    join(sqlProjectDirectory, 'Program.cs'),
    `using System.Globalization;
using System.Text.Json;
using Microsoft.Data.Sqlite;

var options = new JsonSerializerOptions(JsonSerializerDefaults.Web);
var examples = JsonSerializer.Deserialize<SqlExample[]>(await File.ReadAllTextAsync(args[0]), options)
    ?? throw new InvalidDataException("Missing SQL examples");

foreach (var example in examples)
{
    await using var connection = new SqliteConnection("Data Source=:memory:");
    await connection.OpenAsync();
    await using var command = connection.CreateCommand();
    command.CommandText = example.Code;
    await using var reader = await command.ExecuteReaderAsync();
    var columns = Enumerable.Range(0, reader.FieldCount).ToArray();
    var lines = new List<string> { string.Join(" | ", columns.Select(reader.GetName)) };
    while (await reader.ReadAsync())
        lines.Add(string.Join(" | ", columns.Select(index => reader.IsDBNull(index)
            ? "NULL" : Convert.ToString(reader.GetValue(index), CultureInfo.InvariantCulture))));
    string actual = string.Join("\\n", lines);
    if (actual != example.Output.Replace("\\r\\n", "\\n").Trim())
        throw new InvalidOperationException($"Unexpected result for {example.Title}:\\n{actual}");
}
Console.WriteLine($"Verified {examples.Length} portable SQL result sets on SQLite.");

public sealed record SqlExample(string Title, string Code, string Output);
`,
  )
  const sqlInput = join(directory, 'sql-examples.json')
  await writeFile(sqlInput, JSON.stringify(sqlExamples))
  await writeFile(
    join(directory, 'Lessons.slnx'),
    `<Solution>${ids.map((id) => `<Project Path="${id}/${id}.csproj" />`).join('')}</Solution>`,
  )
  dotnet(['build', 'Lessons.slnx', '-c', 'Release', '--verbosity', 'quiet', '--nologo'])
  const consoleExamples = examples.filter((item) => !item.web)
  for (const { id, example } of consoleExamples) {
    const output = dotnet([join(directory, id, 'bin/Release/net10.0', `${id}.dll`)])
    assert.equal(output, example.output.trim(), `Unexpected console output in ${id}`)
  }
  console.log(
    dotnet([join(sqlProjectDirectory, 'bin/Release/net10.0', `${sqlProjectId}.dll`), sqlInput]),
  )
  console.log(
    `Verified ${examples.length} standalone lesson builds and ${consoleExamples.length} exact console outputs.`,
  )
  console.log(
    'SQL Server-only procedures, AutoMapper/Dapper integrations, and contextual excerpts require their stated environments and are not executed by this check.',
  )
} finally {
  await rm(directory, { recursive: true, force: true })
}
