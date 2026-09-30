import type { Accent } from './types'

export interface Project {
  id: string
  title: string
  subtitle: string
  level: string
  accent: Accent
  icon: 'terminal' | 'server' | 'rocket'
  stack: string[]
  brief: string
  commands: string
  milestones: {
    id: string
    title: string
    description: string
    criteria: string[]
    lessonId: string
  }[]
}

export const projects: Project[] = [
  {
    id: 'taskflow-cli',
    title: 'TaskFlow CLI',
    subtitle: 'Make the C# fundamentals tangible.',
    level: 'Beginner',
    accent: 'lime',
    icon: 'terminal',
    stack: ['C#', 'JSON', 'File I/O'],
    brief:
      'Build a command-line task tracker. Add a task, list open tasks, complete one by ID, and preserve data between runs. Keep parsing, business rules, and storage separate enough to test. The downloadable starter includes a working local CLI; study it, then recreate the behavior without copying.',
    commands:
      'dotnet run --project examples/TaskFlow.Cli -- add "Learn C#"\ndotnet run --project examples/TaskFlow.Cli -- list\ndotnet run --project examples/TaskFlow.Cli -- complete 1',
    milestones: [
      {
        id: 'cli-model',
        title: 'Model a task',
        description: 'Give the data meaningful types and establish a valid title rule.',
        criteria: [
          'Use an integer ID, string title, and Boolean completion state.',
          'Reject null, blank, and oversized titles.',
          'Explain why a collection is not a database.',
        ],
        lessonId: 'classes-and-encapsulation',
      },
      {
        id: 'cli-commands',
        title: 'Implement the commands',
        description: 'Make valid and invalid commands predictable.',
        criteria: [
          'Support add, list, and complete.',
          'Parse IDs without throwing on expected invalid input.',
          'Print useful errors and return nonzero exit codes on failure.',
        ],
        lessonId: 'methods-and-parameters',
      },
      {
        id: 'cli-storage',
        title: 'Save and restore tasks',
        description: 'Serialize structured data and handle file errors honestly.',
        criteria: [
          'Persist tasks as JSON between runs.',
          'Do not silently overwrite a corrupted data file.',
          'Explain the limits of a single-user local file store.',
        ],
        lessonId: 'exceptions-and-errors',
      },
      {
        id: 'cli-tests',
        title: 'Verify the rules',
        description: 'Prove the behavior with cases that can catch realistic mistakes.',
        criteria: [
          'Test title normalization and rejection.',
          'Test unknown IDs and repeated completion.',
          'Verify state survives a process restart.',
        ],
        lessonId: 'unit-testing',
      },
    ],
  },
  {
    id: 'taskflow-api',
    title: 'TaskFlow API',
    subtitle: 'A real API, from request to database.',
    level: 'Intermediate',
    accent: 'cyan',
    icon: 'server',
    stack: ['ASP.NET Core', 'EF Core', 'SQLite', 'xUnit'],
    brief:
      'Expose task operations over HTTP with validation, persistent SQLite storage, cancellation, and integration tests. The starter is deliberately anonymous and intended for local learning. It uses EnsureCreated for its demo database, so plan a fresh migrations-managed database before production. Do not put private data behind these public starter endpoints.',
    commands:
      'dotnet test examples/TaskFlow.Api.Tests\ndotnet run --project examples/TaskFlow.Api -- --urls http://localhost:5050',
    milestones: [
      {
        id: 'api-host',
        title: 'Understand the host and pipeline',
        description: 'Trace a request through the actual ASP.NET Core process.',
        criteria: [
          'Explain service registration versus middleware registration.',
          'Start the API and inspect /health.',
          'Trace a successful request and a 404.',
        ],
        lessonId: 'middleware-pipeline',
      },
      {
        id: 'api-contract',
        title: 'Implement the HTTP contract',
        description: 'Use meaningful methods, status codes, and response DTOs.',
        criteria: [
          'Create returns 201 and a usable Location.',
          'Read, update, and delete handle unknown IDs.',
          'List pagination has explicit upper bounds.',
        ],
        lessonId: 'rest-and-http-semantics',
      },
      {
        id: 'api-persistence',
        title: 'Persist a unit of work',
        description: 'Use a scoped context and understand each query.',
        criteria: [
          'Save changes with EF Core and a relational provider.',
          'Propagate the request cancellation token.',
          'Inspect a bounded projected query and its SQL.',
        ],
        lessonId: 'ef-core-and-migrations',
      },
      {
        id: 'api-validation',
        title: 'Protect the input boundary',
        description: 'Accept only editable fields and return consistent errors.',
        criteria: [
          'Reject empty and oversized titles.',
          'Keep server-owned fields outside create/update DTOs.',
          'Return safe Problem Details for known invalid input.',
        ],
        lessonId: 'validation-and-problem-details',
      },
      {
        id: 'api-tests',
        title: 'Exercise the real HTTP pipeline',
        description: 'Run isolated tests, then add a new case of your own.',
        criteria: [
          'Test a create-read-update-delete round trip.',
          'Verify invalid input creates no row.',
          'Verify unknown IDs and pagination boundaries.',
        ],
        lessonId: 'integration-testing',
      },
      {
        id: 'api-concurrency',
        title: 'Add a version contract',
        description: 'Extend the starter to reject a stale update.',
        criteria: [
          'Add an application-managed concurrency token for SQLite.',
          'Test two independent readers updating the same task.',
          'Return a documented conflict without overwriting newer data.',
        ],
        lessonId: 'concurrency-and-data-access',
      },
    ],
  },
  {
    id: 'production-taskflow',
    title: 'Production TaskFlow',
    subtitle: 'Make security and failure part of the design.',
    level: 'Advanced',
    accent: 'coral',
    icon: 'rocket',
    stack: ['Identity', 'Authorization', 'CI', 'Telemetry'],
    brief:
      'Extend your verified API with real identity, resource authorization, migrations, observability, and deployment. This is an implementation brief, not a claim that the local starter is already production-ready. Choose a trusted identity provider, test negative paths, and document recovery before publishing a live service.',
    commands:
      'dotnet test examples/TaskFlow.Api.Tests -c Release\ndotnet publish examples/TaskFlow.Api -c Release -o artifacts/taskflow-api',
    milestones: [
      {
        id: 'prod-identity',
        title: 'Integrate trusted identity',
        description: 'Use a supported provider and validate tokens for this API.',
        criteria: [
          'Validate issuer, audience, signature, and lifetime.',
          'Test missing, expired, and wrong-audience credentials.',
          'Keep secrets out of source and logs.',
        ],
        lessonId: 'cookies-jwt-and-oidc',
      },
      {
        id: 'prod-ownership',
        title: 'Enforce resource authorization',
        description: 'Protect every data path, not just the UI.',
        criteria: [
          'Derive owner identity from trusted claims.',
          'Reject cross-user reads and updates.',
          'Test list, batch, and export isolation.',
        ],
        lessonId: 'policies-and-ownership',
      },
      {
        id: 'prod-jobs',
        title: 'Design reliable background work',
        description: 'Choose durable delivery only where the feature needs it.',
        criteria: [
          'Use a stable job or message ID.',
          'Make repeated delivery safe.',
          'Handle cancellation, retries, and poison work explicitly.',
        ],
        lessonId: 'background-services-and-queues',
      },
      {
        id: 'prod-observe',
        title: 'Make failures diagnosable',
        description: 'Connect safe logs, metrics, and dependency traces.',
        criteria: [
          'Use structured log fields without credentials.',
          'Measure request latency and error rate.',
          'Distinguish liveness from readiness.',
        ],
        lessonId: 'logging-and-observability',
      },
      {
        id: 'prod-deploy',
        title: 'Deploy a tested artifact',
        description: 'Separate build, schema evolution, and hosting concerns.',
        criteria: [
          'Use a reviewed migrations-managed database transition.',
          'Configure HTTPS, trusted proxies, and least privilege.',
          'Run deployed smoke and authorization checks.',
        ],
        lessonId: 'deployment-and-hosting',
      },
      {
        id: 'prod-recover',
        title: 'Rehearse recovery',
        description: 'Demonstrate recovery instead of only writing a checklist.',
        criteria: [
          'Restore a backup into an isolated environment.',
          'Verify key availability and application compatibility.',
          'Record measured recovery time and remaining risks.',
        ],
        lessonId: 'production-operations',
      },
    ],
  },
]

export const projectStepIds = new Set(
  projects.flatMap((project) => project.milestones.map((step) => step.id)),
)
