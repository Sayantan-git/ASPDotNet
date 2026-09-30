import type { Chapter } from '../types'

export const architecture: Chapter = {
  id: 'architecture',
  title: 'Architecture & distributed systems',
  description: 'Build clear boundaries and reason about failure across processes.',
  level: 'Advanced',
  accent: 'gold',
  lessons: [
    {
      id: 'architecture-and-boundaries',
      title: 'Architecture, CQRS & modular monoliths',
      subtitle: 'Organize around business behavior without confusing folders with boundaries.',
      minutes: 30,
      tags: [
        'Clean Architecture',
        'CQRS',
        'DDD',
        'aggregate',
        'modular monolith',
        'vertical slice',
        'MediatR',
      ],
      outcomes: [
        'Explain dependency direction and module ownership.',
        'Distinguish CQRS from event sourcing.',
        'Choose architecture proportionate to application complexity.',
      ],
      sections: [
        {
          title: 'A boundary controls knowledge and change',
          body: "Architecture decides which parts know about which other parts and who owns behavior and data. A folder named Domain does not create a boundary if its classes import HTTP controllers and database-specific code everywhere. Dependency direction and the contracts between modules matter more than the diagram's labels.\n\nClean or layered designs often keep business policy independent of infrastructure details. A vertical-slice design groups the code needed for one use case. These are organizational tools with tradeoffs, not mutually exclusive religions. Use the smallest structure that keeps a change understandable and testable.",
        },
        {
          title: 'Model business consistency explicitly',
          body: 'Domain-driven design, or DDD, emphasizes a shared business vocabulary and boundaries where a model has a consistent meaning. An aggregate is a consistency boundary around related domain state and invariants. It is not simply every table reachable through navigation properties.\n\nFor TaskFlow, completing a task and changing project membership may belong to different operations and permission rules. Keep transactions and invariants aligned with the actual behavior. Avoid turning every DTO into a rich domain object or applying advanced patterns to simple CRUD without a demonstrated need.',
        },
        {
          title: 'Separate read and write needs when useful',
          body: 'CQRS means Command Query Responsibility Segregation: writes and reads can have different models and paths. It does not require separate databases, a message bus, event sourcing, or a mediator library. A read projection optimized for a task list and a command enforcing completion rules can share one database.\n\nEvent sourcing stores a sequence of events as the source of truth, which is a separate and more demanding choice. A modular monolith can provide clear feature ownership with one deployment, avoiding network failure modes between every module. Extract a service when independent scaling, deployment, ownership, or isolation earns the operational cost. Microservices are not an automatic seniority upgrade.',
        },
      ],
      diagram: {
        title: 'Separate policy from infrastructure',
        source:
          'flowchart TB\n  api["API / UI adapters"] --> application["Application use cases"]\n  application --> domain["Domain rules"]\n  infrastructure["Database / messaging adapters"] -. implements .-> contracts["Application contracts"]\n  application --> contracts',
        caption:
          'Dependencies should reflect ownership. More projects or interfaces do not automatically create a better design.',
      },
      example: {
        title: 'Separate a command from a read contract',
        filename: 'TaskContracts.cs',
        language: 'csharp',
        setup:
          'Compilable contract definitions for a class-library project. These define boundaries, not a working persistence implementation. Add implementations only where the application needs them.',
        code: 'public record CompleteTask(int TaskId, Guid ExpectedVersion);\npublic record TaskSummary(int Id, string Title, bool IsComplete);\n\npublic interface ITaskCommands\n{\n    Task CompleteAsync(CompleteTask command, CancellationToken cancellationToken);\n}\n\npublic interface ITaskQueries\n{\n    Task<IReadOnlyList<TaskSummary>> ListOpenAsync(\n        int limit, CancellationToken cancellationToken);\n}',
        explanation: [
          'The command expresses intent and the version expectation, rather than exposing an arbitrary entity update.',
          'The query returns a bounded read model appropriate for its consumer.',
          'These interfaces are justified only if they create a useful boundary. A small application can use direct handlers without adding a generic framework around them.',
        ],
      },
      traps: [
        {
          question: 'Does CQRS require event sourcing and separate databases?',
          answer:
            'No. CQRS separates command and query responsibilities. Event sourcing and physically separate stores are independent design choices with additional complexity.',
          warning:
            'Do not package several patterns together as if one keyword requires all of them.',
        },
        {
          question: 'Are microservices inherently more maintainable than a monolith?',
          answer:
            'No. They introduce network failure, deployment coordination, observability, data consistency, and operational costs. Clear module boundaries can exist inside a single deployment.',
          warning: 'A distributed monolith can combine the costs of both approaches.',
        },
      ],
      exercise: {
        title: 'Draw a useful TaskFlow boundary',
        brief: 'TaskFlow now has tasks, project membership, and email notifications.',
        steps: [
          'Identify which module owns each business rule.',
          'Keep membership authorization explicit at task operations.',
          'Choose one deployment unless independent service needs are demonstrated.',
        ],
        solution:
          'Separate cohesive modules and define narrow interactions while keeping one deployment initially. Use an adapter for email, a clear membership query/policy, and task operations that protect their invariants. Extract services only after identifying a real scaling, ownership, or release requirement.',
      },
      quiz: {
        question: 'Which statement about CQRS is correct?',
        options: [
          'It always requires a message broker',
          'It separates read and write responsibilities',
          'It means every entity must have an event log',
          'It prohibits a shared database',
        ],
        answer: 1,
        explanation:
          'CQRS separates command and query models or paths. It can be implemented within one application and one database without event sourcing or messaging.',
      },
      references: [
        {
          label: 'CQRS pattern',
          url: 'https://learn.microsoft.com/en-us/azure/architecture/patterns/cqrs',
        },
        {
          label: '.NET web application architecture',
          url: 'https://learn.microsoft.com/en-us/dotnet/architecture/modern-web-apps-azure/',
        },
      ],
    },
    {
      id: 'background-services-and-queues',
      title: 'Background services & durable jobs',
      subtitle:
        'Move work out of the request without losing it or borrowing a disposed request scope.',
      minutes: 30,
      tags: [
        'BackgroundService',
        'IHostedService',
        'Channel',
        'queue',
        'PeriodicTimer',
        'scope',
        'shutdown',
        'Hangfire',
      ],
      outcomes: [
        'Use hosted services with cancellation and scoped dependencies.',
        'Distinguish in-memory queues from durable jobs.',
        'Avoid fire-and-forget request work.',
      ],
      sections: [
        {
          title: 'The request is not a job lifetime',
          body: 'Starting Task.Run from an endpoint and discarding it is not a reliable background-job system. The request scope may be disposed, exceptions may go unobserved, the process may restart, and the work may vanish. Never capture HttpContext or a request-scoped DbContext for use after the request ends.\n\nA hosted service participates in application startup and shutdown. BackgroundService provides an ExecuteAsync loop with a stopping token. Its lifetime is long, so create a dependency scope for each unit of work when using scoped services. Await that work before disposing the scope.',
        },
        {
          title: 'Choose the queue based on delivery requirements',
          body: 'A bounded Channel can coordinate producers and consumers inside one process and provide backpressure. It does not persist jobs through a crash. A durable queue or job framework can store work and retries, but you still need idempotent processing, poison-message handling, visibility, and retention rules.\n\nAt-least-once delivery means a handler may run again. Design a stable operation identifier and deduplication strategy where duplicate effects matter. Acknowledging a message before the business work commits can lose work; acknowledging afterward can cause duplicates if the process dies between commit and acknowledgement.',
        },
        {
          title: 'Shutdown is part of the workflow',
          body: 'Propagate stoppingToken to waits and external calls, stop accepting new work as appropriate, and decide whether unfinished work is retried or drained. A host shutdown timeout is a budget, not a guarantee that all jobs can finish. Long-running or critical work should not depend solely on a graceful shutdown happening.\n\nUse PeriodicTimer for a clear asynchronous periodic loop. A timer interval is not an exact wall-clock scheduling guarantee. Overlapping runs, failure handling, and multi-instance duplication need explicit policies. A hosted service runs in every replica unless coordinated, so a scheduled cleanup may execute several times after scale-out.',
        },
      ],
      diagram: {
        title: 'A scoped background unit of work',
        source:
          'flowchart LR\n  trigger["Queue item / timer tick"] --> scope["Create DI scope"]\n  scope --> work["Await scoped work"]\n  work --> dispose["Dispose scope"]\n  dispose --> next["Next item or stop"]',
        caption:
          'No request-scoped service is borrowed. Durable delivery and duplicate protection are separate requirements.',
      },
      example: {
        title: 'Run a cancellation-aware periodic worker',
        filename: 'TaskWorker.cs',
        language: 'csharp',
        setup:
          'Add this type to a net10.0 web project and register builder.Services.AddHostedService<TaskWorker>() before Build. This worker logs periodic checks only; it is not a durable job processor.',
        code: 'public sealed class TaskWorker(ILogger<TaskWorker> logger) : BackgroundService\n{\n    protected override async Task ExecuteAsync(CancellationToken stoppingToken)\n    {\n        using var timer = new PeriodicTimer(TimeSpan.FromSeconds(30));\n        try\n        {\n            while (await timer.WaitForNextTickAsync(stoppingToken))\n            {\n                logger.LogInformation("Periodic task check at {Time}", DateTimeOffset.UtcNow);\n            }\n        }\n        catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)\n        {\n            logger.LogInformation("Task worker stopped");\n        }\n    }\n}',
        output: 'Periodic structured log events until host shutdown requests cancellation.',
        explanation: [
          'The stopping token cancels the asynchronous wait so shutdown need not wait for a full interval.',
          'Only expected host cancellation is handled by the filtered catch.',
          'When adding database work, create and dispose a scope per operation instead of injecting a scoped context directly into this long-lived worker.',
        ],
      },
      traps: [
        {
          question: 'Does Task.Run make a job survive an app restart?',
          answer:
            'No. It schedules in-process work. Reliability across restarts requires durable storage and a worker/delivery design with retries and idempotency.',
          warning: 'Fire-and-forget is not a persistence model.',
        },
        {
          question: 'Does a BackgroundService run only once across a scaled deployment?',
          answer:
            'No. Each host instance runs its own registered hosted services. Shared scheduling or singleton job execution needs explicit coordination.',
          warning:
            'A safe operation should tolerate duplicate execution where coordination can fail.',
        },
      ],
      exercise: {
        title: 'Make an export job reliable',
        brief:
          'A task export takes a minute and must survive request disconnection and process restart.',
        steps: [
          'Persist an export job with a stable ID.',
          'Return an accepted response and status resource.',
          'Process with retry-safe storage and an authorized download path.',
        ],
        solution:
          'Use a durable job record/queue and return 202 with a status URL when work is accepted, not completed. The worker updates progress and final state idempotently. Enforce ownership on status and download endpoints, and define failure, expiry, retry, and cancellation policies.',
      },
      quiz: {
        question: 'Why should a background job not retain a request-scoped DbContext?',
        options: [
          'DbContext only supports console apps',
          'The request scope may end before the job finishes',
          'Every background job must use static fields',
          'Cancellation automatically clones the context',
        ],
        answer: 1,
        explanation:
          'The request owns that scope and can dispose it while detached work is still running. A background unit should create its own appropriate scope and await work before disposal.',
      },
      references: [
        {
          label: 'Hosted background services',
          url: 'https://learn.microsoft.com/en-us/aspnet/core/fundamentals/host/hosted-services?view=aspnetcore-10.0',
        },
        {
          label: 'Channels',
          url: 'https://learn.microsoft.com/en-us/dotnet/core/extensions/channels',
        },
      ],
    },
    {
      id: 'httpclient-and-resilience',
      title: 'HttpClient, timeouts & resilience',
      subtitle:
        'Treat every remote call as a dependency that can be slow, fail, or complete ambiguously.',
      minutes: 30,
      tags: [
        'HttpClientFactory',
        'Polly',
        'resilience',
        'retry',
        'timeout',
        'circuit breaker',
        'DNS',
        'sockets',
      ],
      outcomes: [
        'Manage HttpClient and handler lifetimes correctly.',
        'Set cancellation and timeout budgets.',
        'Retry only operations with an appropriate safety contract.',
      ],
      sections: [
        {
          title: 'Connections have a lifecycle',
          body: 'Creating and disposing a new HttpClient with a new handler for every request can cause connection churn and port exhaustion under load. IHttpClientFactory creates clients while managing pooled handlers. Named and typed clients centralize base addresses, headers, and policies. A long-lived client with a correctly configured SocketsHttpHandler and pooled connection lifetime is another valid approach.\n\nDo not say HttpClient must always be new or always be static. The useful question is how connections, DNS changes, cookies, and handler lifetime are managed. Typed clients captured by long-lived singletons can defeat expected factory lifetime behavior, so choose ownership deliberately.',
        },
        {
          title: 'A timeout is a budget, not a recovery strategy',
          body: "Propagate CancellationToken and define an end-to-end request deadline. Per-attempt timeouts plus multiple retries can exceed the caller's total budget. A circuit breaker temporarily stops calls to a failing dependency; it is not the same as retry. A concurrency limiter protects in-flight capacity.\n\nRetries can help transient failures, but increase load and can amplify an outage when every layer retries. Use bounded attempts with jitter and observe outcomes. A POST may have succeeded before its response was lost, so retrying can duplicate side effects unless the API has a suitable idempotency contract.",
        },
        {
          title: 'Validate the response and the destination',
          body: 'Check status and deserialize an expected contract. A 200 response can still contain malformed or incompatible data. Dispose response objects when appropriate, especially with streaming responses. Set payload size and timeout limits so a dependency cannot consume unlimited resources.\n\nA user-supplied outbound URL needs an SSRF policy, not just Uri.TryCreate. Credentials should be attached only to intended destinations, with redirect behavior considered. Log safe dependency context and trace identity, not authorization headers or entire sensitive payloads. The Microsoft resilience integration builds on established libraries, but its defaults still need review for your operations.',
        },
      ],
      diagram: {
        title: 'A bounded outbound call',
        source:
          'flowchart LR\n  request["Caller deadline"] --> factory["Configured HttpClient"]\n  factory --> policy["Timeout / retry / breaker policy"]\n  policy --> remote["Trusted remote endpoint"]\n  remote --> validate["Validate status and payload"]',
        caption:
          "Retries fit inside a total budget and must respect the operation's duplicate-side-effect contract.",
      },
      example: {
        title: 'Call the local TaskFlow health endpoint',
        filename: 'Program.cs',
        language: 'csharp',
        setup:
          'Run the bundled TaskFlow API on localhost:5050. In a separate net10.0 web project add Microsoft.Extensions.Http.Resilience version 10.*, use this Program.cs, and run it on localhost:5051. Request /dependency-health.',
        code: 'var builder = WebApplication.CreateBuilder(args);\nbuilder.Services.AddHttpClient("taskflow", client =>\n{\n    client.BaseAddress = new Uri("http://localhost:5050");\n    client.Timeout = TimeSpan.FromSeconds(5);\n}).AddStandardResilienceHandler(options =>\n    options.Retry.DisableForUnsafeHttpMethods());\n\nvar app = builder.Build();\napp.MapGet("/dependency-health", async (IHttpClientFactory factory, CancellationToken token) =>\n{\n    using var client = factory.CreateClient("taskflow");\n    using var response = await client.GetAsync("/health", token);\n    response.EnsureSuccessStatusCode();\n    return Results.Ok(new { dependency = "available" });\n});\napp.Run();',
        output: 'Healthy local dependency -> 200 with {"dependency":"available"}',
        explanation: [
          'The factory manages handlers while the short-lived client wrapper is disposed after use.',
          'Unsafe HTTP methods are excluded from automatic retries in this configuration.',
          'The example uses loopback HTTP only. Production needs HTTPS, a reviewed total/attempt timeout policy, and safe error translation for dependency failures.',
        ],
      },
      traps: [
        {
          question: 'Should every failed POST be retried automatically?',
          answer:
            'No. The operation may have committed before the response was lost. Retry only when the contract makes repeated effects safe or supports durable idempotency.',
          warning:
            'A timeout describes what the caller observed, not what the remote system committed.',
        },
        {
          question: 'Does a circuit breaker retry a failed call until it succeeds?',
          answer:
            'No. It stops or limits calls after a failure threshold and later probes recovery. Retry is a separate strategy.',
          warning: 'Stacking strategies without a shared time and load budget can worsen outages.',
        },
      ],
      exercise: {
        title: 'Budget an outbound workflow',
        brief:
          'An incoming request has a two-second deadline and calls a dependency that sometimes fails.',
        steps: [
          'Define total and per-attempt budgets.',
          'Choose which failures and methods are retryable.',
          'Ensure cancellation reaches the actual HTTP call.',
        ],
        solution:
          "Keep the entire dependency policy within the caller's budget, leave time for response handling, and use only bounded retry-safe attempts. Propagate cancellation and measure failure/retry rates. Do not add several independent five-second policies to a two-second operation.",
      },
      quiz: {
        question: 'What does IHttpClientFactory primarily help manage?',
        options: [
          'Database migrations',
          'HttpClient configuration and underlying handler lifetimes',
          'User password recovery',
          'Automatic business idempotency',
        ],
        answer: 1,
        explanation:
          'The factory centralizes client configuration and manages pooled handler lifetimes. It does not infer whether a business operation is safe to retry or make remote writes atomic.',
      },
      references: [
        {
          label: 'IHttpClientFactory',
          url: 'https://learn.microsoft.com/en-us/dotnet/core/extensions/httpclient-factory',
        },
        {
          label: 'HTTP resilience',
          url: 'https://learn.microsoft.com/en-us/dotnet/core/resilience/http-resilience',
        },
      ],
    },
    {
      id: 'distributed-systems',
      title: 'Caching, messaging & the outbox',
      subtitle: 'Make duplicate delivery and partial failure part of the design.',
      minutes: 34,
      tags: [
        'Redis',
        'distributed cache',
        'outbox',
        'inbox',
        'message broker',
        'eventual consistency',
        'saga',
        'CAP',
      ],
      outcomes: [
        'Explain cache-aside and stale-data tradeoffs.',
        'Describe an atomic outbox and idempotent consumer.',
        'Reason about eventual consistency and partial failure.',
      ],
      sections: [
        {
          title: 'A distributed cache is another dependency',
          body: 'A shared cache such as Redis can make cached values available across app instances. Cache-aside first checks the cache, loads from the source on a miss, then stores the result. Define expiry, invalidation, serialization compatibility, capacity, and behavior when the cache fails. A cache should not accidentally become the only durable copy of a task.\n\nMany simultaneous misses can cause a cache stampede. Coordination, bounded refresh, or stale-while-revalidate policies can help, but require a freshness contract. A distributed lock has lease and failure semantics; do not assume holding a key proves exclusive ownership forever.',
        },
        {
          title: 'The outbox closes one important gap',
          body: 'Suppose a task write succeeds but publishing its event fails. Publishing first has the opposite problem: consumers may hear about a change that later rolls back. The transactional outbox writes the business data and a message record in the same local database transaction. A separate publisher sends pending messages and marks them delivered.\n\nThe publisher can crash after sending but before marking the message, so duplicates remain possible. Consumers need idempotent behavior, often recording a message ID in an inbox transaction with their own state changes. This provides a practical at-least-once workflow; it does not magically create exactly-once effects across arbitrary systems.',
        },
        {
          title: 'Consistency is a product decision',
          body: "Eventual consistency means different views may temporarily disagree but converge under the system's assumptions. Tell users what pending state means and define how failures are retried or reconciled. A saga coordinates a multi-step business process with compensating actions; compensation is not always the same as reversing time.\n\nCAP is about consistency and availability choices during network partitions under its formal definitions, not a general slogan to pick any two features forever. Most design work also involves latency, durability, ordering, operational complexity, and failure recovery. Prefer a local transaction where it satisfies the requirement before introducing distributed coordination.",
        },
      ],
      diagram: {
        title: 'A transactional outbox',
        source:
          'flowchart LR\n  operation["Task operation"] --> transaction["One database transaction"]\n  transaction --> data["Task row"]\n  transaction --> outbox["Outbox row"]\n  outbox --> publisher["Retrying publisher"]\n  publisher --> broker["Message broker"]\n  broker --> consumer["Idempotent consumer"]',
        caption:
          'The local transaction prevents a missing event record. Delivery can still repeat, so consumers deduplicate.',
      },
      example: {
        title: 'Store a task and event together',
        filename: 'outbox.sql',
        language: 'sql',
        setup:
          'SQLite demonstration using the Projects and Tasks schema from the SQL lesson, with project ID 1 present. Create the Outbox table once, then run the transaction. A separate publisher is still required.',
        code: "CREATE TABLE Outbox (\n    Id TEXT PRIMARY KEY,\n    Type TEXT NOT NULL,\n    Payload TEXT NOT NULL,\n    PublishedAt TEXT NULL\n);\n\nBEGIN TRANSACTION;\nINSERT INTO Tasks (ProjectId, Title)\nVALUES (1, 'Understand the outbox');\n\nINSERT INTO Outbox (Id, Type, Payload)\nVALUES (lower(hex(randomblob(16))), 'TaskCreated',\n        json_object('taskId', last_insert_rowid()));\nCOMMIT;",
        output: 'The task and its pending outbox message commit together in the local database.',
        explanation: [
          'The message stores the newly inserted task ID inside a JSON payload.',
          'An outbox record is not yet a delivered message. A publisher must claim, send, retry, and mark records safely.',
          'Repeating this whole transaction creates another task. Request idempotency is a separate contract from reliable event publication.',
        ],
      },
      traps: [
        {
          question: 'Does the outbox guarantee exactly-once consumer side effects?',
          answer:
            'No. A message can be sent more than once after a crash or retry. Consumers must deduplicate and make their state transition idempotent where needed.',
          warning:
            'Atomic local recording and global exactly-once execution are different guarantees.',
        },
        {
          question: 'Can a cache TTL guarantee immediate freshness after a write?',
          answer:
            'No. TTL bounds one form of staleness but does not invalidate all related entries immediately. Define invalidation and concurrent refresh behavior explicitly.',
          warning:
            'A short stale window can still violate a critical authorization or balance rule.',
        },
      ],
      exercise: {
        title: 'Handle a duplicate TaskCreated message',
        brief: 'A consumer receives the same event twice after the publisher restarts.',
        steps: [
          'Give every message a stable ID.',
          "Record processed IDs atomically with the consumer's state update.",
          'Return safely when an already-processed ID appears again.',
        ],
        solution:
          'Use a unique inbox/message-ID constraint and a transaction that includes both deduplication and the business update. A separate check followed by an unprotected write can race. Define retention so deduplication records remain long enough for the delivery/replay policy.',
      },
      quiz: {
        question: 'Why can an outbox publisher still deliver a duplicate?',
        options: [
          'SQL cannot store text',
          'It can crash after sending but before marking the message delivered',
          'Every queue deletes all IDs',
          'A transaction automatically sends messages twice',
        ],
        answer: 1,
        explanation:
          'Sending to the broker and marking the local outbox are usually separate operations. A crash between them causes a later retry to send the same message again.',
      },
      references: [
        {
          label: 'Transactional outbox',
          url: 'https://learn.microsoft.com/en-us/azure/architecture/databases/guide/transactional-outbox-cosmos',
        },
        {
          label: 'Cache-aside pattern',
          url: 'https://learn.microsoft.com/en-us/azure/architecture/patterns/cache-aside',
        },
        {
          label: 'Saga pattern',
          url: 'https://learn.microsoft.com/en-us/azure/architecture/patterns/saga',
        },
      ],
    },
    {
      id: 'system-design',
      title: 'System design for a growing TaskFlow',
      subtitle: 'Start with requirements, then explain the tradeoffs behind each component.',
      minutes: 35,
      tags: [
        'system design',
        'scalability',
        'load balancer',
        'stateless',
        'SLO',
        'RPO',
        'RTO',
        'microservices',
      ],
      outcomes: [
        'Clarify functional and nonfunctional requirements.',
        'Design a proportionate scalable service.',
        'Explain bottlenecks, failure modes, and recovery objectives.',
      ],
      sections: [
        {
          title: 'Ask what must be true',
          body: 'Start with users and operations: personal tasks or shared projects, expected data volume, peak request rate, read/write ratio, and acceptable latency. Ask which operations require immediate consistency and which can be asynchronous. State assumptions when the interviewer does not provide numbers; invented numbers are planning scenarios, not facts.\n\nDefine security boundaries, availability objectives, data retention, and recovery needs. RPO is the acceptable amount of data loss measured in time. RTO is the target time to restore service. A backup file is not proof that either target can be met; restoration must be tested.',
        },
        {
          title: 'Choose a simple baseline architecture',
          body: 'A reasonable starting point is a stateless ASP.NET Core application behind a reverse proxy or load balancer, a relational database with appropriate indexes, a trusted identity provider, and object storage for large exports or attachments. Add a durable worker queue when operations should outlive requests. Add a shared cache when a measured repeated-read pattern justifies it.\n\nStateless application instances do not mean no database. They mean a request should not require hidden per-user state in one particular instance. Authentication keys, configuration, and shared services still need compatible deployment. The database can remain the main capacity constraint even after adding more API replicas.',
        },
        {
          title: 'Walk through failure, not just success',
          body: "Describe what happens when the database slows, the cache disappears, a replica restarts, a message repeats, or a deployment changes the schema. Use timeout budgets, backpressure, graceful degradation where correct, and safe rollback or roll-forward plans. Avoid degraded behavior that silently returns another user's data or accepts writes it cannot preserve.\n\nFor interviews, narrate one request end to end: identity validation, authorization, bounded query or transaction, response, and telemetry. Then identify the likely bottleneck and the evidence that would justify the next change. A component diagram is a starting point; a defensible explanation of consistency and failure is the real design.",
        },
      ],
      diagram: {
        title: 'A proportionate production architecture',
        source:
          'flowchart LR\n  client["Web / mobile client"] --> edge["TLS proxy / load balancer"]\n  edge --> api["Stateless ASP.NET Core replicas"]\n  api --> identity["Trusted identity provider"]\n  api --> db["Relational database"]\n  api --> cache["Optional shared cache"]\n  db --> outbox["Outbox / durable jobs"]\n  outbox --> worker["Background worker"]\n  worker --> storage["Object storage / notifications"]',
        caption:
          'Each extra component should serve a stated requirement and have a defined failure behavior.',
      },
      example: {
        title: 'Record a hypothetical design budget',
        filename: 'design-assumptions.json',
        language: 'json',
        setup:
          'A planning artifact, not runtime configuration. These example targets must be validated with the product team and load testing; they are not measured results for this starter app.',
        code: '{\n  "scenario": "small collaborative task service",\n  "peakRequestsPerSecond": 200,\n  "maxPageSize": 100,\n  "readLatencyP95TargetMs": 250,\n  "availabilityTargetPercent": 99.9,\n  "recoveryPointTargetMinutes": 15,\n  "recoveryTimeTargetMinutes": 60,\n  "consistency": {\n    "taskWrites": "transactional",\n    "emailNotifications": "eventual with retries"\n  }\n}',
        explanation: [
          'Explicit assumptions let reviewers challenge the design instead of guessing what scale you intended.',
          'Targets are not guarantees. The system needs measurement, monitoring, and tested recovery procedures.',
          'Different operations can have different consistency and latency needs without requiring a microservice for each one.',
        ],
      },
      traps: [
        {
          question: 'Will adding API replicas always fix a slow service?',
          answer:
            'No. A shared database, connection pool, downstream service, or lock can remain the bottleneck. Replicas can even increase pressure on that dependency.',
          warning: 'Scale the measured constraint, not only the easiest deployment setting.',
        },
        {
          question: 'Does having backups prove a recovery objective?',
          answer:
            'No. You must verify restore correctness, restoration time, available history, and dependencies. RPO and RTO are operational targets that require rehearsals.',
          warning: 'An unreadable or incomplete backup is not a recovery plan.',
        },
      ],
      exercise: {
        title: 'Present a ten-minute system design',
        brief:
          'Design TaskFlow for shared projects, authenticated users, and asynchronous exports.',
        steps: [
          'State assumptions and access rules.',
          'Trace a task update and an export request.',
          'Explain one bottleneck, one failure mode, and one recovery test.',
        ],
        solution:
          'Use a clear baseline with transactional task storage, ownership/membership checks, bounded queries, and a durable export workflow returning a status resource. Explain timeout and retry behavior, data backups, and measured scaling decisions. Avoid adding a service or cache without naming the requirement it serves.',
      },
      quiz: {
        question: 'What should come before choosing a message broker or cache?',
        options: [
          'A list of fashionable technologies',
          'Requirements and the guarantees the operation needs',
          'The number of folders in the repository',
          'A promise of zero latency',
        ],
        answer: 1,
        explanation:
          'Functional needs, scale assumptions, consistency, security, and recovery requirements determine whether a component is useful. Technology selection without those constraints is difficult to justify.',
      },
      references: [
        {
          label: 'Azure Well-Architected Framework',
          url: 'https://learn.microsoft.com/en-us/azure/well-architected/',
        },
        {
          label: 'Cloud design patterns',
          url: 'https://learn.microsoft.com/en-us/azure/architecture/patterns/',
        },
      ],
    },
  ],
}
