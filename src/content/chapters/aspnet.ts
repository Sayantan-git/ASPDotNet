import type { Chapter } from '../types'

export const aspnet: Chapter = {
  id: 'aspnet',
  title: 'ASP.NET Core fundamentals',
  description: 'Understand the host, pipeline, services, and endpoint boundaries.',
  level: 'Intermediate',
  accent: 'lime',
  lessons: [
    {
      id: 'hosting-and-configuration',
      title: 'The host, Program.cs & configuration',
      subtitle: 'Understand what happens before the first request reaches your code.',
      minutes: 35,
      tags: [
        'host',
        'Program.cs',
        'configuration',
        'options',
        'environment',
        'Kestrel',
        'IOptions',
        'launchSettings.json',
        'launch profile',
        'DOTNET_ENVIRONMENT',
      ],
      outcomes: [
        'Explain builder, service registration, Build, and Run.',
        'Understand configuration provider precedence.',
        'Bind and validate typed options.',
      ],
      sections: [
        {
          title: 'The host owns the application lifetime',
          body: "The host coordinates server startup, dependency injection, configuration, logging, and shutdown. WebApplication.CreateBuilder loads conventional defaults. You register services on builder.Services, build the application, configure its request pipeline, map endpoints, and run it. These are distinct phases, not interchangeable statements.\n\nKestrel accepts HTTP connections. It may sit behind a reverse proxy or run as an edge server with appropriate configuration. The host supplies HttpContext for each request, exposing request, response, user, and cancellation information. A long-lived host must not store a specific request's HttpContext for later work.",
        },
        {
          title: 'Configuration comes from ordered providers',
          body: 'In the usual application configuration, appsettings.json is followed by environment-specific settings, development user secrets where enabled, environment variables, and command-line arguments. Later providers normally override earlier values. Host configuration has related but distinct bootstrap rules; inspect the documented configuration model rather than assuming every setting follows one simple list.\n\nUse `TaskFlow__MaxTitleLength` for a nested environment-variable key. The double underscore is portable and maps to a configuration colon. Environment names such as Development and Production select behavior; they do not automatically make a deployment secure. Never expose the developer exception page or secret values publicly.',
        },
        {
          title: 'Turn string settings into a validated contract',
          body: 'The options pattern binds related configuration into a typed object. IOptions provides a stable options value, IOptionsSnapshot provides scoped snapshots, and IOptionsMonitor supports change notifications and current values. Reload behavior also depends on the configuration provider and how your consumer reads options.\n\nValidate settings early. A missing connection configuration or impossible title limit should fail startup clearly, not create mysterious failures halfway through a request. Keep secrets outside committed settings. User secrets are a development convenience and are not encrypted by that tool; production needs an appropriate secret store and access policy.',
        },
        {
          title: 'Local launch profiles are not production configuration',
          body: '`Properties/launchSettings.json` gives development tools named launch profiles. A Project profile can specify applicationUrl, environmentVariables, launchBrowser, and launchUrl. `dotnet run --launch-profile TaskFlow.Local` selects one; `--no-launch-profile` bypasses these development launch settings. Browser-launch behavior depends on the IDE/tool, so a launchBrowser flag is not a guarantee that every CLI invocation opens a browser.\n\nThe standard publish workflow does not deploy this file as production launch configuration. A service manager, container platform, IIS configuration, or managed host determines the production environment and listening settings. Do not put passwords or real production connection strings in a committed profile.\n\nWith WebApplication.CreateBuilder, DOTNET_ENVIRONMENT takes precedence over ASPNETCORE_ENVIRONMENT when both are provided. Older hosting APIs can have different precedence. Set them consistently and inspect the actual environment at startup when debugging an unexpected configuration.\n\nDevelopment can enable development-oriented defaults and conditional code, but it does not install Swagger UI by itself. Likewise, the word Production does not automatically add all required error handling, authorization, TLS, or secret protections. Your registered services and middleware still determine those behaviors.',
        },
        {
          title: 'Typed options still need runtime validation',
          body: 'An options property such as options.Value.MaxTitleLength is checked by the compiler. The spelling of a key in an environment variable or JSON file is not. A misspelled key can leave a default value silently in place. Use validation and ValidateOnStart for essential settings, and test the actual configuration providers used by the deployment.\n\n| Interface | Registration/lifetime idea | Change behavior |\n| --- | --- | --- |\n| IOptions<T> | Singleton options accessor | Caches the default options instance; normally not refreshed after creation |\n| IOptionsSnapshot<T> | Scoped accessor | Computes/caches per scope when requested; a request is one common scope |\n| IOptionsMonitor<T> | Singleton-capable accessor | Reads current values and can notify on supported reloads |\n\nA provider must support change notifications for live reloading to work. Editing an environment variable outside an already-running process does not behave like an automatically watched JSON file. A scoped snapshot is not necessarily a fresh disk read on every access. Explain lifetime, provider capability, and when the consumer reads the value separately.',
        },
      ],
      diagram: {
        title: 'Startup has an order',
        source:
          'flowchart LR\n  builder["Create builder"] --> services["Register services / options"]\n  services --> build["Build host"]\n  build --> pipeline["Configure pipeline / endpoints"]\n  pipeline --> run["Run and accept requests"]',
        caption:
          'The service graph is configured before building; the request pipeline is configured before normal request processing.',
      },
      example: {
        title: 'Validate a TaskFlow setting',
        filename: 'Program.cs',
        language: 'csharp',
        setup:
          'Complete ASP.NET Core example in a `dotnet new web` net10.0 project. Run with `-- --TaskFlow:MaxTitleLength=80` to override the default.',
        code: 'using Microsoft.Extensions.Options;\n\nvar builder = WebApplication.CreateBuilder(args);\nbuilder.Services.AddOptions<TaskOptions>()\n    .BindConfiguration("TaskFlow")\n    .Validate(options => options.MaxTitleLength is > 0 and <= 200, "Invalid title limit")\n    .ValidateOnStart();\n\nvar app = builder.Build();\napp.MapGet("/task-rules", (IOptions<TaskOptions> options) =>\n    new { options.Value.MaxTitleLength });\napp.Run();\n\npublic sealed class TaskOptions\n{\n    public int MaxTitleLength { get; set; } = 120;\n}',
        output: '{"maxTitleLength":80}',
        explanation: [
          'The default is 120; the supplied command-line setting overrides it to 80.',
          'Validation rejects values outside the allowed range during startup.',
          'Only a public business rule is returned. Never add an endpoint that dumps all configuration, because it can contain secrets.',
        ],
      },
      additionalExamples: [
        {
          title: 'A named local launch profile',
          filename: 'launchSettings.json',
          language: 'json',
          setup:
            'Place this file under Properties in the local TaskFlow web project. Run `dotnet run --launch-profile TaskFlow.Local` from that project. Choose another unused port if 5050 is already occupied; this profile is for loopback development only.',
          code: '{\n  "profiles": {\n    "TaskFlow.Local": {\n      "commandName": "Project",\n      "launchBrowser": false,\n      "applicationUrl": "http://localhost:5050",\n      "environmentVariables": {\n        "DOTNET_ENVIRONMENT": "Development",\n        "ASPNETCORE_ENVIRONMENT": "Development",\n        "TaskFlow__MaxTitleLength": "80"\n      }\n    }\n  }\n}',
          explanation: [
            'The profile gives local launch values, including an environment-variable override for the options example.',
            'The two environment names are deliberately consistent. Production deployment must supply its own configuration.',
            'No password or token is included. Changing launchUrl would only change an IDE launch target, not create a server route.',
          ],
        },
      ],
      traps: [
        {
          question: 'Does appsettings.json always win over environment variables?',
          answer:
            'No. With the normal application configuration ordering, environment variables override matching JSON settings, and command-line values override those. Custom provider ordering can change this.',
          warning:
            'Configuration precedence is a runtime contract, not just a file-naming convention.',
        },
        {
          question: 'Can a singleton consume IOptionsSnapshot?',
          answer:
            'IOptionsSnapshot is scoped and should not be captured by a singleton. Use a suitable lifetime and options interface, often IOptionsMonitor when a singleton must observe changing options.',
          warning: 'The options object does not excuse an invalid dependency lifetime.',
        },
      ],
      exercise: {
        title: 'Make startup fail clearly',
        brief: 'Run the example with title limits of 80, 0, and 500.',
        steps: [
          'Confirm 80 is returned from /task-rules.',
          'Inspect the startup failure for invalid values.',
          'Move the setting to an environment variable and explain precedence.',
        ],
        solution:
          'A valid limit starts normally. Zero and 500 fail options validation. Use TaskFlow__MaxTitleLength in the environment; if a conflicting command-line value remains, it normally takes precedence. Keep configuration failures explicit and secret values out of logs.',
      },
      quiz: {
        question: 'Why use ValidateOnStart for essential options?',
        options: [
          'To encrypt the settings file',
          'To fail early on invalid configuration',
          'To reload every value on every request',
          'To remove dependency injection',
        ],
        answer: 1,
        explanation:
          'Startup validation makes a bad deployment fail clearly before handling normal traffic. It does not encrypt configuration or automatically enable dynamic reloading.',
      },
      references: [
        {
          label: 'ASP.NET Core configuration',
          url: 'https://learn.microsoft.com/en-us/aspnet/core/fundamentals/configuration/?view=aspnetcore-10.0',
        },
        {
          label: 'Options pattern',
          url: 'https://learn.microsoft.com/en-us/aspnet/core/fundamentals/configuration/options?view=aspnetcore-10.0',
        },
      ],
    },
    {
      id: 'minimal-apis-and-routing',
      title: 'Minimal APIs & endpoint routing',
      subtitle: 'Turn an HTTP method and path into a small, explicit contract.',
      minutes: 26,
      tags: [
        'Minimal APIs',
        'MapGet',
        'MapPost',
        'routing',
        'route groups',
        'TypedResults',
        'binding',
      ],
      outcomes: [
        'Map and group endpoints.',
        'Understand route, query, body, and service binding.',
        'Return appropriate success and failure responses.',
      ],
      sections: [
        {
          title: 'An endpoint is more than a URL',
          body: 'Endpoint routing selects behavior using a route pattern, HTTP method, and metadata. MapGet handles GET; MapPost handles POST. A route such as /tasks/{id:int} captures a segment and constrains it to an integer-compatible route value. A query string such as ?completed=true is a separate input source.\n\nRoute constraints help select routes. They should not be your only business validation. A route mismatch often leads to 404, while a selected endpoint receiving invalid bound input commonly returns 400. Clients care about this distinction, so use route design and validation deliberately.',
        },
        {
          title: 'Binding connects HTTP data to parameters',
          body: 'Minimal APIs infer many sources: simple route and query parameters, JSON bodies for suitable complex types, registered services, and special types such as HttpContext or CancellationToken. Attributes such as FromBody and FromQuery can make a source explicit. A registered service may be resolved through DI rather than read from JSON.\n\nKeep request DTOs separate from persistence entities. A DTO, or data transfer object, specifies the fields clients may supply or receive. Binding is conversion; validation is checking whether the converted value is acceptable. A correctly parsed negative page size is still invalid business input.',
        },
        {
          title: 'Group endpoints without losing clarity',
          body: 'MapGroup can give related endpoints a prefix and shared metadata such as authorization requirements. TypedResults and typed result unions can make response possibilities explicit for tooling and tests. Results is convenient for small teaching examples because its common IResult return shape simplifies branches.\n\nMinimal does not mean unstructured. Extract a handler or application service when behavior becomes substantial. Endpoint filters can implement endpoint-level concerns, but they do not replace every middleware responsibility. Avoid turning Program.cs into a large mixture of SQL, validation, authentication, and business rules.',
        },
      ],
      diagram: {
        title: 'From route to result',
        source:
          'flowchart LR\n  request["GET /api/tasks/1"] --> routing["Match method + pattern"]\n  routing --> binding["Bind int id"]\n  binding --> handler["Find task"]\n  handler --> result["200 JSON or 404"]',
        caption: 'Selection, binding, business work, and response generation are separate stages.',
      },
      example: {
        title: 'A grouped task lookup',
        filename: 'Program.cs',
        language: 'csharp',
        setup:
          'Complete `dotnet new web` net10.0 example. The single read-only seed is an instructional data source, not persistence.',
        code: 'var builder = WebApplication.CreateBuilder(args);\nvar app = builder.Build();\n\nvar tasks = app.MapGroup("/api/tasks");\ntasks.MapGet("/{id:int}", (int id) =>\n{\n    if (id != 1)\n        return Results.NotFound();\n\n    return Results.Ok(new TaskResponse(1, "Learn routing", false));\n});\n\napp.Run();\n\npublic record TaskResponse(int Id, string Title, bool IsComplete);',
        output:
          'GET /api/tasks/1 -> 200 with the task\nGET /api/tasks/2 -> 404\nGET /api/tasks/text -> 404 route mismatch',
        explanation: [
          'The route group prefixes the handler path with /api/tasks.',
          'An integer other than 1 reaches the handler but has no matching resource.',
          "A non-integer does not satisfy this route constraint. The resulting 404 has a different cause from the handler's NotFound.",
        ],
      },
      traps: [
        {
          question: 'Is a route constraint a complete validation strategy?',
          answer:
            'No. It helps route selection. Business validation belongs after binding and may need a specific error contract rather than a route-mismatch 404.',
          warning: 'Routing failures and invalid resource data are not interchangeable.',
        },
        {
          question: 'Does Minimal API mean no architecture or tests?',
          answer:
            'No. It is an endpoint programming model. You can use services, DI, filters, typed results, integration tests, and clear module boundaries.',
          warning:
            'Small registration syntax is not permission to place all application logic in one file.',
        },
      ],
      exercise: {
        title: 'Add an optional filter',
        brief: 'Add GET /api/tasks with a nullable completed query parameter.',
        steps: [
          'Return all seeded tasks when the parameter is absent.',
          'Filter only when a Boolean value is supplied.',
          'Observe the response to an invalid Boolean value.',
        ],
        solution:
          'Use a bool? query parameter and filter only when it has a value. A malformed supplied Boolean normally produces a binding error rather than false. Keep the distinction between omitted input, false, and malformed input visible in the contract.',
      },
      quiz: {
        question: 'What is the main role of {id:int} in a route?',
        options: [
          'Authorize the caller',
          'Select routes that match an integer segment',
          'Create a database integer column',
          'Guarantee the task exists',
        ],
        answer: 1,
        explanation:
          'The constraint participates in route matching. It does not look up a resource, authorize access, or replace domain validation after the endpoint is selected.',
      },
      references: [
        {
          label: 'Minimal API parameter binding',
          url: 'https://learn.microsoft.com/en-us/aspnet/core/fundamentals/minimal-apis/parameter-binding?view=aspnetcore-10.0',
        },
        {
          label: 'Routing',
          url: 'https://learn.microsoft.com/en-us/aspnet/core/fundamentals/routing?view=aspnetcore-10.0',
        },
      ],
    },
    {
      id: 'middleware-pipeline',
      title: 'The middleware pipeline',
      subtitle:
        'Read the request going in, the response coming out, and every short circuit in between.',
      minutes: 28,
      tags: [
        'middleware',
        'pipeline',
        'Use',
        'Run',
        'Map',
        'short circuit',
        'authentication',
        'authorization',
      ],
      outcomes: [
        'Trace nested middleware execution.',
        'Explain short-circuiting and response-start constraints.',
        'Choose ordering based on actual dependencies.',
      ],
      sections: [
        {
          title: 'Middleware wraps what comes next',
          body: 'Middleware receives an HttpContext and usually a delegate for the next component. It can inspect or modify the request, call next, and then inspect the returning response. Think of nested function calls: A enters, B enters, the endpoint runs, B exits, A exits. The response work runs in reverse order because the call stack unwinds.\n\nA component can **short-circuit** by returning without calling next. Static-file handling, authorization failures, and rate-limit rejection can all end a request early in appropriate pipelines. Code later in the pipeline never runs for that request.',
        },
        {
          title: 'Order follows dependencies',
          body: 'An outer exception handler can observe exceptions from components inside it. Routing selects endpoint metadata that later components may need. Authentication identifies the user; authorization checks whether that user can perform an operation. CORS and endpoint-specific rate limiting also have ordering requirements.\n\nMinimal hosting can add some middleware automatically when relevant services are present, but explicit ordering is needed when the sequence matters. Consult the framework guidance for the features you use. There is no universal five-line pipeline that covers APIs, static files, antiforgery, reverse proxies, and every authentication scheme.',
        },
        {
          title: 'A response cannot always be changed later',
          body: 'After the response headers have started, code cannot freely change the status or append arbitrary headers. Register OnStarting when a header must be set just before the response starts, or set it before invoking the next component when appropriate. Writing a body and then calling next can create a confusing combined response.\n\nUse adds middleware that may call the next component. Run with a request delegate adds terminal middleware; parameterless app.Run starts the host. Map has different overloads for branches and endpoint registration. Explain which overload you mean instead of memorizing one definition for every method named Run or Map.',
        },
      ],
      diagram: {
        title: 'The pipeline unwinds',
        source:
          'sequenceDiagram\n  participant A as Middleware A\n  participant B as Middleware B\n  participant Endpoint\n  A->>B: await next\n  B->>Endpoint: await next\n  Endpoint-->>B: Response\n  B-->>A: Return\n  Note over A: Outer response work runs last',
        caption:
          'Calling next nests the remaining pipeline. Returning without next prevents downstream execution.',
      },
      example: {
        title: 'Trace a real middleware request',
        filename: 'Program.cs',
        language: 'csharp',
        setup:
          'Complete web example. Start it and request / once; these lines appear in the server console for that request.',
        code: 'var builder = WebApplication.CreateBuilder(args);\nvar app = builder.Build();\n\napp.Use(async (context, next) =>\n{\n    Console.WriteLine("A in");\n    await next(context);\n    Console.WriteLine("A out");\n});\napp.Use(async (context, next) =>\n{\n    Console.WriteLine("B in");\n    await next(context);\n    Console.WriteLine("B out");\n});\napp.MapGet("/", () =>\n{\n    Console.WriteLine("Endpoint");\n    return "TaskFlow";\n});\napp.Run();',
        output: 'A in\nB in\nEndpoint\nB out\nA out',
        explanation: [
          'Each await next call waits for all downstream work in that request path.',
          'The code after next executes as the nested calls return.',
          'Browser requests for other assets may produce additional traces; use a single curl request when comparing exact output.',
        ],
      },
      traps: [
        {
          question: 'Why should authentication precede authorization?',
          answer:
            'Authorization commonly needs the authenticated principal. Running it before the relevant authentication behavior can evaluate the request as anonymous or use an unintended identity.',
          warning:
            "Also account for the host's automatic middleware and the configured authentication schemes.",
        },
        {
          question: 'Can middleware always change headers after await next?',
          answer:
            'No. Downstream code may already have started the response. Set headers before that point or register a suitable OnStarting callback.',
          warning:
            'The fact that your code runs later does not mean the protocol state is still mutable.',
        },
      ],
      exercise: {
        title: 'Create a short circuit',
        brief: 'Change middleware B so requests to /blocked return 403 without calling next.',
        steps: [
          'Predict the trace for /blocked.',
          'Compare it with the trace for /.',
          'Explain which outer middleware still executes its post-next code.',
        ],
        solution:
          'The blocked trace enters A and B, then B returns its response without entering the endpoint. A still resumes after its next call. If B logs an exit before returning, that appears too. Short-circuiting skips downstream work, not the outer stack frames already entered.',
      },
      quiz: {
        question: 'For middleware A, then B, then an endpoint, what is the normal order?',
        options: [
          'A in, A out, B in, B out, endpoint',
          'Endpoint, A in, B in',
          'A in, B in, endpoint, B out, A out',
          'B in, A in, endpoint, A out, B out',
        ],
        answer: 2,
        explanation:
          'Calling next creates nested execution. The endpoint runs inside B, which runs inside A. Post-next code executes in reverse order as those calls return.',
      },
      references: [
        {
          label: 'ASP.NET Core middleware',
          url: 'https://learn.microsoft.com/en-us/aspnet/core/fundamentals/middleware/?view=aspnetcore-10.0',
        },
      ],
    },
    {
      id: 'dependency-injection',
      title: 'Dependency injection & service lifetimes',
      subtitle: 'Know who creates a dependency, who shares it, and who disposes it.',
      minutes: 30,
      tags: [
        'DI',
        'transient',
        'scoped',
        'singleton',
        'captive dependency',
        'IServiceScopeFactory',
        'DbContext',
      ],
      outcomes: [
        'Choose lifetimes based on state and ownership.',
        'Identify captive dependencies and thread-safety risks.',
        'Explain scopes in requests and background services.',
      ],
      sections: [
        {
          title: 'Registration describes construction',
          body: 'The DI container creates registered services and supplies them to consumers. Constructor injection makes required collaborators visible. ASP.NET Core also supports resolving services into endpoint parameters. Register the service contract and implementation before building the host. Avoid using a service locator throughout business code, because hidden lookups make dependencies and failures harder to see.\n\nThe container is not magic object storage. Each registration has a lifetime that affects sharing, disposal, and concurrency. Choosing a longer lifetime just to reduce allocations can accidentally share request-specific state across users.',
        },
        {
          title: 'Three lifetimes, different promises',
          body: '| Lifetime | Reuse rule | Typical example |\n| --- | --- | --- |\n| Transient | New instance for each resolution | Lightweight stateless operation object |\n| Scoped | One instance per DI scope | EF Core DbContext in a request |\n| Singleton | One instance for the application container | Thread-safe shared service |\n\nA web request normally creates a scope, but scope is the actual abstraction: background work can create scopes too. A singleton must be safe for concurrent access and must not capture a scoped dependency. A transient captured by a singleton also lives as long as that singleton reference, regardless of the registration label.',
        },
        {
          title: 'Lifetime mismatches are ownership bugs',
          body: 'A captive dependency occurs when a longer-lived service holds a shorter-lived one in a way that violates the intended lifetime. Injecting a DbContext into a singleton can retain stale tracking state, cause concurrent use, and break disposal expectations. Scope validation can catch some mismatches, but it cannot prove your whole design is safe.\n\nA BackgroundService is effectively long-lived. Use IServiceScopeFactory to create a scope for a unit of work, resolve scoped dependencies inside it, await the work, then dispose the scope. Do not store the resolved service for later. Services created by the container are generally disposed by the container; avoid manually disposing an injected service you do not own.',
        },
        {
          title: 'Creation time, disposal, and registration order',
          body: 'A singleton registered by implementation type or factory is generally created on first resolution, not necessarily at process startup. Registering an already-created instance is different. Registration methods can execute configuration code, and `new` in an instance registration really does create that object at that point. Therefore, "nothing can be instantiated before Build" is too absolute.\n\nA transient service is not automatically disposed immediately after the caller uses it. When the built-in container creates a disposable transient, it normally retains it for disposal with the owning scope or root container. Repeatedly resolving disposable transients from the root can retain resources much longer than intended. Objects supplied as externally created instances need an explicit ownership policy.\n\nRegistration order also matters when the same service type is registered multiple times: ordinary single-service resolution generally selects the last registration, while IEnumerable<T> resolution preserves the registered collection order. TryAdd, decorators, hosted services, and ordered options configuration introduce further reasons not to treat registration as an unordered bag. These are different ordering concerns from middleware request execution.',
        },
      ],
      diagram: {
        title: 'Request scope versus application lifetime',
        source:
          'flowchart TB\n  host["Application container"] --> singleton["One singleton"]\n  host --> scopeA["Request A scope"]\n  host --> scopeB["Request B scope"]\n  scopeA --> contextA["DbContext A"]\n  scopeB --> contextB["DbContext B"]',
        caption:
          'Scoped services are shared inside one scope, not across unrelated requests or background units of work.',
      },
      example: {
        title: 'Observe a scoped identity',
        filename: 'Program.cs',
        language: 'csharp',
        setup: 'Complete web example. Request /scope twice and compare the returned IDs.',
        code: 'var builder = WebApplication.CreateBuilder(args);\nbuilder.Services.AddScoped<RequestMarker>();\nvar app = builder.Build();\n\napp.MapGet("/scope", (RequestMarker first, RequestMarker second) =>\n    new { sameInstance = ReferenceEquals(first, second), first.Id });\n\napp.Run();\n\npublic sealed class RequestMarker\n{\n    public Guid Id { get; } = Guid.NewGuid();\n}',
        output: 'Within one request: sameInstance is true.\nAcross two requests: id values differ.',
        explanation: [
          'Both handler parameters resolve the same scoped registration within the current request scope.',
          'A new request receives a different scope and therefore a new marker.',
          'Changing the registration to singleton makes the marker shared across requests. This is a lifetime demonstration, not a recommended identity mechanism.',
        ],
      },
      traps: [
        {
          question: 'Does scoped always mean one instance per thread?',
          answer:
            'No. It means one instance per DI scope. A request scope may continue across different threads during asynchronous execution, and manual scopes can exist outside HTTP requests.',
          warning: 'Thread identity and dependency scope are unrelated ownership concepts.',
        },
        {
          question: 'Can a singleton safely inject DbContext?',
          answer:
            'Normally no: DbContext is scoped by default and is not thread-safe. A singleton should create an appropriate scope or use a suitable factory for bounded units of work.',
          warning:
            'Resolving from the root container does not turn a scoped service into a safe singleton.',
        },
      ],
      exercise: {
        title: 'Diagnose a captive dependency',
        brief: 'A singleton report scheduler directly receives a scoped TaskDbContext.',
        steps: [
          'Identify the lifetime mismatch.',
          'Move scope creation inside each report operation.',
          'Ensure the report is awaited before the scope is disposed.',
        ],
        solution:
          'Inject IServiceScopeFactory into the scheduler, create an async scope for the report, resolve the context inside it, and await all work before leaving that scope. Do not return an unenumerated query or store the context beyond the scope lifetime.',
      },
      quiz: {
        question: 'How often is a scoped service reused?',
        options: [
          'Once per operating-system thread',
          'Once per application forever',
          'Within the same DI scope',
          'A new instance on every property access',
        ],
        answer: 2,
        explanation:
          'Scoped lifetime means one instance per service scope. ASP.NET Core normally creates a scope for each request, but applications can create additional scopes for other units of work.',
      },
      references: [
        {
          label: 'ASP.NET Core dependency injection',
          url: 'https://learn.microsoft.com/en-us/aspnet/core/fundamentals/dependency-injection?view=aspnetcore-10.0',
        },
      ],
    },
    {
      id: 'validation-and-problem-details',
      title: 'Validation, DTOs & Problem Details',
      subtitle: 'Reject bad input clearly without exposing your internal model.',
      minutes: 45,
      tags: [
        'DTO',
        'validation',
        'ProblemDetails',
        '400',
        'overposting',
        'data annotations',
        'AddValidation',
        'AutoMapper',
        'ProjectTo',
        'Required',
        'Range',
      ],
      outcomes: [
        'Separate binding, validation, and domain invariants.',
        'Define a consistent API error shape.',
        'Avoid overposting and accidental information disclosure.',
      ],
      sections: [
        {
          title: 'Do not trust a successfully bound object',
          body: 'Binding converts HTTP input into .NET values. Validation checks whether those values are acceptable. Domain rules preserve invariants during actual operations. A valid JSON document can still describe a blank title or an impossible deadline. Validation at the edge improves feedback, but critical domain invariants should not depend on one specific HTTP controller being the only caller.\n\nUse separate create, update, and response DTOs. If you bind a persistence entity directly, a client may set fields it should not control, such as OwnerId, IsAdmin, or CreatedAt. This is often called overposting or mass assignment. A smaller request contract makes the allowed inputs explicit.',
        },
        {
          title: 'Understand framework-specific validation',
          body: 'Controller APIs with ApiController use model-state behavior and commonly return automatic 400 responses for validation errors. Minimal API binding is not the same as MVC model validation. .NET 10 adds built-in Minimal API validation support through the appropriate validation package and AddValidation registration; understand its supported types and configuration before relying on it.\n\nThe example uses explicit validation so its behavior is visible and does not depend on that optional setup. For larger applications, use a consistent validation strategy with clear rules and tests. Client-side validation improves convenience but can always be bypassed, so the server remains responsible.',
        },
        {
          title: 'Errors are part of your public API',
          body: 'Problem Details is a standardized shape for HTTP API failures, defined by RFC 9457. It includes fields such as type, title, status, detail, and instance, with extensions for additional information. ASP.NET Core supplies ProblemDetails and validation-oriented helpers. Use stable machine-readable meaning rather than forcing clients to parse a human sentence.\n\nUnexpected exceptions should produce a safe generic response, while protected logs retain diagnostics. Do not send database exceptions or stack traces as detail in production. A trace identifier can help support connect a user report to server logs. Be consistent about 400 versus 422 if your API distinguishes malformed input from semantic validation; document the choice rather than changing it endpoint by endpoint.',
        },
        {
          title: 'The Required integer trap',
          body: 'The PDF shows `[Required]` on a non-nullable int AuthorId. That does not reject zero: an int has a value even when the client omitted it and binding left the default zero. Required checks missing/null content, not whether an ID is positive or points to an existing row.\n\nUse an explicit range rule for a positive identifier. If the API must distinguish "not supplied" from a supplied zero, use a nullable input type such as int? with Required and Range together, or an equivalent explicit validation rule. Keep existence and authorization checks separate: ProjectId 42 may be numerically valid but absent or inaccessible to this caller.\n\nAttributes do not run automatically everywhere a C# object is constructed. MVC model validation, a configured Minimal API validator, an EditForm validator, or an explicit Validator call supplies the execution mechanism. The constructor of an ordinary DTO does not become a business-policy engine because attributes are present. Test the actual entry point and its configured behavior.',
        },
        {
          title: 'Manual mapping, AutoMapper, and query projection',
          body: '**Mapping** translates one object shape into another. A manual `new TaskDetails(entity.Id, entity.Title)` is explicit and easy to inspect. AutoMapper centralizes mapping plans using profiles and conventions, with configuration for renamed or calculated fields. It builds execution plans; describing every runtime mapping as naive reflection is misleading.\n\nA convention that starts mapping a newly added same-named property is convenient, but it can also accidentally expand an API contract. Review output DTOs and mapping rules, and test sensitive fields. Avoid applying an unrestricted reverse map from a client DTO onto server-owned fields. Mapping is neither authorization nor a replacement for validation.\n\n`mapper.Map` works on objects already materialized in memory. `ProjectTo<T>` builds an IQueryable projection so the database provider can select the required shape. Apply entity filters, ordering, and pagination before ProjectTo, then materialize. The provider still must translate the expression; arbitrary helper methods, custom resolvers, and runtime mapping callbacks are not automatically SQL-capable. A manual Select projection can provide the same column-selection benefit.\n\nAutoMapper 15 introduced license requirements and configuration/API changes, including an ILoggerFactory argument for direct MapperConfiguration construction. Check the license terms and installed-version guide before adding it to a public or commercial project. The learning app itself does not require AutoMapper or a license key; the example is an optional integration excerpt.',
        },
        {
          title: 'Global errors have a pipeline boundary',
          body: 'Exception-handling middleware can handle unhandled exceptions from downstream request processing while it can still produce an error response. It cannot retroactively replace headers and a body that have already started, and it does not catch arbitrary background-job or startup failures outside that request invocation. A "catch everything and always write JSON" middleware sample misses those boundaries.\n\nPrefer the framework exception-handling/Problem Details infrastructure for ordinary ASP.NET Core APIs. Log protected diagnostic context with a trace identifier and return safe public details. Validate client-supplied correlation identifiers before logging them. A consistent error contract covers binding, validation, authorization, not-found, and unexpected failures, not just exceptions thrown inside controller code.\n\nRFC 9457 supersedes RFC 7807 for Problem Details. Fields such as error, message, timestamp, and path can form a custom error contract, but that custom object is not automatically the standard Problem Details schema. Use clear type/title/status fields and documented extensions when following the standard.',
        },
      ],
      diagram: {
        title: 'Three validation boundaries',
        source:
          'flowchart LR\n  json["HTTP / JSON"] --> binding["Bind request DTO"]\n  binding --> validation["Validate input"]\n  validation --> domain["Enforce domain invariant"]\n  validation --> problem["400 Problem Details"]\n  domain --> result["Valid operation"]',
        caption:
          'Boundary validation gives useful feedback. Domain invariants still protect non-HTTP callers.',
      },
      example: {
        title: 'Validate a title without storing it',
        filename: 'Program.cs',
        language: 'csharp',
        setup:
          'Complete web example. POST JSON such as {"title":"   "} to /tasks/validate with Content-Type application/json. This endpoint validates only; it does not create a task.',
        code: 'var builder = WebApplication.CreateBuilder(args);\nbuilder.Services.AddProblemDetails();\nvar app = builder.Build();\napp.UseExceptionHandler();\n\napp.MapPost("/tasks/validate", (CreateTaskRequest request) =>\n{\n    if (string.IsNullOrWhiteSpace(request.Title) || request.Title.Trim().Length > 120)\n        return Results.ValidationProblem(new Dictionary<string, string[]>\n        {\n            ["title"] = ["Use a nonblank title of at most 120 characters."]\n        });\n\n    return Results.Ok(new { title = request.Title.Trim() });\n});\napp.Run();\n\npublic record CreateTaskRequest(string? Title);',
        output:
          'Blank title -> 400 with an errors.title entry\nValid title -> 200 with the normalized title',
        explanation: [
          'The nullable request property honestly models potentially missing client input.',
          'Validation returns a structured error, not a 200 response containing an error sentence.',
          'The DTO contains no owner or database ID, so clients cannot set those fields through this contract.',
        ],
      },
      additionalExamples: [
        {
          title: 'Require a supplied, positive project ID',
          filename: 'ValidateProjectId.cs',
          language: 'csharp',
          setup:
            'Complete net10.0 console example using built-in DataAnnotations. Replace Program.cs in a disposable console project. The explicit Validator call is what evaluates the attributes here.',
          code: 'using System.ComponentModel.DataAnnotations;\n\nforeach (int? projectId in new int?[] { null, 0, 42 })\n{\n    var request = new TaskDraft { Title = "Learn validation", ProjectId = projectId };\n    var errors = new List<ValidationResult>();\n    bool valid = Validator.TryValidateObject(\n        request, new ValidationContext(request), errors, validateAllProperties: true);\n    Console.WriteLine($"{projectId?.ToString() ?? "missing"}: {valid}");\n}\n\npublic sealed class TaskDraft\n{\n    [Required, StringLength(120)]\n    public string Title { get; init; } = "";\n\n    [Required, Range(1, int.MaxValue)]\n    public int? ProjectId { get; init; }\n}',
          output: 'missing: False\n0: False\n42: True',
          explanation: [
            'Nullable input preserves the difference between absence and a numeric value. Required rejects null; Range rejects zero.',
            'The valid number still needs a lookup and an ownership/membership check before it can authorize a task operation.',
            'This console validation is explicit. MVC and Minimal APIs must be tested with their own configured validation mechanisms.',
          ],
        },
        {
          title: 'Map only the public fields',
          filename: 'MapTaskResponse.cs',
          language: 'csharp',
          setup:
            'Complete net10.0 console example using the built-in JSON serializer. No mapping package or license is needed for this explicit two-field response.',
          code: 'using System.Text.Json;\n\nvar stored = new StoredTask(7, "Understand mapping", "Internal audit detail");\nvar response = new TaskDetails(stored.Id, stored.Title);\nvar options = new JsonSerializerOptions(JsonSerializerDefaults.Web);\nConsole.WriteLine(JsonSerializer.Serialize(response, options));\n\npublic sealed record StoredTask(int Id, string Title, string InternalNotes);\npublic sealed record TaskDetails(int Id, string Title);',
          output: '{"id":7,"title":"Understand mapping"}',
          explanation: [
            'The response type has no InternalNotes member, so serializing this DTO cannot accidentally emit that member from the storage object.',
            'The API must still decide which caller may read this response. Hiding a field is not a complete access-control policy.',
          ],
        },
        {
          title: 'Project to a DTO with AutoMapper',
          filename: 'TaskProjection.cs',
          language: 'csharp',
          setup:
            'Separate integration excerpts, not a standalone Program.cs. Add a supported AutoMapper version and follow its licensing guide. Use an existing EF Core TaskDbContext/TaskItem with Id, Title, and IsComplete, and the TaskDetails record shown in the manual example. Register the profile before Build and run the query in an async service with db, mapper, and cancellationToken.',
          code: 'using AutoMapper;\nusing AutoMapper.QueryableExtensions;\nusing Microsoft.EntityFrameworkCore;\n\npublic sealed class TaskProfile : Profile\n{\n    public TaskProfile() => CreateProjection<TaskItem, TaskDetails>();\n}\n\nbuilder.Services.AddAutoMapper(configuration =>\n{\n    configuration.LicenseKey = builder.Configuration["AutoMapper:LicenseKey"]\n        ?? throw new InvalidOperationException("Configure the applicable AutoMapper license");\n}, typeof(TaskProfile));\n\nvar results = await db.Tasks\n    .Where(task => !task.IsComplete)\n    .OrderBy(task => task.Id)\n    .Take(20)\n    .ProjectTo<TaskDetails>(mapper.ConfigurationProvider)\n    .ToListAsync(cancellationToken);',
          explanation: [
            'The profile defines projection rules. The registration and query blocks belong in their stated host/service locations, not after a type declaration in a top-level Program.cs.',
            'ProjectTo is the final query-shaping step before materialization. Inspect generated SQL and test provider translation.',
            'A manual Select(task => new TaskDetails(task.Id, task.Title)) is a valid simpler alternative. Never paste a real license value into committed code.',
          ],
        },
      ],
      traps: [
        {
          question: 'Does successful JSON deserialization mean valid business data?',
          answer:
            'No. Deserialization establishes a representation, not business correctness. Required content, ranges, relationships, and authorization still need validation.',
          warning: 'A non-null object can contain entirely invalid values.',
        },
        {
          question: 'Should clients submit the database entity directly?',
          answer:
            'Usually use purpose-built request DTOs. Exposing every entity property can enable overposting and tightly couple the API to storage details.',
          warning:
            'Ignoring unexpected JSON properties is not a substitute for designing the allowed contract.',
        },
        {
          question: 'Does Required on a non-nullable int reject a missing positive ID?',
          answer:
            'Not by itself. A non-nullable int can hold default zero, and Required does not assert positivity or database existence. Use a suitable range and, when absence matters, nullable input plus an explicit required rule.',
          warning:
            'Syntactic presence, numeric validity, existence, and ownership are four different checks.',
        },
      ],
      exercise: {
        title: 'Protect server-owned fields',
        brief:
          'A create endpoint currently accepts Id, Title, OwnerId, and CreatedAt from clients.',
        steps: [
          'Design a smaller create request.',
          'Derive owner identity from the authenticated user.',
          'Set timestamps and identifiers through trusted server behavior.',
        ],
        solution:
          'Accept only client-editable fields such as Title and an optional description. Determine ownership from a validated identity and authorization context, and generate creation metadata on the server. Return a separate response DTO. Never use a supplied OwnerId as proof of access.',
      },
      quiz: {
        question: 'What does a request DTO primarily help define?',
        options: [
          'Every internal database column',
          'The input contract clients are allowed to supply',
          'The server thread count',
          'The TLS certificate chain',
        ],
        answer: 1,
        explanation:
          'A request DTO makes accepted input explicit and separates the public API from the persistence model. Validation and authorization still have to enforce the actual rules.',
      },
      references: [
        {
          label: 'Handle API errors',
          url: 'https://learn.microsoft.com/en-us/aspnet/core/fundamentals/error-handling-api?view=aspnetcore-10.0',
        },
        {
          label: 'Minimal API validation',
          url: 'https://learn.microsoft.com/en-us/aspnet/core/fundamentals/minimal-apis/validation?view=aspnetcore-10.0',
        },
        {
          label: 'AutoMapper query projections',
          url: 'https://docs.automapper.io/en/stable/Queryable-Extensions.html',
        },
        {
          label: 'AutoMapper 15 upgrade and licensing',
          url: 'https://docs.automapper.io/en/stable/15.0-Upgrade-Guide.html',
        },
      ],
    },
  ],
}
