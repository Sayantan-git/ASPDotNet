import type { Chapter } from '../types'

export const language: Chapter = {
  id: 'language',
  title: 'C# in the real world',
  description: 'Query data, coordinate asynchronous work, and own resources safely.',
  level: 'Intermediate',
  accent: 'coral',
  lessons: [
    {
      id: 'linq-and-execution',
      title: 'LINQ & deferred execution',
      subtitle: 'Know when a query is a recipe and when it actually does the work.',
      minutes: 28,
      tags: [
        'LINQ',
        'IEnumerable',
        'IQueryable',
        'Where',
        'Select',
        'GroupBy',
        'deferred execution',
        'expression trees',
      ],
      outcomes: [
        'Compose filters, projections, and ordering.',
        'Explain execution and repeated enumeration.',
        'Distinguish in-memory delegates from provider-translated queries.',
      ],
      sections: [
        {
          title: 'Describe a transformation',
          body: 'LINQ stands for Language Integrated Query. It provides operators such as Where for filtering, Select for projection, OrderBy for sorting, and GroupBy for grouping. A projection changes the shape of each result; it is not the same as filtering. Prefer a query that expresses the intended result over a loop with unrelated mutations.\n\nMany LINQ operators return another sequence without immediately reading all the source data. This is **deferred execution**. The query is a recipe that runs when enumerated. ToList and ToArray materialize results into collections. Terminal operations such as Count, Any, and First execute enough work to produce their result, though the exact work depends on the source and operator.',
        },
        {
          title: 'The source determines where work happens',
          body: '`IEnumerable<T>` describes enumeration. LINQ-to-Objects generally uses delegates that execute .NET code in your process. `IQueryable<T>` also carries an expression tree and a query provider. Entity Framework Core can translate supported parts of that expression into SQL for the database. The same-looking Where expression can therefore run in different places.\n\nAsEnumerable changes which later LINQ operators are selected; it does not itself fetch all data immediately. ToList materializes. Putting ToList before a selective filter can load far more data than needed. A provider cannot translate arbitrary C# methods, and translation rules depend on the provider and version.',
        },
        {
          title: 'Choose operators that match the rule',
          body: "| Operator | Expectation |\n| --- | --- |\n| `Any` | At least one match; no need to count everything |\n| `First` | At least one item; take the first |\n| `Single` | Exactly one item; duplicates are an error |\n| `FirstOrDefault` | First item or the element type's default |\n| `SelectMany` | Flatten nested sequences |\n\nRepeated enumeration may repeat database queries or observe changed source data. Materialize deliberately when a snapshot or reuse is required, but do not materialize a huge unbounded query just for convenience. Use a stable ordering when a first item or a paged result has business meaning. An unordered SQL result has no guaranteed natural order.",
        },
      ],
      diagram: {
        title: 'Build a recipe, then execute',
        source:
          'flowchart LR\n  source["Source sequence"] --> where["Where: filter"]\n  where --> select["Select: shape"]\n  select --> order["OrderBy: order"]\n  order --> materialize["ToList: enumerate now"]',
        caption:
          'Most intermediate operators compose a query. Materialization determines when a result snapshot is captured.',
      },
      example: {
        title: 'Watch a deferred query change',
        filename: 'Program.cs',
        language: 'csharp',
        setup: 'Complete console example using LINQ-to-Objects, not a database provider.',
        code: 'var titles = new List<string> { "API", "C#" };\nvar query = titles.Where(title => title.Length >= 3);\nvar snapshot = query.ToList();\n\ntitles.Add("Testing");\n\nConsole.WriteLine(string.Join(", ", query));\nConsole.WriteLine(string.Join(", ", snapshot));',
        output: 'API, Testing\nAPI',
        explanation: [
          'The query is evaluated after the new item is added, so it sees the changed source.',
          'The snapshot was materialized earlier and has its own list structure.',
          'If the elements were mutable objects, a List snapshot would still contain references to those objects, not deep clones.',
        ],
      },
      traps: [
        {
          question: 'Does assigning a LINQ query execute it?',
          answer:
            'Often not. Deferred operators describe future work. Enumeration or a terminal operation triggers execution. Some operators and sources behave differently, so inspect the actual operation.',
          warning: 'Repeated enumeration of an IQueryable may make repeated database round trips.',
        },
        {
          question: 'Are IEnumerable and IQueryable interchangeable for performance?',
          answer:
            'No. IQueryable carries an expression for a provider to interpret, while later IEnumerable operators run as ordinary enumeration logic. Switching too early can move work out of the database.',
          warning:
            'Returning IQueryable across layers also exposes query composition and lifetime concerns.',
        },
      ],
      exercise: {
        title: 'Filter before materializing',
        brief: 'Create tasks with a completion state, return only open titles, and sort them.',
        steps: [
          'Use Where, Select, and OrderBy in a readable pipeline.',
          'Materialize once after filtering.',
          'Explain what changes if the source becomes an EF Core DbSet.',
        ],
        solution:
          'Keep the filter and projection in the provider query before ToListAsync when using EF Core. The provider can return only the needed rows and columns if the expression is translatable. Inspect generated SQL rather than assuming every C# expression executes on the server.',
      },
      quiz: {
        question: 'Which operation explicitly captures an in-memory list of query results now?',
        options: ['Where', 'Select', 'ToList', 'Declaring var query'],
        answer: 2,
        explanation:
          'ToList enumerates the source and stores the resulting elements in a new List. Deferred operations such as Where normally describe work until enumeration.',
      },
      references: [
        {
          label: 'LINQ introduction',
          url: 'https://learn.microsoft.com/en-us/dotnet/csharp/linq/',
        },
        {
          label: 'Deferred execution',
          url: 'https://learn.microsoft.com/en-us/dotnet/standard/linq/deferred-execution-lazy-evaluation',
        },
      ],
    },
    {
      id: 'exceptions-and-errors',
      title: 'Exceptions & honest error handling',
      subtitle: 'Recover when you can, preserve evidence when you cannot.',
      minutes: 24,
      tags: [
        'try',
        'catch',
        'finally',
        'throw',
        'exceptions',
        'stack trace',
        'Result',
        'validation',
      ],
      outcomes: [
        'Separate expected invalid input from exceptional failures.',
        'Preserve stack traces when rethrowing.',
        'Place recovery at a meaningful boundary.',
      ],
      sections: [
        {
          title: 'Failures have different meanings',
          body: 'Invalid user input, a missing task, a database outage, and a programming bug are not the same kind of failure. Expected validation can often return a structured result. An exception represents a failure that interrupts normal execution. Use specific exception types that communicate the broken contract, such as ArgumentException for an invalid method argument.\n\nDo not use exceptions as an ordinary loop condition or as a substitute for TryParse. Equally, do not return a success-shaped empty list when the database is unavailable. That hides an outage as valid business data and makes the system harder to operate.',
        },
        {
          title: 'Catch only where you can act',
          body: 'A try block marks work whose exceptions you want to handle. Catch a type when you can recover, translate the failure at a boundary, or add meaningful context. Catching Exception everywhere, logging it repeatedly, and continuing leaves callers with misleading state and duplicate logs.\n\nA finally block normally executes as control leaves the try/catch, whether through success, exception, or return. It is useful for cleanup, but it is not a guarantee against process termination or machine failure. Prefer using for IDisposable ownership. Exception filters, written with when, can select failures without consuming unrelated exceptions.',
        },
        {
          title: 'Keep the original evidence',
          body: 'Inside a catch, `throw;` rethrows while preserving the original stack information. `throw exception;` resets the apparent throw location and makes diagnosis harder. When wrapping an exception to add a useful abstraction-level message, preserve the original as InnerException.\n\nAt an HTTP boundary, translate known failures to deliberate status codes and unexpected failures to a safe error response. Do not return stack traces, SQL text, connection strings, or file paths to public clients. Record diagnostic details in protected logs with a correlation identifier. Later, Problem Details gives the API a consistent machine-readable error contract.',
        },
      ],
      diagram: {
        title: 'Choose a failure path',
        source:
          'flowchart LR\n  operation["Operation"] --> result{"Outcome"}\n  result --> valid["Return success"]\n  result --> expected["Expected failure result"]\n  result --> exception["Exception"]\n  exception --> boundary["Recover or translate at boundary"]',
        caption:
          'Do not disguise infrastructure failure as a valid empty result. Preserve both meaning and diagnostic evidence.',
      },
      example: {
        title: 'Validate before changing state',
        filename: 'Program.cs',
        language: 'csharp',
        setup:
          'Complete console example. The catch is at the outer application boundary so the user receives one clear message.',
        code: 'try\n{\n    string title = NormalizeTitle("   ");\n    Console.WriteLine(title);\n}\ncatch (ArgumentException exception)\n{\n    Console.WriteLine($"Invalid task: {exception.ParamName}");\n}\nfinally\n{\n    Console.WriteLine("Attempt finished");\n}\n\nstatic string NormalizeTitle(string title)\n{\n    ArgumentException.ThrowIfNullOrWhiteSpace(title);\n    return title.Trim();\n}',
        output: 'Invalid task: title\nAttempt finished',
        explanation: [
          'The method refuses to produce an invalid normalized title.',
          'The boundary catches the expected argument failure and reports a small, useful message.',
          'The finally block runs after this handled failure. Its output is independent of whether normalization succeeded.',
        ],
      },
      traps: [
        {
          question: 'Why prefer throw; over throw exception; when rethrowing?',
          answer:
            'A bare throw preserves the original exception stack information. Throwing the caught variable as a new throw point obscures where the failure began.',
          warning:
            'Wrapping an exception is different: preserve the original as the inner exception when the new context is useful.',
        },
        {
          question: 'Should every method catch Exception?',
          answer:
            'No. Catch where recovery or meaningful translation is possible. Let unexpected failures reach a deliberate boundary instead of logging and swallowing them at every layer.',
          warning: 'Swallowed exceptions can turn a failed operation into apparent success.',
        },
      ],
      exercise: {
        title: 'Classify four failures',
        brief:
          'Decide how TaskFlow should handle a blank title, an unknown ID, a database timeout, and an index bug.',
        steps: [
          'Separate client-correctable failures from infrastructure failures.',
          'Choose the layer that should translate each failure.',
          'State which diagnostic details belong in logs rather than responses.',
        ],
        solution:
          'Blank titles are validation failures; unknown IDs usually map to not found. A database timeout is an infrastructure failure, not an empty result. An index bug is a programming defect. The HTTP boundary returns appropriate safe responses, while protected logs preserve unexpected failure details and a correlation ID.',
      },
      quiz: {
        question: 'Which rethrow best preserves the original stack inside catch?',
        options: ['throw exception;', 'throw;', 'return null;', 'Console.WriteLine(exception);'],
        answer: 1,
        explanation:
          'A bare throw rethrows the currently handled exception without resetting its origin. Printing or returning null is not propagation, and can hide the failure from callers.',
      },
      references: [
        {
          label: 'Exception best practices',
          url: 'https://learn.microsoft.com/en-us/dotnet/standard/exceptions/best-practices-for-exceptions',
        },
      ],
    },
    {
      id: 'async-and-await',
      title: 'Async, await & the thread-pool trap',
      subtitle:
        'Wait without occupying a thread, and stop treating async as a synonym for parallel.',
      minutes: 30,
      tags: [
        'async',
        'await',
        'Task',
        'ValueTask',
        'Task.Run',
        'deadlock',
        'thread pool',
        'ConfigureAwait',
      ],
      outcomes: [
        'Explain asynchronous waiting and task completion.',
        'Distinguish I/O work from CPU work.',
        'Avoid blocking asynchronous request paths.',
      ],
      sections: [
        {
          title: 'A Task represents completion',
          body: 'A Task represents the eventual completion of an operation. Task<T> also carries a result. An async method executes synchronously until it reaches an await whose operation is not already complete. It then returns control to its caller and resumes later when the awaited work completes. Async does not automatically create a new thread.\n\nFor I/O, the operating system or provider can often wait without holding a worker thread. That helps a server handle more concurrent requests. It does not necessarily make one database query finish sooner. Scalability and individual latency are different measurements.',
        },
        {
          title: 'Incomplete awaits, dynamic thread pools, and async void failures',
          body: 'Await does not always suspend: if its awaitable is already complete, execution can continue synchronously. The .NET thread pool also adapts its worker count within its policy and limits; it is not one permanently fixed thread per request. Neither observation makes blocking waits a good request-processing strategy.\n\nASP.NET Core normally does not install the classic ASP.NET/UI synchronization context. Therefore, explaining every .Result failure as "the continuation must return to this exact blocked request thread" is inaccurate for ordinary Core hosting. Blocking can still cause thread-pool starvation, poor throughput, and other deadlocks involving locks or dependencies. Keep the I/O call chain asynchronous for the right reason.\n\nAn async void method does not silently swallow exceptions. Its exceptions are delivered through the captured synchronization context or the runtime\'s unhandled-exception path and can terminate the process. The caller has no returned Task to await and observe. Use async Task for ordinary operations; where an event signature requires async void, handle failures deliberately inside the event handler.\n\nAn async operation that simply forwards a Task may return that Task directly without the async keyword. All-the-way means preserving the asynchronous contract, not mechanically adding async and await to every method regardless of its work.',
        },
        {
          title: 'Stay asynchronous through the call chain',
          body: 'Use naturally asynchronous APIs for database, file, and network operations, and await their tasks. Calling Result or Wait blocks the current thread. In contexts with a synchronization context it can contribute to deadlock; in ASP.NET Core, which normally lacks that context, thread-pool starvation and throughput loss are still serious risks.\n\nTask.Run schedules work on the thread pool. It does not make a synchronous database API truly asynchronous, and wrapping normal request I/O in Task.Run usually adds overhead. CPU-heavy work may need parallel processing or a background worker, but first define resource limits and measure. Async void should normally be limited to event signatures that require it.',
        },
        {
          title: 'Coordinate work deliberately',
          body: "Task.WhenAll waits for a group of tasks and gives results in the input task order, not completion order. Starting two independent I/O operations before awaiting them can overlap their waiting time. Do not run dependent operations concurrently, and do not use a single EF Core DbContext for parallel operations.\n\nConfigureAwait(false) influences continuation context capture where that matters; it is not a universal performance switch. ValueTask can reduce allocations in specialized high-frequency APIs, but its consumption rules are more restrictive. Prefer Task until measurement and an API's documented contract justify the complexity. A caller should await or otherwise observe failures, not silently discard the returned task.",
        },
      ],
      diagram: {
        title: 'Waiting without blocking',
        source:
          'sequenceDiagram\n  participant Request\n  participant Method as Async method\n  participant IO as I/O operation\n  Request->>Method: Call\n  Method->>IO: Start operation\n  Method-->>Request: Incomplete Task\n  IO-->>Method: Completion\n  Method-->>Request: Result available',
        caption:
          'The operation can be pending without a worker thread being occupied for the whole wait.',
      },
      example: {
        title: 'Overlap independent waits',
        filename: 'Program.cs',
        language: 'csharp',
        setup:
          'Complete console example. Task.Delay simulates waiting; this is not a database benchmark or a real network call.',
        code: 'Task<string> titles = LoadAsync("Tasks");\nTask<string> labels = LoadAsync("Labels");\n\nstring[] results = await Task.WhenAll(titles, labels);\nConsole.WriteLine(string.Join(" + ", results));\n\nstatic async Task<string> LoadAsync(string name)\n{\n    await Task.Delay(20);\n    return name;\n}',
        output: 'Tasks + Labels',
        explanation: [
          'Both asynchronous operations are started before either is awaited as part of the group.',
          'WhenAll preserves the input ordering in its result array.',
          'The delay is a teaching stand-in for waiting. The example makes no claim about which thread resumes or exact elapsed time.',
        ],
      },
      traps: [
        {
          question: 'Does async always run on another thread?',
          answer:
            'No. Execution starts synchronously and may suspend at an incomplete await. An asynchronous operation can complete without dedicating a thread to waiting.',
          warning:
            'Async, concurrency, and parallel CPU execution are related but different concepts.',
        },
        {
          question: 'Is .Result safe in ASP.NET Core because classic deadlock behavior differs?',
          answer:
            'It still blocks a worker thread and can cause starvation and poor throughput. Avoid sync-over-async request paths even when a classic synchronization-context deadlock is not the failure mode.',
          warning: 'Changing the explanation of the risk does not remove the risk.',
        },
      ],
      exercise: {
        title: 'Find unnecessary blocking',
        brief:
          'A handler calls repository.GetTasksAsync().Result and wraps an HTTP request in Task.Run.',
        steps: [
          'Rewrite the call chain to return Task and use await.',
          'Remove Task.Run around naturally asynchronous I/O.',
          'Decide whether the two operations are actually independent.',
        ],
        solution:
          'Await the repository and HttpClient APIs directly, propagating cancellation. Only start them together if neither depends on the other and their underlying resources support concurrent use. Do not issue parallel queries on one DbContext.',
      },
      quiz: {
        question: 'What is the main benefit of true asynchronous I/O in a web server?',
        options: [
          'Every query becomes computationally faster',
          'Waiting need not occupy a worker thread',
          'All code automatically runs in parallel',
          'Exceptions are automatically ignored',
        ],
        answer: 1,
        explanation:
          'Asynchronous I/O can free request-processing threads while external work is pending, improving concurrency and throughput. It does not guarantee lower latency for the individual external operation.',
      },
      references: [
        {
          label: 'Asynchronous programming',
          url: 'https://learn.microsoft.com/en-us/dotnet/csharp/asynchronous-programming/',
        },
        {
          label: 'ASP.NET Core performance practices',
          url: 'https://learn.microsoft.com/en-us/aspnet/core/fundamentals/best-practices?view=aspnetcore-10.0',
        },
      ],
    },
    {
      id: 'cancellation-and-concurrency',
      title: 'Cancellation & bounded concurrency',
      subtitle:
        'Stop work cooperatively and keep parallel requests from exhausting shared resources.',
      minutes: 28,
      tags: [
        'CancellationToken',
        'SemaphoreSlim',
        'lock',
        'race condition',
        'Task.WhenAll',
        'Interlocked',
        'thread safety',
      ],
      outcomes: [
        'Propagate cancellation tokens through I/O.',
        'Explain races and thread-safe operations.',
        'Limit concurrency and release resources reliably.',
      ],
      sections: [
        {
          title: 'Cancellation is a request, not a forced kill',
          body: 'A CancellationToken communicates that work is no longer wanted. The operation must observe it, usually by passing it to an asynchronous API or calling ThrowIfCancellationRequested in a long-running loop. CancellationTokenSource owns the ability to request cancellation and should be disposed when owned by your code.\n\nIn an ASP.NET Core endpoint, a CancellationToken parameter usually represents request abortion. Pass it to EF Core and HttpClient instead of continuing expensive work after the client disconnects. Cancellation does not automatically roll back work already committed. A client timeout may leave uncertainty about whether a write succeeded, so idempotency and retry design still matter.',
        },
        {
          title: 'Shared mutation requires coordination',
          body: 'A race condition occurs when behavior depends on an uncontrolled interleaving of operations. Count++ is a read, calculation, and write; it is not an atomic transaction. Interlocked supplies atomic operations for appropriate simple state. A lock protects a critical section across cooperating threads, but you must not await inside an ordinary lock block.\n\nThread-safe collections protect their documented operations, not every sequence of business operations. A ContainsKey followed by Add is still a separate check-then-act sequence unless you use an appropriate atomic API. Immutable data and avoiding shared state often simplify the problem more than adding locks everywhere.',
        },
        {
          title: 'Put a bound on fan-out',
          body: 'Task.WhenAll over a million operations can create excessive outstanding requests and allocations. A SemaphoreSlim can limit how many operations enter a section concurrently, using WaitAsync for nonblocking acquisition. Release belongs in finally after successful acquisition so exceptions do not permanently consume permits.\n\nChoose a limit based on downstream capacity, connection pools, and measured behavior, not only CPU count. Parallel.ForEachAsync or a bounded channel may fit some workloads better. Per-request limits alone may still multiply across many requests, so consider where the limit lives. Never share an EF Core DbContext across parallel work even when the number of tasks is small.',
        },
      ],
      diagram: {
        title: 'Bound the work in flight',
        source:
          'flowchart LR\n  pending["Pending operations"] --> gate["Semaphore: 2 permits"]\n  gate --> first["Active operation A"]\n  gate --> second["Active operation B"]\n  first --> release["Release in finally"]\n  second --> release',
        caption:
          'Only successful acquisitions own permits. Cancellation and failure must not leak those permits.',
      },
      example: {
        title: 'Limit simultaneous operations',
        filename: 'Program.cs',
        language: 'csharp',
        setup:
          'Complete console example. Delays model asynchronous waiting; the source timeout is deliberately longer than the small workload.',
        code: 'using var source = new CancellationTokenSource(TimeSpan.FromSeconds(2));\nusing var gate = new SemaphoreSlim(2);\n\nvar work = Enumerable.Range(1, 4).Select(async taskId =>\n{\n    await gate.WaitAsync(source.Token);\n    try\n    {\n        await Task.Delay(20, source.Token);\n        return taskId;\n    }\n    finally\n    {\n        gate.Release();\n    }\n});\n\nint[] results = await Task.WhenAll(work);\nConsole.WriteLine(string.Join(", ", results));',
        output: '1, 2, 3, 4',
        explanation: [
          'WaitAsync occurs before the try: if acquisition is cancelled, no permit is owned and none is released.',
          'Finally returns an acquired permit even when the operation fails or is cancelled.',
          'Results retain the input ordering. The console output does not prove the internal completion order.',
        ],
      },
      traps: [
        {
          question: 'Does cancelling a token undo a database commit?',
          answer:
            'No. Cancellation requests that remaining work stop. Effects already committed may remain. Transaction boundaries and idempotency must handle partial or uncertain outcomes.',
          warning:
            'A cancelled client request is not proof that the server performed no side effect.',
        },
        {
          question: 'Does ConcurrentDictionary make a whole workflow atomic?',
          answer:
            'Only its documented operations have their guarantees. Multiple separate operations can still race, and callbacks may have their own execution semantics.',
          warning: 'Protect the business invariant, not just the collection access.',
        },
      ],
      exercise: {
        title: 'Cancel a batch safely',
        brief:
          'Adapt the example to cancel early and count only successfully completed operations.',
        steps: [
          'Catch OperationCanceledException only at the batch boundary.',
          'Keep permit release inside finally.',
          'Explain why partially completed external writes would need a separate consistency plan.',
        ],
        solution:
          'Propagate the same token through acquisition and work, and treat requested cancellation as a distinct outcome. Record success only after an operation finishes. Cancellation is not transactional rollback; committed work may need deduplication, compensation, or a resumable workflow.',
      },
      quiz: {
        question: 'When should a SemaphoreSlim permit be released?',
        options: [
          'Even if acquisition was cancelled',
          'Only after successful acquisition, in a finally block',
          'Only on the success path',
          'Only when the process exits',
        ],
        answer: 1,
        explanation:
          'A successful acquisition creates ownership of a permit. Finally ensures that ownership is released on success, failure, or later cancellation, without over-releasing after a failed acquisition.',
      },
      references: [
        {
          label: 'Cancellation in managed threads',
          url: 'https://learn.microsoft.com/en-us/dotnet/standard/threading/cancellation-in-managed-threads',
        },
        {
          label: 'SemaphoreSlim',
          url: 'https://learn.microsoft.com/en-us/dotnet/api/system.threading.semaphoreslim',
        },
      ],
    },
    {
      id: 'memory-and-disposal',
      title: 'Memory, garbage collection & disposal',
      subtitle: 'The garbage collector manages reachability. You still manage ownership.',
      minutes: 28,
      tags: [
        'GC',
        'IDisposable',
        'IAsyncDisposable',
        'using',
        'Span',
        'finalizer',
        'memory leak',
        'generations',
      ],
      outcomes: [
        'Separate memory reclamation from resource cleanup.',
        'Use using and await using with clear ownership.',
        'Recognize retained-object leaks and performance tools.',
      ],
      sections: [
        {
          title: 'What the garbage collector actually does',
          body: 'The garbage collector reclaims managed objects that are no longer reachable from roots such as active references, static fields, and runtime structures. It does not infer whether an object is still useful to your business. A static cache or event subscription can keep an unwanted object reachable forever, creating a managed memory leak.\n\nGenerational collection uses the observation that many objects die young. Objects can survive collections and move into older generations. Large objects have special allocation and collection considerations. Allocation rate, retained size, and pause time are different metrics. Calling GC.Collect as routine cleanup is usually a sign that the actual ownership or allocation problem has not been understood.',
        },
        {
          title: 'Dispose resources deterministically',
          body: 'Files, sockets, database connections, and native handles have lifetimes that should not depend on an eventual collection. IDisposable provides a synchronous cleanup contract. A using statement or declaration calls Dispose when control exits its scope, including normal exception unwinding. It does not immediately force garbage collection.\n\nIAsyncDisposable provides DisposeAsync for cleanup that may need asynchronous work; await using observes its completion. Know who owns a resource. A dependency-injection container usually disposes services it creates, so consumers should not casually dispose injected shared dependencies. Wrappers such as StreamReader commonly own their underlying stream unless configured otherwise.',
        },
        {
          title: 'Optimize only a measured problem',
          body: 'A finalizer is a last-resort cleanup mechanism with timing and performance costs, not the preferred way to release ordinary resources. Use established wrappers such as SafeHandle for native ownership instead of inventing a fragile finalizer protocol. IDisposable does not require that a type have a finalizer.\n\nSpan<T> and ReadOnlySpan<T> provide views over contiguous memory without ordinary array copying. They have lifetime restrictions and cannot be stored in normal heap objects like a regular array reference. Newer language versions relax some local-use restrictions, but spans still cannot cross an await or yield boundary in ways that violate lifetime safety. Pooling and spans can improve hot paths; they also introduce ownership and data-lifetime complexity.',
        },
      ],
      diagram: {
        title: 'Two different cleanup responsibilities',
        source:
          'flowchart TB\n  lifetime["Resource lifetime"] --> managed["Managed memory"]\n  lifetime --> external["External resource"]\n  managed --> gc["GC after unreachability"]\n  external --> dispose["Dispose / DisposeAsync at scope end"]',
        caption:
          'Disposal releases owned resources predictably. Garbage collection later reclaims managed storage.',
      },
      example: {
        title: 'Make reader ownership visible',
        filename: 'Program.cs',
        language: 'csharp',
        setup:
          'Complete console example. MemoryStream demonstrates the disposal protocol without needing a disk file.',
        code: 'using System.Text;\n\nbyte[] content = Encoding.UTF8.GetBytes("TaskFlow");\nusing (var reader = new StreamReader(new MemoryStream(content)))\n{\n    Console.WriteLine(reader.ReadToEnd());\n}\n\nReadOnlySpan<char> prefix = "TaskFlow".AsSpan(0, 4);\nConsole.WriteLine(prefix.ToString());',
        output: 'TaskFlow\nTask',
        explanation: [
          'The reader owns its underlying stream and disposes it when the using block exits.',
          'This MemoryStream has no operating-system file handle; a FileStream would make timely external-resource cleanup more important.',
          'AsSpan creates a view. ToString deliberately creates a string for display, so the final formatting step still allocates.',
        ],
      },
      traps: [
        {
          question: 'Does using immediately free all memory?',
          answer:
            "No. It invokes Dispose at scope exit. Dispose handles the type's cleanup contract; managed memory is reclaimed separately when it becomes unreachable and the GC collects it.",
          warning: 'Leaving scope, disposing, and garbage collection are distinct events.',
        },
        {
          question: 'Can a garbage-collected application leak memory?',
          answer:
            'Yes. Objects that are no longer needed can remain reachable through static collections, caches, events, or other roots. The GC correctly keeps reachable objects alive.',
          warning: 'A growing heap does not always mean the collector is malfunctioning.',
        },
      ],
      exercise: {
        title: 'Audit resource ownership',
        brief: 'A service opens a file reader and stores every processed task in a static List.',
        steps: [
          'Fix the reader lifetime with using.',
          'Explain why using does not solve the growing static List.',
          'Choose a bounded cache or remove unnecessary retention.',
        ],
        solution:
          'The reader needs deterministic disposal by its owner. The static List remains a GC root and retains its elements; solve that with a retention policy, bounded capacity, expiry, or no cache. Measure retained objects and allocation rate to verify the actual problem.',
      },
      quiz: {
        question: 'Why can a static event publisher cause a memory leak?',
        options: [
          'Events disable the GC',
          'Subscribers can remain reachable through delegates',
          'Every delegate has a finalizer',
          'Static fields are allocated on disk',
        ],
        answer: 1,
        explanation:
          'The publisher can retain delegate references to subscriber objects. As long as that graph is reachable, the GC cannot reclaim the subscribers even if the application no longer needs them.',
      },
      references: [
        {
          label: 'Garbage collection fundamentals',
          url: 'https://learn.microsoft.com/en-us/dotnet/standard/garbage-collection/fundamentals',
        },
        {
          label: 'Implement a dispose method',
          url: 'https://learn.microsoft.com/en-us/dotnet/standard/garbage-collection/implementing-dispose',
        },
      ],
    },
  ],
}
