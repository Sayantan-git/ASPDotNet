import type { Chapter } from '../types'

export const quality: Chapter = {
  id: 'quality',
  title: 'Test, debug & observe',
  description: 'Prove behavior, investigate failures, and measure the right things.',
  level: 'Intermediate',
  accent: 'lime',
  lessons: [
    {
      id: 'unit-testing',
      title: 'Unit tests that protect behavior',
      subtitle:
        'Test the rule and its boundaries, not the private implementation you hope never changes.',
      minutes: 28,
      tags: ['xUnit', 'unit test', 'Theory', 'Fact', 'AAA', 'mock', 'test double', 'TDD'],
      outcomes: [
        'Write focused, deterministic unit tests.',
        'Choose representative boundary cases.',
        'Use test doubles only at useful boundaries.',
      ],
      sections: [
        {
          title: 'A test is an executable expectation',
          body: 'A unit test checks a small unit of behavior in a controlled environment. Arrange establishes inputs and dependencies, Act performs the operation, and Assert checks an observable outcome. A descriptive test name explains the rule, such as EmptyBoardHasZeroProgress. Avoid names that merely repeat the method name without saying what should happen.\n\nTests should be deterministic: the same relevant inputs should produce the same expected result. Direct use of the system clock, random data, network services, or a shared mutable database can make a small test unreliable. Inject a clock abstraction or TimeProvider when time is part of the behavior, and keep external integration in the appropriate test layer.',
        },
        {
          title: 'Select cases that discriminate',
          body: 'Happy-path tests are necessary but insufficient. Check empty collections, exact boundaries, invalid ranges, repeated operations, and relevant null cases. A progress rule should cover zero tasks, no completed tasks, partial completion, all complete, and impossible counts. Each case should be capable of catching a plausible bug.\n\nFact represents a single test case in xUnit. Theory supports parameterized examples. Assert observable results and meaningful side effects rather than private fields or every internal call. Overly coupled tests fail during harmless refactoring and teach the team to distrust the suite.',
        },
        {
          title: 'Doubles replace an external boundary',
          body: 'A stub supplies controlled data; a fake offers a simplified working implementation; a mock can verify interactions. Terminology varies, but the design goal is to control a dependency that would otherwise make the test slow or unpredictable. A recording notifier is often easier to understand than a large mocking configuration.\n\nDo not mock all domain objects or LINQ internals just to claim isolation. Database behavior needs database integration tests. Code coverage measures executed code, not assertion quality or correct requirements. A line can be covered while the test would still pass if the result were wrong. Tests should protect decisions, not just inflate a percentage.',
        },
      ],
      diagram: {
        title: 'A focused test loop',
        source:
          'flowchart LR\n  arrange["Arrange inputs"] --> act["Act on one behavior"]\n  act --> assert["Assert observable result"]\n  assert --> regression["Catch a plausible regression"]',
        caption:
          'Good cases distinguish the correct implementation from realistic mistakes at the same boundary.',
      },
      example: {
        title: 'Test a progress calculation',
        filename: 'ProgressTests.cs',
        language: 'csharp',
        setup:
          'Create `dotnet new xunit -n TaskFlow.Tests -f net10.0`. Add this file and run dotnet test. The small production helper is included here only to keep this teaching example self-contained; normally reference the application project.',
        code: 'using Xunit;\n\npublic sealed class ProgressTests\n{\n    [Theory]\n    [InlineData(0, 0, 0)]\n    [InlineData(0, 4, 0)]\n    [InlineData(3, 4, 75)]\n    [InlineData(4, 4, 100)]\n    public void CalculatesExpectedPercentage(int completed, int total, double expected)\n    {\n        Assert.Equal(expected, Progress.Calculate(completed, total));\n    }\n}\n\npublic static class Progress\n{\n    public static double Calculate(int completed, int total)\n    {\n        if (total < 0 || completed < 0 || completed > total)\n            throw new ArgumentOutOfRangeException(nameof(completed));\n        return total == 0 ? 0 : 100.0 * completed / total;\n    }\n}',
        output: 'Four parameterized cases pass for the supplied calculation.',
        explanation: [
          'The empty-board case forces an explicit zero-denominator rule.',
          'The partial case detects accidental integer division.',
          'The test set should be extended with invalid-range assertions. Floating-point calculations with other values may require a justified tolerance or precision assertion.',
        ],
      },
      traps: [
        {
          question: 'Does 100% line coverage prove the application is correct?',
          answer:
            'No. It says code executed, not that requirements were complete or assertions discriminated correct results. Missing cases and weak assertions can coexist with full coverage.',
          warning: 'Coverage is a signal, not a correctness certificate.',
        },
        {
          question: 'Should every dependency be mocked?',
          answer:
            'No. Use doubles where they make a test focused and deterministic. Real value objects and simple domain behavior usually need no mocking, and database semantics need integration coverage.',
          warning: 'Tests can become less trustworthy when they only verify a web of mocks.',
        },
      ],
      exercise: {
        title: 'Test the rejected states',
        brief:
          'Extend the progress tests to reject negative counts and completed greater than total.',
        steps: [
          'Use Assert.Throws for the documented failure type.',
          'Add one case for each invalid boundary.',
          'Mutate the implementation temporarily in your own working copy to confirm a test would fail.',
        ],
        solution:
          'Add explicit exception assertions for negative total, negative completed, and completed above total. Keep each expectation tied to the method contract. A useful test fails when the protected behavior is broken, not only when a method name changes.',
      },
      quiz: {
        question: 'What is the strongest reason to add a test case?',
        options: [
          'It increases the file count',
          'It distinguishes a correct rule from a plausible bug',
          'It calls every private method',
          'It makes a screenshot look complete',
        ],
        answer: 1,
        explanation:
          'Tests earn their cost by catching meaningful regressions. Merely executing code or adding files does not establish that the important behavior is protected.',
      },
      references: [
        {
          label: '.NET unit testing',
          url: 'https://learn.microsoft.com/en-us/dotnet/core/testing/unit-testing-with-dotnet-test',
        },
        {
          label: 'Unit testing best practices',
          url: 'https://learn.microsoft.com/en-us/dotnet/core/testing/unit-testing-best-practices',
        },
      ],
    },
    {
      id: 'integration-testing',
      title: 'Integration tests through the real host',
      subtitle: 'Exercise the pipeline your clients actually use.',
      minutes: 32,
      tags: [
        'WebApplicationFactory',
        'TestServer',
        'integration test',
        'SQLite',
        'Testcontainers',
        'authentication tests',
      ],
      outcomes: [
        'Use a hosted HTTP client for endpoint tests.',
        'Isolate data and external dependencies.',
        'Choose a database test strategy with honest limitations.',
      ],
      sections: [
        {
          title: 'Test the assembled application',
          body: 'An integration test checks components working together. WebApplicationFactory can boot an ASP.NET Core application with a test server and provide an HttpClient. Requests exercise routing, binding, middleware, serialization, and the configured endpoint pipeline. This catches failures that direct controller calls cannot see.\n\nExpose a suitable Program type for the test assembly, often with public partial class Program at the end of a top-level entry-point file. Reference the web project and a compatible Microsoft.AspNetCore.Mvc.Testing package. Keep test-specific configuration explicit so a test cannot accidentally contact production services or write to a real user database.',
        },
        {
          title: 'Choose a realistic data boundary',
          body: "EF Core's InMemory provider is not a relational database. It does not reproduce SQL translation, foreign keys, transactions, or provider-specific behavior accurately. SQLite in-memory is useful for many relational tests, but still differs from SQL Server or PostgreSQL. Keep its connection open for the intended database lifetime.\n\nFor production-specific behavior, run tests against the real database engine, often using an isolated container or disposable database. Control schema setup and cleanup. Parallel tests should not race on shared mutable fixtures unless that is the behavior under test. Isolation is part of test correctness, not just housekeeping.",
        },
        {
          title: 'Assert the whole contract',
          body: "Check status codes, content types, response DTOs, Location headers, validation error shapes, and persisted state. Include invalid JSON, missing resources, unauthorized callers, forbidden ownership, and concurrency conflicts. A 200 status alone is a weak assertion if the wrong user's data is returned.\n\nA test authentication handler can establish controlled identities for authorization tests, but it does not verify real JWT or OIDC validation. Keep a separate strategy for that boundary. In-process hosting also does not prove reverse proxy, TLS, container networking, or production configuration; deployment smoke tests cover those additional risks.",
        },
      ],
      diagram: {
        title: 'Integration test boundary',
        source:
          'flowchart LR\n  test["Test HttpClient"] --> host["WebApplicationFactory"]\n  host --> pipeline["Real middleware + endpoints"]\n  pipeline --> db["Isolated test database"]\n  pipeline --> external["Controlled external adapters"]',
        caption:
          'Replace external dependencies intentionally while retaining the HTTP behavior under test.',
      },
      example: {
        title: 'A host-level health smoke test',
        filename: 'HealthTests.cs',
        language: 'csharp',
        setup:
          'In an xUnit project, reference the web app and add Microsoft.AspNetCore.Mvc.Testing version 10.*. The app must map /health and expose public partial class Program. Use an isolated test host with no production resources; this smoke test does not itself replace database configuration.',
        code: 'using System.Net;\nusing Microsoft.AspNetCore.Mvc.Testing;\nusing Xunit;\n\npublic sealed class HealthTests\n{\n    [Fact]\n    public async Task HealthEndpointRespondsSuccessfully()\n    {\n        await using var factory = new WebApplicationFactory<Program>();\n        using var client = factory.CreateClient();\n        using var response = await client.GetAsync("/health");\n\n        Assert.Equal(HttpStatusCode.OK, response.StatusCode);\n    }\n}',
        output:
          'The test passes only when the configured test host starts and /health returns 200.',
        explanation: [
          "The client sends a real request through the application's in-process HTTP pipeline.",
          'Disposal releases the factory and client resources after the test.',
          'This is a startup smoke test, not complete health, persistence, authorization, or deployment coverage. The bundled sample adds task and validation integration tests.',
        ],
      },
      traps: [
        {
          question: 'Is EF InMemory equivalent to testing SQL Server?',
          answer:
            'No. It does not reproduce relational constraints, SQL translation, transactions, or engine-specific behavior. Use appropriate relational and production-engine tests for those risks.',
          warning: 'A passing fake-provider test can conceal a query that fails in production.',
        },
        {
          question: 'Does a fake authentication handler test JWT signature validation?',
          answer:
            'No. It helps control principals for authorization tests. Real credential validation is a separate integration boundary that needs its own verification.',
          warning: 'Name tests according to the guarantee they actually establish.',
        },
      ],
      exercise: {
        title: 'Test a create-read round trip',
        brief: 'POST a valid task, then follow the returned Location with GET.',
        steps: [
          'Use a fresh isolated database.',
          'Assert 201, Location, and the response fields.',
          'Read the created task and test an invalid create without changing the row count.',
        ],
        solution:
          'Exercise creation through HTTP and verify both the protocol and storage effects. Follow the actual returned ID instead of assuming 1. The invalid request should return the documented error and create no row. Isolate each test run so previous data cannot make it pass accidentally.',
      },
      quiz: {
        question:
          'What does WebApplicationFactory add compared with directly calling a controller method?',
        options: [
          'Automatic proof of production TLS',
          'An in-process host that exercises the HTTP pipeline',
          'A guarantee that every SQL provider behaves identically',
          'A replacement for all assertions',
        ],
        answer: 1,
        explanation:
          'It lets an HttpClient exercise the assembled ASP.NET Core pipeline. It does not automatically test external hosting infrastructure or make weak assertions sufficient.',
      },
      references: [
        {
          label: 'ASP.NET Core integration tests',
          url: 'https://learn.microsoft.com/en-us/aspnet/core/test/integration-tests?view=aspnetcore-10.0',
        },
        {
          label: 'EF Core testing strategy',
          url: 'https://learn.microsoft.com/en-us/ef/core/testing/choosing-a-testing-strategy',
        },
      ],
    },
    {
      id: 'debugging-and-diagnostics',
      title: 'Debugging from evidence',
      subtitle: 'Reproduce, form one hypothesis, and run a check that can prove it wrong.',
      minutes: 25,
      tags: [
        'debugging',
        'breakpoint',
        'stack trace',
        'dotnet-counters',
        'dump',
        'thread pool',
        'diagnostics',
      ],
      outcomes: [
        'Use a focused debugging loop.',
        'Read stack traces and inspect state.',
        'Choose counters, traces, or dumps for the symptom.',
      ],
      sections: [
        {
          title: 'Start with an observable failure',
          body: 'Write down the expected behavior, actual behavior, exact inputs, and environment. Find the smallest reproducible case. A report that a page is slow could mean server latency, a large download, client rendering, or a blocked external dependency. Measure which part is slow before rewriting code.\n\nForm one local hypothesis and choose a cheap check that could disprove it. For example: the second middleware never runs because the first short-circuits. A trace around next distinguishes that from a route mismatch. Do not change several unrelated things at once, because a passing result then provides weak evidence about the cause.',
        },
        {
          title: 'Use the debugger to inspect a running path',
          body: 'Breakpoints pause execution at selected code. Conditional breakpoints narrow the case. Step Over executes the current statement without entering each call; Step Into enters a call; Step Out returns to the caller. Inspect locals and the call stack, but remember that evaluating some properties in a debugger can execute code.\n\nAn exception stack trace shows where the failure traveled, not necessarily the deepest business cause. Preserve original exception information and inspect inner exceptions. Async stack traces and tasks require careful interpretation: thread IDs may change while one logical operation continues. Confirm you are attached to the correct process and matching build symbols.',
        },
        {
          title: 'Choose the diagnostic signal',
          body: 'Counters reveal trends such as allocation rate, CPU use, and thread-pool pressure. Traces show timed events and sampled execution. Dumps capture process state for deeper analysis. Each has overhead, privacy implications, and a different question it can answer. A dump can contain secrets and user data, so collect and share it through a protected process.\n\nFor high latency with low CPU, inspect waits, connection pools, and downstream calls. For high CPU, profile execution. For increasing memory, distinguish temporary allocation from retained objects. Add a regression test after finding the defect so the next change does not reintroduce it. Debugging ends with verified behavior, not just a plausible explanation.',
        },
      ],
      diagram: {
        title: 'A discriminating debugging loop',
        source:
          'flowchart LR\n  reproduce["Reproduce symptom"] --> hypothesis["One local hypothesis"]\n  hypothesis --> check["Discriminating check"]\n  check --> repair["Small repair"]\n  repair --> verify["Repeat check + regression test"]',
        caption:
          'A useful check can falsify the hypothesis. Multiple simultaneous changes make the evidence harder to interpret.',
      },
      example: {
        title: 'Inspect a running .NET process',
        filename: 'diagnostics.ps1',
        language: 'bash',
        setup:
          'Install the official dotnet-counters tool if needed. Replace <PID> with the process ID shown by ps; angle-bracket placeholders are not literal shell input. Run only against a process you are authorized to inspect.',
        code: 'dotnet tool install --global dotnet-counters\ndotnet-counters ps\ndotnet-counters monitor --process-id <PID> --counters System.Runtime',
        output:
          'Live runtime counters for the selected process; exact names and values depend on the runtime and tool version.',
        explanation: [
          'Process discovery helps avoid attaching to an unrelated dotnet process.',
          'Counters reveal trends but do not directly prove which line of code caused them.',
          'Use a bounded diagnostic session and stop monitoring when the observation is complete. Treat captured diagnostics as potentially sensitive.',
        ],
      },
      traps: [
        {
          question: 'Does low CPU prove the application is healthy?',
          answer:
            'No. It may be waiting on a database, a lock, a connection pool, or blocked I/O. Latency and throughput can be poor while CPU is low.',
          warning: 'Choose signals based on the symptom rather than one familiar metric.',
        },
        {
          question: 'Does the line where an exception is caught identify its original cause?',
          answer:
            'Not necessarily. Inspect the original stack and inner exceptions. A catch boundary can be far from the failing operation or invalid earlier state.',
          warning: 'Avoid resetting the stack trace while rethrowing.',
        },
      ],
      exercise: {
        title: 'Investigate a slow endpoint',
        brief: 'An endpoint takes three seconds but the application uses little CPU.',
        steps: [
          'Measure database and outbound HTTP duration separately.',
          'Check for blocking waits and connection-pool pressure.',
          'Change one relevant cause and rerun the same measurement.',
        ],
        solution:
          'Low CPU suggests waiting may dominate, but it is only a hypothesis. Correlate the request with dependency timings and runtime signals. Fix the measured bottleneck, then verify latency and resource use under the same workload. Do not add CPU parallelism to an unmeasured waiting problem.',
      },
      quiz: {
        question: 'What is a good first debugging experiment?',
        options: [
          'Rewrite every nearby class',
          'A small check that can disprove a specific hypothesis',
          'Delete all logs',
          'Change the database and framework versions together',
        ],
        answer: 1,
        explanation:
          'A focused experiment gives interpretable evidence. Broad simultaneous changes can hide the cause and introduce unrelated regressions.',
      },
      references: [
        {
          label: '.NET diagnostics tools',
          url: 'https://learn.microsoft.com/en-us/dotnet/core/diagnostics/tools-overview',
        },
        {
          label: 'dotnet-counters',
          url: 'https://learn.microsoft.com/en-us/dotnet/core/diagnostics/dotnet-counters',
        },
      ],
    },
    {
      id: 'logging-and-observability',
      title: 'Structured logs, metrics & tracing',
      subtitle: 'Make an operation explainable across requests, services, and failures.',
      minutes: 28,
      tags: [
        'ILogger',
        'structured logging',
        'OpenTelemetry',
        'metrics',
        'tracing',
        'Activity',
        'correlation',
        'cardinality',
      ],
      outcomes: [
        'Use message templates and useful log levels.',
        'Separate logs, metrics, and distributed traces.',
        'Avoid sensitive data and high-cardinality metric labels.',
      ],
      sections: [
        {
          title: 'Logs are events with structure',
          body: 'A structured log records named fields, not just a formatted sentence. ILogger message templates such as Reading task {TaskId} let a provider preserve TaskId as a searchable field. String interpolation eagerly constructs text and loses that template structure. Choose stable event meanings and appropriate levels: routine expected behavior is not always an error.\n\nUse scopes or tracing context to connect related events. Log a failure where you can add useful context, not at every layer as it propagates. Never log passwords, bearer tokens, secret configuration, or unnecessary personal data. Redaction and access control belong in the logging design.',
        },
        {
          title: 'Three signals answer different questions',
          body: '| Signal | Useful question |\n| --- | --- |\n| Logs | What specific event happened and with what context? |\n| Metrics | How often, how much, and how does the trend change? |\n| Traces | Where did time go across a distributed operation? |\n\nOpenTelemetry provides APIs and conventions for collecting telemetry and exporting it to compatible systems. Instrumentation, sampling, collection, and backend retention are separate choices. Installing a package without configuring an exporter does not make traces appear in a dashboard.',
        },
        {
          title: 'Observability must remain affordable and safe',
          body: 'Metric labels should have bounded cardinality: a small controlled set of values. Labeling every metric by raw user ID, request URL, or unique task ID can create huge time-series counts. Put high-cardinality context in appropriately controlled logs or traces instead, and normalize route names rather than using every raw path.\n\nTrace context should propagate to outbound calls so dependency work remains connected. Correlation IDs supplied by clients need length and character controls before logging. Define service-level indicators such as successful-request rate and latency percentiles, then alert on user-relevant symptoms. A dashboard with many charts is not evidence that the important failure is detectable.',
        },
      ],
      diagram: {
        title: 'One request, connected signals',
        source:
          'flowchart TB\n  request["Task request / trace context"] --> logs["Logs: structured events"]\n  request --> metrics["Metrics: counts and latency"]\n  request --> trace["Trace: API + database spans"]\n  logs --> investigation["Correlated investigation"]\n  metrics --> investigation\n  trace --> investigation',
        caption:
          'Each signal adds a different view. Keep identity, privacy, and cardinality policies explicit.',
      },
      example: {
        title: 'Log a structured task lookup',
        filename: 'Program.cs',
        language: 'csharp',
        setup:
          'Complete web example using the built-in logging abstractions. The console rendering depends on provider configuration; a structured provider can retain TaskId as a separate field.',
        code: 'var builder = WebApplication.CreateBuilder(args);\nvar app = builder.Build();\n\napp.MapGet("/tasks/{id:int}", (int id, ILogger<Program> logger) =>\n{\n    logger.LogInformation("Reading task {TaskId}", id);\n    return Results.Ok(new { id, title = "Observe the request" });\n});\n\napp.Run();',
        output: 'A request for /tasks/42 emits an Information event with TaskId = 42.',
        explanation: [
          'The template remains constant while the named value changes.',
          'No token, cookie, or full request body is logged.',
          'This example demonstrates structured logging only. OpenTelemetry tracing requires its own instrumentation and exporter configuration.',
        ],
      },
      traps: [
        {
          question: 'Why not use a unique user ID as a label on every metric?',
          answer:
            'It creates potentially unbounded cardinality, increasing storage and query costs. Use bounded dimensions for metrics and appropriate controlled logs or traces for unique context.',
          warning: 'More detail in every metric can make observability less usable.',
        },
        {
          question: 'Does adding OpenTelemetry automatically export data?',
          answer:
            'No. Instrumentation, providers, exporters, and collection/backends must be configured. Sampling and network connectivity also affect what reaches the destination.',
          warning:
            'A missing trace can be a pipeline configuration issue, not proof the request never ran.',
        },
      ],
      exercise: {
        title: 'Design useful task telemetry',
        brief: 'Define signals for task creation failures and slow database queries.',
        steps: [
          'Choose one structured event and its safe fields.',
          'Choose a bounded metric dimension and a latency measure.',
          'Describe the trace spans needed to find the slow dependency.',
        ],
        solution:
          'Record operation, safe outcome category, and trace identity in logs; count outcomes by normalized route and status class; measure latency with suitable histograms. Trace the request and database call. Keep raw task IDs out of unbounded metric labels and exclude secrets from all signals.',
      },
      quiz: {
        question: 'Which log call best preserves a structured TaskId field?',
        options: [
          'LogInformation($"Task {id}")',
          'LogInformation("Task {TaskId}", id)',
          'LogInformation(id.ToString())',
          'LogInformation("Everything failed")',
        ],
        answer: 1,
        explanation:
          'A constant message template with a named placeholder lets logging providers retain the value as structured data. Interpolation primarily creates a finished string.',
      },
      references: [
        {
          label: 'Logging in .NET',
          url: 'https://learn.microsoft.com/en-us/dotnet/core/extensions/logging',
        },
        {
          label: '.NET OpenTelemetry',
          url: 'https://learn.microsoft.com/en-us/dotnet/core/diagnostics/observability-with-otel',
        },
      ],
    },
    {
      id: 'performance-and-benchmarks',
      title: 'Performance, profiling & benchmarks',
      subtitle: 'Optimize the bottleneck you measured, and verify that correctness survived.',
      minutes: 28,
      tags: [
        'BenchmarkDotNet',
        'profiling',
        'p95',
        'allocation',
        'load test',
        'Amdahl',
        'pooling',
        'performance',
      ],
      outcomes: [
        'Distinguish microbenchmarks from load tests.',
        'Measure latency distribution and throughput.',
        'Prioritize query shape and allocation evidence before low-level tricks.',
      ],
      sections: [
        {
          title: 'Define the performance question',
          body: 'Latency is how long one operation takes. Throughput is how many operations complete per unit of time. Averages can hide poor tail behavior, so inspect percentiles such as p95 and p99 under a representative workload. Resource utilization, error rate, and saturation explain whether the system is near a limit.\n\nA single local request does not represent concurrent production traffic. Define dataset size, request mix, dependency latency, warmup, and environment. A faster response that returns incorrect or unauthorized data is not an optimization. Preserve the behavioral contract while measuring improvement.',
        },
        {
          title: 'Choose the right measurement tool',
          body: 'A profiler helps find where an application spends CPU time or allocates memory. A microbenchmark compares a small operation under controlled conditions. BenchmarkDotNet handles many pitfalls such as warmup, repeated runs, and reporting. Run benchmarks in Release outside a debugger, and inspect their warnings.\n\nLoad tests exercise a whole service and its dependencies under concurrency. They need an authorized isolated environment, realistic data, and a clear stop condition. Never point a learning load test at a public service you do not control. A fast in-memory loop says little about an endpoint dominated by database round trips.',
        },
        {
          title: 'Reduce expensive work before adding cleverness',
          body: "Common high-value improvements include avoiding N+1 queries, bounding result sets, using correct indexes, keeping I/O asynchronous, reusing suitable HTTP handlers, and removing needless allocations on measured hot paths. Caching requires a correctness policy; pooling requires clean reset and ownership behavior.\n\nOptimizing a tiny fraction of total work has a limited effect on end-to-end performance. Amdahl's law formalizes that limit, but the practical lesson is simple: measure the dominant cost first. Span, ValueTask, compiled queries, and AOT can be useful in specific workloads, yet each has tradeoffs. Keep a regression baseline so later changes do not silently erase the gain.",
        },
      ],
      diagram: {
        title: 'Measure before and after',
        source:
          'flowchart LR\n  goal["Latency / throughput goal"] --> baseline["Representative baseline"]\n  baseline --> profile["Locate dominant cost"]\n  profile --> change["One targeted optimization"]\n  change --> verify["Correctness + repeated measurement"]',
        caption:
          'An isolated microbenchmark and an end-to-end service test answer different performance questions.',
      },
      example: {
        title: 'Compare two small summation methods',
        filename: 'Program.cs',
        language: 'csharp',
        setup:
          'Create a net10.0 console project, add BenchmarkDotNet, and run in Release without a debugger. This is a microbenchmark demonstration, not a claim that one version is always faster.',
        code: 'using BenchmarkDotNet.Attributes;\nusing BenchmarkDotNet.Running;\n\nBenchmarkRunner.Run<SumBenchmarks>();\n\n[MemoryDiagnoser]\npublic class SumBenchmarks\n{\n    private readonly int[] values = Enumerable.Range(1, 1000).ToArray();\n\n    [Benchmark]\n    public int LinqSum() => values.Sum();\n\n    [Benchmark]\n    public int LoopSum()\n    {\n        int total = 0;\n        foreach (int value in values) total += value;\n        return total;\n    }\n}',
        output:
          'BenchmarkDotNet reports measured timing and allocation statistics for your environment.',
        explanation: [
          'Both methods return their result so the benchmark observes useful work.',
          'Modern LINQ implementations may be highly optimized; do not assume handwritten loops win.',
          'The result applies to this operation and dataset. It does not prove a TaskFlow endpoint became faster.',
        ],
      },
      traps: [
        {
          question: 'Does a faster microbenchmark prove a faster web application?',
          answer:
            'No. The measured operation may be a tiny part of request cost. Database, network, contention, and serialization can dominate the real workload.',
          warning: 'Optimize end-to-end impact, not only an impressive local number.',
        },
        {
          question: 'Is average latency enough for an API service objective?',
          answer:
            'Usually not. Tail latency and error rate reveal user experiences hidden by the average. Use representative load and appropriate percentiles.',
          warning: 'A stable average can coexist with severe slow requests.',
        },
      ],
      exercise: {
        title: 'Choose the highest-impact fix',
        brief:
          'An endpoint spends 900 ms in database calls, 80 ms waiting on HTTP, and 2 ms formatting text.',
        steps: [
          'Rank likely optimization opportunities.',
          'Propose one query-shape investigation.',
          'Define the before/after test and correctness assertions.',
        ],
        solution:
          'Start with the database work: inspect round trips, generated SQL, indexes, and rows returned. Optimizing the 2 ms formatting step cannot explain a major end-to-end gain. Repeat the same workload and validate returned data, access rules, and error behavior after the change.',
      },
      quiz: {
        question: 'Which measurement best exposes slow outlier requests?',
        options: [
          'Only average latency',
          'A relevant tail percentile such as p95 or p99',
          'The number of source files',
          'The application logo size',
        ],
        answer: 1,
        explanation:
          'Tail percentiles show how slowly a significant fraction of requests can behave even when the mean looks healthy. Interpret them alongside errors, load, and resource saturation.',
      },
      references: [
        { label: 'BenchmarkDotNet', url: 'https://benchmarkdotnet.org/articles/overview.html' },
        {
          label: 'ASP.NET Core best practices',
          url: 'https://learn.microsoft.com/en-us/aspnet/core/fundamentals/best-practices?view=aspnetcore-10.0',
        },
      ],
    },
  ],
}
