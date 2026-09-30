export interface ReferenceCoverage {
  title: string
  pages: [number, number]
  lessonIds: string[]
  summary: string
}

export const studyReference = {
  title: 'Master Interview Study Reference',
  issued: 'May 30, 2026',
  reviewed: 'September 30, 2026',
  pageCount: 41,
  description:
    'Reviewed against all 41 supplied pages. Existing lessons were expanded in original wording; the source PDF itself is not redistributed here. Version-specific statements are distinguished from general rules.',
}

export const referenceCoverage: ReferenceCoverage[] = [
  {
    title: 'HTTP and REST fundamentals',
    pages: [1, 5],
    lessonIds: ['http-fundamentals', 'rest-and-http-semantics'],
    summary:
      'Added the six constraints, HEAD/OPTIONS, method/body caveats, status-code decisions, and corrections to safety, idempotency, and caching shortcuts.',
  },
  {
    title: 'ASP.NET Core architecture and setup',
    pages: [5, 9],
    lessonIds: [
      'hosting-and-configuration',
      'dependency-injection',
      'middleware-pipeline',
      'setup-and-tooling',
    ],
    summary:
      'Expanded launch profiles, environment precedence, typed options, service creation/disposal, and registration-order nuances. Existing startup and middleware lessons remain the foundation.',
  },
  {
    title: 'Controllers and routing',
    pages: [10, 11],
    lessonIds: ['controllers-and-binding', 'minimal-apis-and-routing'],
    summary:
      'Clarified runtime route matching, controller token casing, binding sources, and HTTP integration-test boundaries.',
  },
  {
    title: 'Validation, DTOs, and errors',
    pages: [11, 14],
    lessonIds: ['validation-and-problem-details', 'exceptions-and-errors'],
    summary:
      'Added the Required-on-int trap, explicit mapping examples, error-handler boundaries, and the current Problem Details standard.',
  },
  {
    title: 'EF Core, stored procedures, and Dapper',
    pages: [14, 19],
    lessonIds: ['ef-core-and-migrations', 'ef-query-performance', 'concurrency-and-data-access'],
    summary:
      'Added database-first scaffolding, connection ownership, immediate-query/set-based execution, parameterized Dapper calls, and a SQL Server procedure example.',
  },
  {
    title: 'Repository, service layer, and AutoMapper',
    pages: [20, 23],
    lessonIds: [
      'architecture-and-boundaries',
      'concurrency-and-data-access',
      'validation-and-problem-details',
    ],
    summary:
      'Added mapping/projection tradeoffs and AutoMapper licensing guidance. Clarified that repositories are optional boundaries, not automatic provider independence or proof of SQL correctness.',
  },
  {
    title: 'Authentication, OAuth, OIDC, and SSO',
    pages: [23, 28],
    lessonIds: [
      'authentication-and-authorization',
      'cookies-jwt-and-oidc',
      'policies-and-ownership',
    ],
    summary:
      'Added SSO/SAML, PKCE flow diagrams, refresh rotation, revocation and logout limits, Basic/API-key distinctions, and horizontally scalable session designs.',
  },
  {
    title: 'Advanced API design',
    pages: [28, 30],
    lessonIds: [
      'web-security',
      'caching-and-rate-limiting',
      'pagination-and-versioning',
      'rest-and-http-semantics',
    ],
    summary:
      'Added a preflight example, Cache-Control/ETag revalidation, rate-header caveats, and REST/GraphQL/gRPC comparisons without blanket performance claims.',
  },
  {
    title: 'Async and configuration',
    pages: [31, 33],
    lessonIds: ['async-and-await', 'hosting-and-configuration'],
    summary:
      'Corrected async-void exception and ASP.NET Core deadlock explanations; clarified incomplete awaits, provider reload behavior, and typed-options limits.',
  },
  {
    title: 'SQL interview fundamentals',
    pages: [33, 36],
    lessonIds: ['sql-and-relational-data', 'relationships-and-transactions'],
    summary:
      'Added joins, 1NF-BCNF, command families, logical order, NULL handling, CTEs, rankings, LAG/LEAD, running totals, indexes, isolation, and deadlock reasoning.',
  },
  {
    title: 'Interview question bank',
    pages: [36, 38],
    lessonIds: ['capstone-and-interviews', 'dependency-injection', 'concurrency-and-data-access'],
    summary:
      'Retained existing quizzes and expanded interview traps, with the main distinctions consolidated in Quick revision.',
  },
  {
    title: 'Production scenario questions',
    pages: [38, 39],
    lessonIds: [
      'debugging-and-diagnostics',
      'cookies-jwt-and-oidc',
      'pagination-and-versioning',
      'system-design',
    ],
    summary:
      'Added six scenario walkthroughs with a follow-up question, focused evidence, and links to the deeper lessons.',
  },
  {
    title: 'Cheat sheet and study schedule',
    pages: [39, 41],
    lessonIds: ['capstone-and-interviews', 'rest-and-http-semantics'],
    summary:
      'Added a short answer framework and rapid-recall sheet. The PDF only lists the first five days of its proposed tracker; its fixed May 30 date is historical, not your automatically assigned start date.',
  },
]

export const referenceCorrections = [
  {
    pages: '2-3',
    title: 'Safe is not the same as zero incidental state changes',
    detail:
      'GET is not the only safe method: HEAD and OPTIONS are safe too. Logging a request does not violate its intended safe semantics. PATCH is not inherently idempotent, and deterministic code alone does not make repeated effects idempotent.',
    lessonId: 'rest-and-http-semantics',
  },
  {
    pages: '2-3, 29',
    title: 'Caching depends on the full response contract',
    detail:
      'A 200 response is not automatically safe for a shared cache. POST results can be cacheable under explicit HTTP conditions for later GET/HEAD reuse. No-cache means revalidate; no-store means do not store.',
    lessonId: 'caching-and-rate-limiting',
  },
  {
    pages: '3, 36-37',
    title: 'Status-code mnemonics have limits',
    detail:
      '400 is broader than malformed syntax and is the default MVC validation response. 403 need not prove the caller authenticated. A 503 does not by itself configure a load balancer, and a 5xx does not make every write safe to retry.',
    lessonId: 'rest-and-http-semantics',
  },
  {
    pages: '5, 24, 38-39',
    title: 'JWT is not the only horizontally scalable identity design',
    detail:
      'Protected authentication tickets and shared session stores can support replicas. Cookie transport, a server-side session, REST interaction state, and application data are distinct concerns.',
    lessonId: 'cookies-jwt-and-oidc',
  },
  {
    pages: '7-9',
    title: 'DI and configuration are lifetime-sensitive',
    detail:
      'Singletons are commonly created on first resolution; scoped means per scope, not universally per request; disposable transients can remain owned until scope disposal. Duplicate registrations and ordered options configuration can make registration order matter.',
    lessonId: 'dependency-injection',
  },
  {
    pages: '9, 10, 33',
    title: 'Startup metadata is not all runtime behavior',
    detail:
      'Routing structures are prepared during setup, but incoming requests are matched at runtime. Launch profiles are local tool configuration. Typed options do not make misspelled external JSON/environment keys compile-time errors.',
    lessonId: 'hosting-and-configuration',
  },
  {
    pages: '12',
    title: 'Required on int is not a positive-ID check',
    detail:
      'A non-nullable int can contain zero. Use an appropriate range rule, and nullable input when absence must be distinguished; validate existence and authorization separately.',
    lessonId: 'validation-and-problem-details',
  },
  {
    pages: '13-16',
    title: 'Framework conveniences have explicit boundaries',
    detail:
      'An error handler cannot replace an already-started response or catch unrelated background failures. EF reads and direct/set-based commands execute without SaveChanges; arbitrary raw SQL is not automatically parameterized.',
    lessonId: 'validation-and-problem-details',
  },
  {
    pages: '15-19',
    title: 'Include, procedures, and Dapper need measurement',
    detail:
      'Include can use split queries and can overfetch. Dapper and stored procedures are not universally faster. SQL Server procedures can compile, cache, and recompile plans; they are not permanently precompiled.',
    lessonId: 'concurrency-and-data-access',
  },
  {
    pages: '20-23',
    title: 'A repository or mapper is not a universal requirement',
    detail:
      'A repository can isolate a useful contract, but does not erase database semantics or replace integration testing. AutoMapper projection must be provider-translatable, and version 15 introduced licensing requirements.',
    lessonId: 'validation-and-problem-details',
  },
  {
    pages: '24-28',
    title: 'Revocation, logout, and XSS protection need a threat model',
    detail:
      'Offline JWT validation cannot observe revocation without additional mechanisms, but individual earlier rejection can be designed. Revoking refresh credentials does not instantly revoke all access tokens. HttpOnly and central SSO logout do not guarantee complete XSS safety or immediate global sign-out.',
    lessonId: 'cookies-jwt-and-oidc',
  },
  {
    pages: '28-30',
    title: 'CORS and protocol choice do not remove authorization or query cost',
    detail:
      'A safelisted cross-origin request can be sent before browser response access is blocked. GraphQL can still suffer N+1 and expensive resolvers; gRPC does not automatically eliminate over-fetching.',
    lessonId: 'web-security',
  },
  {
    pages: '31',
    title: 'Async void exceptions are not silently swallowed',
    detail:
      'They can reach a synchronization context or an unhandled-exception path and terminate the process. ASP.NET Core normally lacks the classic request synchronization context; blocking still causes starvation and other risks.',
    lessonId: 'async-and-await',
  },
  {
    pages: '34-36',
    title: 'SQL Server rollback and ordering require engine-specific answers',
    detail:
      'TRUNCATE TABLE and supported DROP TABLE operations can roll back inside explicit SQL Server transactions. A clustered index is not an output-order guarantee. NULL equality normally yields UNKNOWN; logical SQL order is not the physical execution plan.',
    lessonId: 'sql-and-relational-data',
  },
  {
    pages: '35',
    title: 'BCNF is stated using a superkey',
    detail:
      'For every nontrivial functional dependency, its determinant must be a superkey. A candidate key is a minimal superkey; requiring every determinant to be a candidate key is too restrictive.',
    lessonId: 'sql-and-relational-data',
  },
]

export const revisionPrompts = [
  {
    title: 'A sixty-second answer',
    answer:
      'Define the concept, explain the mechanism, name one important boundary, give a TaskFlow example, and say how you would verify it. Describe what you actually implemented; do not present a proposed extension as completed work.',
    lessonId: 'capstone-and-interviews',
  },
  {
    title: 'Methods and retries',
    answer:
      'Safe describes the intended request semantics. Idempotent describes the repeated intended effect. PUT and DELETE are idempotent by contract; PATCH depends on the operation; POST needs an explicit replay-safe design where duplicates matter.',
    lessonId: 'rest-and-http-semantics',
  },
  {
    title: 'Status codes and caching',
    answer:
      '201 means created; 202 means accepted but unfinished; 204 and 304 have no response body. 401 challenges authentication, 403 forbids, 409 signals a conflict, and 412 a failed precondition. Cache eligibility is not determined by 200 alone.',
    lessonId: 'rest-and-http-semantics',
  },
  {
    title: 'Middleware and DI',
    answer:
      'Middleware wraps downstream work and can short-circuit. Authentication normally establishes the principal before authorization uses it. Singleton, scoped, and transient describe container reuse/ownership, not universal thread or disposal timing.',
    lessonId: 'dependency-injection',
  },
  {
    title: 'Input and mapping',
    answer:
      'Binding converts input, validation checks rules, authorization grants access, and mapping shapes data. A DTO limits the contract but does not replace ownership checks. Required on int does not assert a positive ID.',
    lessonId: 'validation-and-problem-details',
  },
  {
    title: 'EF execution',
    answer:
      'A tracked write normally waits for SaveChanges; reads execute when enumerated. Direct SQL and ExecuteUpdate/ExecuteDelete run immediately. DbContext is not thread-safe, and one scope is not automatically one transaction across separate saves.',
    lessonId: 'ef-core-and-migrations',
  },
  {
    title: 'Data-access choices',
    answer:
      'Use projections, limits, suitable indexes, and measured round trips before changing ORM. Dapper gives explicit SQL and mapping; EF Core adds tracking, LINQ translation, and migrations. Neither makes bad queries or unsafe SQL safe automatically.',
    lessonId: 'concurrency-and-data-access',
  },
  {
    title: 'Identity and token purpose',
    answer:
      'OAuth grants resource access; OIDC adds an identity layer; SSO is a cross-application login experience. The API needs an access token for its audience. A signed JWT is generally readable, and a bearer token need not be a JWT.',
    lessonId: 'cookies-jwt-and-oidc',
  },
  {
    title: 'Browser security',
    answer:
      'CORS governs browser cross-origin response access. CSRF exploits ambient credentials; XSS runs untrusted code in the origin. HttpOnly reduces direct cookie theft but does not make injected script harmless.',
    lessonId: 'web-security',
  },
  {
    title: 'Async and resources',
    answer:
      'Async is not automatically another thread or parallel execution. Await can suspend at incomplete work. Blocking async requests harms capacity. Dispose owned resources predictably; garbage collection is a different lifetime mechanism.',
    lessonId: 'async-and-await',
  },
  {
    title: 'SQL rows and ranks',
    answer:
      'WHERE filters rows, HAVING filters groups, and window functions retain individual rows. ROW_NUMBER gives positions, RANK leaves gaps after ties, and DENSE_RANK does not. The second row is not necessarily the second distinct value.',
    lessonId: 'sql-and-relational-data',
  },
  {
    title: 'SQL safety and plans',
    answer:
      'Use IS NULL, parameterized values, and trusted identifier mappings. A CTE is not automatically materialized. Indexes trade read access paths for write/storage costs. Name the database before answering TRUNCATE/DROP rollback questions.',
    lessonId: 'sql-and-relational-data',
  },
]

export const interviewScenarios = [
  {
    title: 'The API becomes slow at peak load',
    prompt:
      'Latency rises sharply, CPU remains moderate, and no single failing line is obvious. What would you investigate first?',
    answer:
      'Separate queue time, database time, outbound HTTP time, and response size using one correlated request and representative load. Inspect query count and plans for N+1 or missing indexes, thread-pool/connection-pool pressure, blocking waits, and unbounded results. Make one measured change and compare p95 latency, throughput, errors, and returned data. Cache only after defining keys, privacy, freshness, and invalidation.',
    followUp: 'Why would AsNoTracking not fix every slow SQL query?',
    lessonId: 'debugging-and-diagnostics',
  },
  {
    title: 'Secure an Angular or React client',
    prompt:
      'The browser frontend is on a different origin and needs private task data. Choose the identity and access boundaries.',
    answer:
      'Compare a backend-for-frontend with a public-client authorization-code/PKCE flow supported by a trusted provider. Keep secrets out of browser code. Validate access-token issuer, audience, signature, lifetime, and policy on the API, then enforce resource ownership. Configure exact CORS origins where needed. Cookie-based requests need a deliberate antiforgery policy; every design still needs XSS controls and negative authorization tests.',
    followUp: "Why does a valid token not grant access to another owner's task ID?",
    lessonId: 'policies-and-ownership',
  },
  {
    title: 'A credential may have been stolen',
    prompt:
      'Support requests a forced logout across two applications and all active devices. What can you actually guarantee?',
    answer:
      "Identify which credential or session was exposed without logging the secret. Revoke relevant refresh-token families and sessions through supported provider controls, investigate reuse, and require reauthentication where appropriate. Determine how already-issued access tokens are rejected: expiry alone, revocation checks, or supported continuous policy evaluation. Verify each application's local session and logout integration. Communicate the actual propagation window instead of promising instant universal logout.",
    followUp: 'What remains possible if injected script cannot read an HttpOnly cookie?',
    lessonId: 'cookies-jwt-and-oidc',
  },
  {
    title: 'A public API contract must change',
    prompt:
      'A new feature changes the meaning of a response field used by old mobile clients. How do you release it?',
    answer:
      'Identify consumers and the exact breaking semantics. Prefer a compatible additive field when it truly preserves behavior; otherwise introduce a documented version with a migration path. Run old/new contract tests, monitor version usage, publish a deprecation window, and coordinate data-schema compatibility for rolling deployment. Removing a field after an arbitrary date without observing remaining clients is not a complete migration plan.',
    followUp: 'Can adding a JSON field break a strict client?',
    lessonId: 'pagination-and-versioning',
  },
  {
    title: 'Scale TaskFlow across several replicas',
    prompt:
      'Traffic grows and a second app instance is introduced. Which assumptions need to be checked?',
    answer:
      'Find the actual bottleneck before adding replicas. Keep required state in suitable shared/durable stores, and configure compatible identity/Data Protection behavior. Shared session designs can scale; JWT is not mandatory. Bound queries, asynchronous I/O, downstream concurrency, and per-instance versus global rate budgets. Check duplicate background jobs, cache consistency, database capacity, and recovery behavior under an instance restart.',
    followUp: 'Why might adding API instances make a database bottleneck worse?',
    lessonId: 'system-design',
  },
  {
    title: 'Error responses are inconsistent',
    prompt:
      'Validation returns one JSON shape, exceptions another, and a streaming response fails after headers start. Where should the fix live?',
    answer:
      'Define a safe Problem Details contract with appropriate status codes and correlation context, then cover binding, validation, expected business failures, authorization, and unexpected request exceptions through suitable framework boundaries. Keep detailed traces in protected logs. An already-started response cannot be rewritten into a fresh JSON 500; log and terminate/handle according to the streaming protocol. Test the actual host, not only controller methods.',
    followUp: 'Which failures cannot be caught by request exception middleware?',
    lessonId: 'validation-and-problem-details',
  },
]

export const referenceLinks = [
  {
    title: 'C# language guide',
    category: 'Language',
    description: 'Syntax, types, language reference, and new features.',
    url: 'https://learn.microsoft.com/en-us/dotnet/csharp/',
  },
  {
    title: 'ASP.NET Core 10',
    category: 'Web framework',
    description: 'Hosting, APIs, security, MVC, Razor, and Blazor.',
    url: 'https://learn.microsoft.com/en-us/aspnet/core/?view=aspnetcore-10.0',
  },
  {
    title: 'Entity Framework Core',
    category: 'Data',
    description: 'Mapping, queries, migrations, and performance.',
    url: 'https://learn.microsoft.com/en-us/ef/core/',
  },
  {
    title: '.NET support policy',
    category: 'Versions',
    description: 'Support windows and servicing requirements.',
    url: 'https://dotnet.microsoft.com/en-us/platform/support/policy/dotnet-core',
  },
  {
    title: 'HTTP on MDN',
    category: 'Web fundamentals',
    description: 'Methods, status codes, headers, cookies, and caching.',
    url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP',
  },
  {
    title: '.NET architecture guides',
    category: 'Architecture',
    description: 'Application boundaries and distributed-system tradeoffs.',
    url: 'https://learn.microsoft.com/en-us/dotnet/architecture/',
  },
  {
    title: 'OWASP Cheat Sheets',
    category: 'Security',
    description: 'Practical guidance for common application threats.',
    url: 'https://cheatsheetseries.owasp.org/',
  },
  {
    title: 'WAI accessibility tutorials',
    category: 'Accessible UI',
    description: 'Forms, structure, navigation, and inclusive interaction.',
    url: 'https://www.w3.org/WAI/tutorials/',
  },
]

export const glossary = [
  {
    term: 'AutoMapper',
    definition:
      'A library for configured object mapping and query projections. Provider translation and version-specific license requirements still need review.',
    lessonId: 'validation-and-problem-details',
  },
  {
    term: 'CTE',
    definition:
      'Common table expression: a named query expression scoped to the next statement, not an automatically materialized or persistent result.',
    lessonId: 'sql-and-relational-data',
  },
  {
    term: 'Dapper',
    definition:
      'A lightweight mapper that executes your SQL and maps its results. You still own parameters, schema evolution, connection lifetime, and performance verification.',
    lessonId: 'concurrency-and-data-access',
  },
  {
    term: 'ETag',
    definition:
      'An opaque representation validator for conditional requests. It need not be a hash, and it is not an authorization credential.',
    lessonId: 'caching-and-rate-limiting',
  },
  {
    term: 'Normalization',
    definition:
      'Structuring relations around keys and dependencies to reduce update anomalies. Decompositions must preserve the intended facts and relationships.',
    lessonId: 'sql-and-relational-data',
  },
  {
    term: 'PKCE',
    definition:
      'Proof Key for Code Exchange: binds authorization-code redemption to a verifier held by the initiating client, including public clients that cannot keep an application secret.',
    lessonId: 'cookies-jwt-and-oidc',
  },
  {
    term: 'SAML',
    definition:
      'An XML-based federation protocol commonly used for enterprise browser sign-on. Protocol age alone does not decide security or suitability.',
    lessonId: 'cookies-jwt-and-oidc',
  },
  {
    term: 'SSO',
    definition:
      'Single sign-on: applications reuse authentication through a shared identity provider. Their tokens and local sessions can remain separate.',
    lessonId: 'cookies-jwt-and-oidc',
  },
  {
    term: 'Window function',
    definition:
      'A calculation over related rows that keeps the individual result rows, with partition, ordering, and frame rules controlling its meaning.',
    lessonId: 'sql-and-relational-data',
  },
  {
    term: 'API',
    definition:
      'A contract that lets software request behavior from other software. A web API commonly uses HTTP; not every API is a web API.',
    lessonId: 'http-fundamentals',
  },
  {
    term: 'Assembly',
    definition:
      'Compiled .NET code and metadata packaged in a unit such as a DLL. It is not the same thing as a namespace or a NuGet package.',
    lessonId: 'dotnet-ecosystem',
  },
  {
    term: 'Async',
    definition:
      'A way to represent work that can complete later without making the caller occupy a thread for the whole wait. It does not automatically mean parallel execution.',
    lessonId: 'async-and-await',
  },
  {
    term: 'Authentication',
    definition: 'Establishing the identity of a caller through a trusted validation mechanism.',
    lessonId: 'authentication-and-authorization',
  },
  {
    term: 'Authorization',
    definition:
      'Deciding whether a caller may perform an operation, often considering the specific resource and tenant.',
    lessonId: 'policies-and-ownership',
  },
  {
    term: 'Boxing',
    definition:
      'Representing a value type as an object or interface value, normally involving a boxed copy. Unboxing requires the correct underlying value type.',
    lessonId: 'value-reference-records',
  },
  {
    term: 'Cancellation token',
    definition:
      'A cooperative signal that work is no longer wanted. Operations must observe it; cancellation does not undo already committed side effects.',
    lessonId: 'cancellation-and-concurrency',
  },
  {
    term: 'Claim',
    definition:
      'A statement about an identity, such as a subject or permission. It is trustworthy only in the context of a validated source.',
    lessonId: 'authentication-and-authorization',
  },
  {
    term: 'CLR',
    definition:
      'Common Language Runtime: the execution environment that supplies services such as managed execution, exception handling, and garbage collection.',
    lessonId: 'dotnet-ecosystem',
  },
  {
    term: 'Closure',
    definition:
      'A function together with variables it captures from its surrounding scope. Capturing a variable is not necessarily taking a frozen copy of its current value.',
    lessonId: 'delegates-events-lambdas',
  },
  {
    term: 'CORS',
    definition:
      'A browser-enforced policy for cross-origin access. It is not authentication and does not prevent arbitrary non-browser HTTP requests.',
    lessonId: 'web-security',
  },
  {
    term: 'CQRS',
    definition:
      'Separating command and query responsibilities or models. It does not inherently require separate databases, event sourcing, or a broker.',
    lessonId: 'architecture-and-boundaries',
  },
  {
    term: 'CSRF',
    definition:
      'A threat in which a browser is induced to send an unwanted authenticated request using ambient credentials, commonly cookies.',
    lessonId: 'web-security',
  },
  {
    term: 'DbContext',
    definition:
      'An EF Core unit of work and change-tracking boundary. It is normally short-lived and is not safe for concurrent operations.',
    lessonId: 'ef-core-and-migrations',
  },
  {
    term: 'Deferred execution',
    definition:
      'Work described now but performed when a sequence is enumerated or a terminal operation runs. Repeating enumeration can repeat work.',
    lessonId: 'linq-and-execution',
  },
  {
    term: 'Dependency injection',
    definition:
      'Supplying a component with its collaborators rather than making it locate or construct all of them internally.',
    lessonId: 'dependency-injection',
  },
  {
    term: 'DTO',
    definition:
      'Data transfer object: a purpose-built shape for data crossing a boundary, such as a create request or API response.',
    lessonId: 'validation-and-problem-details',
  },
  {
    term: 'Endpoint',
    definition:
      'A selected request-handling operation with routing information and metadata, often distinguished by HTTP method and path.',
    lessonId: 'minimal-apis-and-routing',
  },
  {
    term: 'Idempotency',
    definition:
      'Repeating the same request has the same intended server effect as one request. The response messages do not have to be identical.',
    lessonId: 'rest-and-http-semantics',
  },
  {
    term: 'IL',
    definition:
      'Intermediate Language: the compiled instruction representation commonly emitted by a .NET compiler before runtime native compilation.',
    lessonId: 'dotnet-ecosystem',
  },
  {
    term: 'Invariant',
    definition:
      'A rule that must remain true for valid domain state, such as a task always having a nonblank title.',
    lessonId: 'classes-and-encapsulation',
  },
  {
    term: 'JIT',
    definition:
      'Just-in-time compilation: translating intermediate code into native instructions during execution. Native AOT uses a different ahead-of-time path.',
    lessonId: 'dotnet-ecosystem',
  },
  {
    term: 'JWT',
    definition:
      'A structured token format. A typical signed JWT has a readable encoded payload; its signature is not payload encryption.',
    lessonId: 'cookies-jwt-and-oidc',
  },
  {
    term: 'Kestrel',
    definition:
      'The cross-platform web server used by ASP.NET Core. It can operate behind a trusted reverse proxy or as an appropriately configured edge server.',
    lessonId: 'hosting-and-configuration',
  },
  {
    term: 'LINQ',
    definition:
      'Language Integrated Query: a set of query capabilities for filtering, transforming, and aggregating data through different providers.',
    lessonId: 'linq-and-execution',
  },
  {
    term: 'Middleware',
    definition:
      'A component in an HTTP pipeline that can inspect the request, call the next component, or short-circuit and return a response.',
    lessonId: 'middleware-pipeline',
  },
  {
    term: 'Migration',
    definition:
      'A versioned schema change. Generated operations must be reviewed and tested because valid SQL can still delete important data.',
    lessonId: 'ef-core-and-migrations',
  },
  {
    term: 'N+1',
    definition:
      'A query pattern with one initial query followed by another query per item, often causing avoidable database round trips.',
    lessonId: 'ef-query-performance',
  },
  {
    term: 'NuGet',
    definition:
      'The package ecosystem and tooling used to distribute and restore .NET dependencies. Package versions are separate from SDK versions.',
    lessonId: 'setup-and-tooling',
  },
  {
    term: 'Optimistic concurrency',
    definition:
      'Checking that an expected stored version still matches when writing, so stale edits can be detected rather than silently overwriting new data.',
    lessonId: 'concurrency-and-data-access',
  },
  {
    term: 'ORM',
    definition:
      'Object-relational mapper: a library that maps objects to relational data and automates part of the query/persistence work. It does not remove database semantics.',
    lessonId: 'ef-core-and-migrations',
  },
  {
    term: 'Outbox',
    definition:
      'A durable message record saved in the same local transaction as business data, then delivered separately. Consumers still need duplicate handling.',
    lessonId: 'distributed-systems',
  },
  {
    term: 'Problem Details',
    definition:
      'A standardized shape for HTTP API errors. Use it to communicate safe, consistent machine-readable failure meaning.',
    lessonId: 'validation-and-problem-details',
  },
  {
    term: 'Scoped lifetime',
    definition:
      'One service instance per DI scope. A web request commonly creates a scope, but a scope is not a thread.',
    lessonId: 'dependency-injection',
  },
  {
    term: 'SDK',
    definition:
      'Software development kit: the compilers, build tools, templates, and runtime needed to develop .NET applications.',
    lessonId: 'setup-and-tooling',
  },
  {
    term: 'Serialization',
    definition:
      'Converting structured values into a transferable representation such as JSON. Successful serialization is not validation or authorization.',
    lessonId: 'http-fundamentals',
  },
  {
    term: 'SLO',
    definition:
      'Service-level objective: a target for a defined reliability or performance indicator, measured over an explicit window.',
    lessonId: 'system-design',
  },
  {
    term: 'Transaction',
    definition:
      'A database unit of work with atomicity and isolation guarantees defined by the provider and configuration. It does not automatically include external email or HTTP calls.',
    lessonId: 'relationships-and-transactions',
  },
  {
    term: 'XSS',
    definition:
      'Cross-site scripting: untrusted content executes as code in a trusted web origin. Safe encoding and controlled rich-content sanitization are primary defenses.',
    lessonId: 'web-security',
  },
]

export const specializations = [
  {
    title: 'gRPC & streaming',
    description:
      'Protocol Buffers, typed service contracts, deadlines, and streaming. Study after HTTP and async fundamentals.',
    url: 'https://learn.microsoft.com/en-us/aspnet/core/grpc/?view=aspnetcore-10.0',
  },
  {
    title: 'GraphQL with .NET',
    description:
      'Schema design, resolvers, authorization, query cost, and N+1 prevention. A different API contract, not a universal REST replacement.',
    url: 'https://chillicream.com/docs/hotchocolate/',
  },
  {
    title: 'Advanced Blazor',
    description:
      'State persistence, JS interop, virtualization, component testing, and render-mode-specific deployment.',
    url: 'https://learn.microsoft.com/en-us/aspnet/core/blazor/?view=aspnetcore-10.0',
  },
  {
    title: 'SQL Server internals',
    description:
      'Execution plans, indexing, isolation, deadlocks, and operational tuning with representative workloads.',
    url: 'https://learn.microsoft.com/en-us/sql/relational-databases/performance/monitor-and-tune-for-performance',
  },
  {
    title: 'Azure application architecture',
    description:
      'Managed identity, App Service, Container Apps, messaging, observability, and cost-aware reliability.',
    url: 'https://learn.microsoft.com/en-us/azure/architecture/',
  },
  {
    title: 'Legacy ASP.NET maintenance',
    description:
      'Web Forms lifecycle, ViewState, System.Web, classic MVC, and incremental migration for existing Windows applications.',
    url: 'https://learn.microsoft.com/en-us/aspnet/web-forms/',
  },
  {
    title: '.NET Aspire',
    description:
      'Local orchestration, service discovery, and observability for distributed .NET development. Learn the underlying services first.',
    url: 'https://learn.microsoft.com/en-us/dotnet/aspire/',
  },
  {
    title: 'Native AOT & source generation',
    description:
      'Trimming, reflection constraints, generated serialization, startup costs, and deployment compatibility.',
    url: 'https://learn.microsoft.com/en-us/dotnet/core/deploying/native-aot/',
  },
]
