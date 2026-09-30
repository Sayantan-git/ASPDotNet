import type { Chapter } from '../types'

export const foundations: Chapter = {
  id: 'foundations',
  title: '.NET foundations',
  description: 'Get your bearings. Understand the platform, your tools, and the web.',
  level: 'Beginner',
  accent: 'lime',
  lessons: [
    {
      id: 'dotnet-ecosystem',
      title: '.NET, C# & ASP.NET Core',
      subtitle:
        'Three names. One ecosystem. Connect the dots before writing your first line of code.',
      minutes: 12,
      tags: ['C#', '.NET', 'CLR', 'SDK', 'runtime', 'JIT', 'AOT'],
      outcomes: [
        'Separate the language, platform, and web framework.',
        'Trace a C# program from source code to execution.',
        'Choose the right .NET tools for a new web application.',
      ],
      sections: [
        {
          title: 'The big picture',
          body: 'Imagine building a house. You need a language to describe the plan, tools and materials to build it, and a set of patterns for a particular kind of house. **C# is the programming language. .NET is the development platform. ASP.NET Core is the web framework built on that platform.** They work together, but they are not interchangeable names.\n\nA programming language gives you rules for expressing instructions. A platform provides the runtime that executes those instructions and libraries for common work, such as reading files or making network requests. A framework supplies structure for a particular kind of application. ASP.NET Core supplies HTTP handling, routing, dependency injection, and other web-specific building blocks.',
        },
        {
          title: 'Three pieces, three jobs',
          body: '| Piece | What it is | Its job in TaskFlow |\n| --- | --- | --- |\n| C# | A strongly typed programming language | Describe a task, validate a title, decide what happens next |\n| .NET | A runtime, libraries, and development tools | Execute the program, manage memory, work with collections |\n| ASP.NET Core | A cross-platform web framework | Receive an HTTP request and return task data |\n\n**Strongly typed** means values have types and operations must respect those types. A task title is a `string`; its completion state is a `bool`. The compiler can catch many invalid combinations before your application runs. Strong typing does not prevent every bug: a perfectly valid calculation can still implement the wrong business rule.',
        },
        {
          title: 'From source code to a running app',
          body: 'In a typical build, the C# compiler translates your source into **Intermediate Language (IL)** and metadata, packaged in an assembly such as a `.dll`. Metadata describes the types and members in that assembly. When the application runs, the **Common Language Runtime (CLR)** loads it. The just-in-time compiler, or **JIT**, turns IL into machine instructions as needed. The runtime also manages exceptions and garbage collection.\n\nThat is the usual model, not the only one. **Native AOT** compiles an application ahead of time into native code. It can improve startup and deployment characteristics, but reflection-heavy code and some libraries need extra care. You do not need AOT to build your first API. First understand the normal build-and-run loop.',
        },
        {
          title: 'Which .NET should you learn?',
          body: 'This path targets **.NET 10 LTS and C# 14**. LTS means long-term support, not a special edition of C#. The .NET 10 support window ends on November 14, 2028; keep current with its servicing patches. Version-specific links accompany the lessons because framework behavior changes.\n\nInstall the **SDK** to develop applications. It contains build tools and the runtime. A runtime-only installation can run compatible applications, but it cannot build them. On a server, a framework-dependent ASP.NET Core deployment needs the ASP.NET Core runtime. A self-contained deployment includes its runtime.\n\nOur running project is **TaskFlow**, a small task tracker. It will grow from a console program into an API with a database, validation, tests, and production concerns. Each step introduces the concepts needed for the next one.',
        },
      ],
      diagram: {
        title: 'From C# to a working application',
        source:
          'flowchart LR\n  source["C# source"] --> compiler["Compiler"]\n  compiler --> assembly["IL + metadata"]\n  assembly --> runtime[".NET runtime / JIT"]\n  runtime --> app["Running application"]\n  classDef green fill:#233625,stroke:#b9e779,color:#e3f7c8\n  classDef blue fill:#193339,stroke:#65d4ce,color:#c9f3ef\n  class source,app green\n  class compiler,assembly,runtime blue',
        caption:
          'The standard managed execution path. Native AOT uses an ahead-of-time compilation path instead.',
      },
      example: {
        title: 'Your first connection to .NET',
        filename: 'Program.cs',
        language: 'csharp',
        setup:
          'After installing the .NET 10 SDK, create a console project with `dotnet new console -n TaskFlow.Cli -f net10.0`. Replace its Program.cs with this complete example and run `dotnet run --project TaskFlow.Cli`.',
        code: 'string taskTitle = "Learn the .NET ecosystem";\nbool isComplete = false;\n\nConsole.WriteLine($"Task: {taskTitle}");\nConsole.WriteLine($"Complete: {isComplete}");\nConsole.WriteLine($"Runtime: {Environment.Version.Major}");',
        output: 'Task: Learn the .NET ecosystem\nComplete: False\nRuntime: 10',
        explanation: [
          'The declarations and string interpolation are C# language features. The dollar sign allows an expression inside braces to become part of a string.',
          'Console and Environment are types from the .NET libraries. Console.WriteLine writes text followed by a new line.',
          'There is no web server in this example. ASP.NET Core enters the picture when TaskFlow needs to receive HTTP requests.',
        ],
      },
      traps: [
        {
          question: 'Is C# the same thing as .NET?',
          answer:
            'No. C# is one language that targets .NET. F# and Visual Basic also target the platform. .NET supplies runtime services and libraries, independent of one language.',
          warning: 'Do not describe ASP.NET Core as a programming language.',
        },
        {
          question: 'Is C# compiled or interpreted?',
          answer:
            'Normally, C# compiles to IL and the runtime JIT-compiles IL to native code. Native AOT is another compilation model. Explain the stages instead of giving a one-word answer.',
          warning: 'Saying every .NET app must use JIT ignores AOT deployments.',
        },
      ],
      exercise: {
        title: 'Explain the stack in your own words',
        brief:
          'A teammate says: "I installed C#, so my browser can now run an ASP.NET website." Identify what is missing.',
        steps: [
          'Write one sentence for each of C#, the .NET SDK, the .NET runtime, and ASP.NET Core.',
          'Run the example, change the task title, and rebuild.',
          'Explain why editing source code changes the next build, not an already-running binary.',
        ],
        solution:
          'The SDK builds the code. The runtime executes it. An ASP.NET Core application normally runs on a server process, which the browser contacts over HTTP. A browser does not directly execute ordinary server-side C#; Blazor WebAssembly is a distinct hosting model covered later.',
      },
      quiz: {
        question: 'Which component normally turns IL into machine code while a .NET app runs?',
        options: [
          'The C# source file',
          'The JIT compiler in the runtime',
          'The web browser',
          'NuGet',
        ],
        answer: 1,
        explanation:
          'The C# compiler produces IL in the usual build path. The JIT compiler is part of the runtime and compiles that IL into native instructions. NuGet restores packages, not machine code.',
      },
      references: [
        {
          label: '.NET introduction',
          url: 'https://learn.microsoft.com/en-us/dotnet/core/introduction',
        },
        {
          label: '.NET support policy',
          url: 'https://dotnet.microsoft.com/en-us/platform/support/policy/dotnet-core',
        },
      ],
    },
    {
      id: 'setup-and-tooling',
      title: 'Set up your developer toolkit',
      subtitle: 'Know what your editor, SDK, terminal, and package manager actually do.',
      minutes: 18,
      tags: ['setup', 'SDK', 'CLI', 'NuGet', 'VS Code', 'debugger', 'csproj'],
      outcomes: [
        'Create and run a .NET project.',
        'Read the important parts of a project file.',
        'Distinguish restore, build, run, and publish.',
      ],
      sections: [
        {
          title: 'Install the essentials',
          body: 'Install the **.NET 10 SDK** from Microsoft for your operating system and architecture. Then install Visual Studio Code with the C# Dev Kit extension, or use a compatible Visual Studio installation. Your editor helps you write and debug code; the SDK is what actually compiles it. Installing an editor alone is not enough.\n\nOpen a fresh terminal and run `dotnet --info`. You should see an SDK whose major version is 10. Multiple SDK versions can coexist. If the command is not found, restart the terminal and check the installer and PATH configuration. Do not download an SDK from an unknown third-party mirror.',
        },
        {
          title: 'Understand the project files',
          body: 'A `.csproj` file describes the project to the build system, MSBuild. `TargetFramework` such as `net10.0` selects the target API surface. `PackageReference` entries name NuGet dependencies. `Nullable` enables compiler analysis that helps you avoid null-related mistakes. `ImplicitUsings` supplies common namespace imports.\n\nA **namespace** groups related type names. A **package** distributes reusable code and related assets. An **assembly** is compiled output. These concepts are related, but one package may contain several assemblies, and one assembly may contain many namespaces. The `bin` directory contains build outputs; `obj` holds intermediate files. Neither belongs in source control.',
        },
        {
          title: 'The everyday development loop',
          body: '| Command | Main responsibility |\n| --- | --- |\n| `dotnet restore` | Resolve and download package dependencies |\n| `dotnet build` | Compile the project; restores by default |\n| `dotnet run` | Build and start a runnable project |\n| `dotnet test` | Build and run a test project |\n| `dotnet publish -c Release` | Produce deployment output |\n\nBuild success is not proof that the program behaves correctly. Tests check behavior; the debugger lets you pause and inspect a running program. Put a breakpoint beside a variable assignment, start debugging, and use Step Over to watch the value change. A breakpoint cannot help if you are running a different process or an old binary.',
        },
        {
          title: 'Keep the environment reproducible',
          body: 'Commit source code, project files, tests, and configuration templates. Exclude generated output, private keys, connection passwords, and local secret stores. A `global.json` file can constrain SDK selection for a team. It selects an SDK, not the runtime deployed to a server.\n\nNuGet package versions are separate from the SDK version. Prefer compatible, supported packages and understand why each dependency exists. In CI, restore from known feeds and build in a clean environment. Reproducibility matters because "works on my machine" often means an undeclared dependency or a different configuration.',
        },
      ],
      diagram: {
        title: 'The development loop',
        source:
          'flowchart LR\n  edit["Edit source"] --> restore["Restore packages"]\n  restore --> build["Build"]\n  build --> test["Test"]\n  test --> run["Run / debug"]\n  run --> edit',
        caption:
          'Restore is usually implicit in build and run. Publishing is a separate deployment step.',
      },
      example: {
        title: 'Create TaskFlow from the terminal',
        filename: 'setup.ps1',
        language: 'bash',
        setup:
          'Run these commands in PowerShell from a directory where you want the new project. Each command is a separate line; stop and inspect any error before continuing.',
        code: 'dotnet --info\ndotnet new console -n TaskFlow.Cli -f net10.0\ndotnet build TaskFlow.Cli\ndotnet run --project TaskFlow.Cli\ndotnet publish TaskFlow.Cli -c Release',
        output:
          'The template "Console App" was created successfully.\n...\nBuild succeeded.\n...\nHello, World!',
        explanation: [
          'The template creates a complete console project, including its project file and entry point.',
          'The project path keeps commands unambiguous without changing your current directory.',
          'The displayed output is abbreviated: SDK details, timing, and output paths depend on your machine. Publish produces files; it does not upload or start a server.',
        ],
      },
      traps: [
        {
          question: 'Does dotnet build produce the same thing as dotnet publish?',
          answer:
            'Build produces compilation outputs. Publish prepares the application and dependencies for deployment according to the selected deployment model. A build directory should not be treated as a universal deployment package.',
          warning:
            'Publishing does not automatically deploy to Azure, IIS, or a container registry.',
        },
        {
          question: 'Does global.json change the target framework?',
          answer:
            'No. global.json controls SDK selection. TargetFramework in the project file controls the framework the project targets. A newer SDK can often build older supported targets.',
          warning:
            'Do not conflate SDK version, language version, target framework, and NuGet package version.',
        },
      ],
      exercise: {
        title: 'Make a reproducible first build',
        brief: 'Create TaskFlow.Cli and explain every generated file before adding features.',
        steps: [
          'Inspect the TargetFramework, Nullable, and ImplicitUsings values.',
          'Run a Release build and locate its output.',
          'Add a breakpoint, inspect a variable, and explain the difference between building and debugging.',
        ],
        solution:
          'A successful result includes a net10.0 project, a successful build, and a running console application. Keep Program.cs and the .csproj; exclude bin and obj. You should be able to repeat the process from a clean checkout using the documented SDK.',
      },
      quiz: {
        question:
          'A teammate installed only the .NET runtime. What is missing for building TaskFlow?',
        options: [
          'A production database',
          'A browser extension',
          'The .NET SDK',
          'An Azure subscription',
        ],
        answer: 2,
        explanation:
          'The SDK includes compilers and build tools. The runtime executes already-built applications. Neither a cloud account nor a database is needed for a console application.',
      },
      references: [
        { label: 'Install .NET', url: 'https://learn.microsoft.com/en-us/dotnet/core/install/' },
        { label: '.NET CLI overview', url: 'https://learn.microsoft.com/en-us/dotnet/core/tools/' },
      ],
    },
    {
      id: 'first-csharp-program',
      title: 'Read your first C# program',
      subtitle: 'Turn unfamiliar punctuation into a sequence of understandable instructions.',
      minutes: 16,
      tags: ['syntax', 'Console', 'Main', 'top-level statements', 'using', 'variables'],
      outcomes: [
        'Read declarations, expressions, and statements.',
        'Explain the entry point and top-level statements.',
        'Separate compiler errors from runtime errors and logic errors.',
      ],
      sections: [
        {
          title: 'Start with the execution order',
          body: 'A program is a set of instructions with an entry point: the place execution begins. In a modern console template, **top-level statements** let you write those instructions without spelling out a `Program` class and a `Main` method. The compiler generates the entry-point machinery. This is still ordinary compiled C#, not a different scripting language.\n\nFor a simple program without branching, statements run from top to bottom. A semicolon normally ends a statement. Braces group a block of statements. Parentheses supply method arguments or group an expression. C# is case-sensitive: `Console` and `console` are different names.',
        },
        {
          title: 'Name values and call methods',
          body: 'A **variable** is a named place for a value. In `int completed = 2;`, `int` is the type, `completed` is the name, and `2` is the initial value. An **expression** computes a value, such as `completed + 1`. A **statement** performs an action, such as assigning that result.\n\nA **method** is a named operation. `Console.WriteLine(title)` calls WriteLine and passes the title as an argument. A method can return a value, change state, or do both. Dot notation selects a member of a type or object. The `using` directive makes names in a namespace available without writing their full qualification; it does not install packages.',
        },
        {
          title: 'Three different kinds of mistakes',
          body: '| Kind | Example | When you discover it |\n| --- | --- | --- |\n| Compiler error | Assigning text to an integer | During build |\n| Runtime exception | Parsing invalid numeric input with `int.Parse` | During execution |\n| Logic error | Counting a completed task twice | Through tests or observation |\n\nRead the first useful error message and its location, not just the final "build failed" line. Later errors may be consequences of an earlier missing brace. For a runtime exception, inspect the stack trace: it records the chain of method calls leading to the failure. Catching every exception without fixing its cause merely hides the problem.',
        },
        {
          title: 'Make the output predictable',
          body: 'The example calculates a completion percentage from two integer values. Converting the numerator to `double` before division matters. Integer division discards the fractional part: `2 / 3` is `0`, while `2.0 / 3` is approximately `0.6667`. The `P0` format displays a percentage with no decimal places.\n\nFormatting depends on culture unless you specify one. Culture defines conventions such as decimal separators and date order. For deterministic learning output, this example uses invariant culture. User-facing applications should choose formatting deliberately; an English-looking format is not automatically right for every user.',
        },
      ],
      diagram: {
        title: 'Read, calculate, display',
        source:
          'flowchart LR\n  input["Declare task counts"] --> expression["Calculate a ratio"]\n  expression --> format["Format as a percentage"]\n  format --> output["Write to console"]',
        caption:
          'A small program becomes easier to reason about when input, calculation, and output are separate steps.',
      },
      example: {
        title: 'A tiny TaskFlow summary',
        filename: 'Program.cs',
        language: 'csharp',
        setup: 'Replace Program.cs in TaskFlow.Cli. Run `dotnet run --project TaskFlow.Cli`.',
        code: 'using System.Globalization;\n\nstring projectName = "TaskFlow";\nint totalTasks = 3;\nint completedTasks = 2;\ndouble progress = (double)completedTasks / totalTasks;\n\nConsole.WriteLine(projectName);\nConsole.WriteLine($"Done: {completedTasks} of {totalTasks}");\nConsole.WriteLine(progress.ToString("P0", CultureInfo.InvariantCulture));',
        output: 'TaskFlow\nDone: 2 of 3\n67 %',
        explanation: [
          'The cast to double changes the arithmetic before division, preserving the fractional value.',
          'String interpolation substitutes values into text; it does not change the original variables.',
          'The invariant percentage pattern includes a space before the percent sign. This is formatting, not a mathematical difference.',
        ],
      },
      traps: [
        {
          question: 'Does var mean a dynamically typed variable?',
          answer:
            'No. var asks the compiler to infer a static type from the initializer. Once inferred, that type does not change. dynamic instead defers many binding checks to runtime.',
          warning: 'You cannot assign a string to var count = 3 later just because var was used.',
        },
        {
          question: 'Where is Main in a modern console project?',
          answer:
            'The compiler generates an entry point for top-level statements. Only one source file in a project can contain top-level statements, and a program has one effective entry point.',
          warning:
            'Missing an explicitly written Main is not a reason to add a second startup path.',
        },
      ],
      exercise: {
        title: 'Find the arithmetic bug',
        brief: 'Remove the double cast from the example, predict the percentage, and run it.',
        steps: [
          'Explain why integer division changes the answer.',
          'Restore the cast and try zero completed tasks.',
          'Consider zero total tasks and decide what a sensible progress rule should be.',
        ],
        solution:
          'Without the cast, 2 / 3 evaluates to integer zero before assignment to double. Restoring the cast gives approximately 0.6667. Handle totalTasks == 0 explicitly before division; for this task tracker, displaying 0% with no tasks is a reasonable documented rule.',
      },
      quiz: {
        question: 'What value is assigned by double ratio = 2 / 3;?',
        options: ['Approximately 0.6667', '0', '1', 'A compiler error'],
        answer: 1,
        explanation:
          'Both operands are integers, so integer division happens first and produces zero. Assigning that result to a double does not restore the lost fraction.',
      },
      references: [
        {
          label: 'C# program structure',
          url: 'https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/program-structure/',
        },
        {
          label: 'Top-level statements',
          url: 'https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/program-structure/top-level-statements',
        },
      ],
    },
    {
      id: 'http-fundamentals',
      title: 'How the web actually works',
      subtitle: 'Follow a request from your browser to an API and back.',
      minutes: 20,
      tags: ['HTTP', 'HTTPS', 'DNS', 'TLS', 'JSON', 'request', 'response', 'status codes'],
      outcomes: [
        'Read an HTTP request and response.',
        'Separate transport security from application security.',
        'Explain statelessness, endpoints, and JSON.',
      ],
      sections: [
        {
          title: 'A conversation with a contract',
          body: '**HTTP** is a protocol: an agreed set of rules for communication. A client sends a request, and a server sends a response. A browser is one kind of client; a mobile app or another service can also be a client. An **API**, or application programming interface, exposes operations other software can call. A web API commonly exposes those operations through HTTP endpoints.\n\nFor `https://example.com/tasks/42`, the scheme is HTTPS, the host is example.com, and the path identifies a resource. DNS usually resolves the host to an address. The client establishes a connection, including a TLS handshake for HTTPS, and exchanges HTTP messages. HTTP/3 uses QUIC instead of the TCP transport used by HTTP/1.1 and HTTP/2.',
        },
        {
          title: 'Inside the request and response',
          body: 'A request has a **method**, a target, headers, and sometimes a body. `GET /tasks/42` asks for a representation of a task. Headers carry metadata, such as `Accept: application/json`. A response has a status code, headers, and often a body. **JSON** is a text data format; it is not a C# object and it does not provide security by itself. Serialization converts an object into a transferable representation.\n\n| Status family | Meaning | TaskFlow example |\n| --- | --- | --- |\n| 2xx | Successful handling | 200 with a task; 201 after creation |\n| 3xx | Redirection or cache-related response | 304 for a valid conditional request |\n| 4xx | Request cannot be fulfilled as submitted | 400 invalid title; 404 unknown task |\n| 5xx | Server failed to fulfill a valid request | 500 unexpected server failure |',
        },
        {
          title: 'HTTP versus HTTPS',
          body: '| HTTP | HTTPS |\n| --- | --- |\n| Messages are not protected by TLS | HTTP carried over TLS |\n| Network observers can read or modify plaintext traffic | Encryption and integrity protect traffic in transit |\n| No TLS certificate identity check | Certificates help authenticate the server |\n\nHTTPS does not guarantee that the server is honest, fix SQL injection, or encrypt the database. It also does not hide all traffic metadata. Use HTTPS in production and still validate inputs, enforce authorization, and protect stored data. Local HTTP examples in this course are loopback-only learning scenarios, not production deployment advice.',
        },
        {
          title: 'Stateless does not mean no database',
          body: 'HTTP requests do not automatically remember earlier requests. A server can still store tasks in a database, or associate requests with a user through a cookie or bearer token. **Stateless HTTP** describes the protocol; **stateless application instances** describes a deployment design where an instance does not depend on local per-user session data. These are different ideas.\n\nAn endpoint is a combination of a route and behavior, usually selected using the HTTP method too. `GET /tasks` and `POST /tasks` can share a path but perform different operations. Cookies, caching, authentication, and idempotency build on this foundation in later lessons.',
        },
      ],
      diagram: {
        title: 'The request-response cycle',
        source:
          'sequenceDiagram\n  participant Client as Browser / client\n  participant API as ASP.NET Core API\n  participant DB as Database\n  Client->>API: GET /tasks/42\n  API->>DB: Query task 42\n  DB-->>API: Task data\n  API-->>Client: 200 OK + JSON',
        caption:
          'The server translates an HTTP request into application work, then returns an HTTP response.',
      },
      example: {
        title: 'Expose one HTTP endpoint',
        filename: 'Program.cs',
        language: 'csharp',
        setup:
          'Create `dotnet new web -n TaskFlow.Web -f net10.0`. Replace Program.cs and run `dotnet run --project TaskFlow.Web -- --urls http://localhost:5050`. In another PowerShell terminal call `curl.exe -i http://localhost:5050/tasks/42`.',
        code: 'var builder = WebApplication.CreateBuilder(args);\nvar app = builder.Build();\n\napp.MapGet("/tasks/{id:int}", (int id) =>\n    Results.Ok(new { Id = id, Title = "Understand HTTP", IsComplete = false }));\n\napp.Run();',
        output:
          'HTTP/1.1 200 OK\nContent-Type: application/json; charset=utf-8\n...\n{"id":42,"title":"Understand HTTP","isComplete":false}',
        explanation: [
          'MapGet registers a handler for GET requests. The integer route parameter becomes the id argument.',
          'Results.Ok produces status 200 and JSON serialization of the anonymous object.',
          'This teaching endpoint echoes any integer ID; it does not look up a real stored task. Later lessons add persistence and proper 404 handling.',
        ],
      },
      traps: [
        {
          question: 'Does HTTPS mean an API is secure?',
          answer:
            'It secures the transport with TLS. Authorization bugs, exposed secrets, unsafe queries, and malicious server behavior remain possible. Security requires multiple controls.',
          warning:
            'A valid certificate is not proof that an application has correct business authorization.',
        },
        {
          question: 'Does stateless mean the server stores nothing?',
          answer:
            'No. The server may store durable resources and user data. Statelessness means a request should not rely on an implicit protocol conversation; application instance state is a separate design choice.',
          warning: 'Do not confuse a database with in-memory session state tied to one server.',
        },
      ],
      exercise: {
        title: 'Inspect the wire contract',
        brief: 'Run the web example and inspect response headers as well as the body.',
        steps: [
          'Request /tasks/42, /tasks/100, and /tasks/not-a-number.',
          'Send a POST to /tasks/42 and compare the result.',
          'Explain why JSON property names differ in casing from the anonymous C# object.',
        ],
        solution:
          'Integer IDs match the GET route; a non-integer segment does not. POST to the known GET-only route normally produces 405 Method Not Allowed. ASP.NET Core web JSON defaults use camelCase names. Observe exact status codes with curl.exe -i instead of inferring them from a browser screen.',
      },
      quiz: {
        question: 'What does a 404 response normally communicate?',
        options: [
          'The server process is stopped',
          'The requested resource was not found or is not disclosed',
          'The request always needs a password',
          'The response body must be HTML',
        ],
        answer: 1,
        explanation:
          '404 is an HTTP response from a server, so a server did answer. It means the resource is not found or the server is not willing to disclose it. The body can use JSON, HTML, or another representation.',
      },
      references: [
        {
          label: 'HTTP overview',
          url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Overview',
        },
        {
          label: 'Minimal API tutorial',
          url: 'https://learn.microsoft.com/en-us/aspnet/core/tutorials/min-web-api?view=aspnetcore-10.0',
        },
      ],
    },
    {
      id: 'modern-and-legacy-aspnet',
      title: 'Modern .NET and the legacy landscape',
      subtitle: 'Understand old interview terminology without choosing an old stack by accident.',
      minutes: 15,
      tags: [
        '.NET Framework',
        'ASP.NET',
        'Web Forms',
        'MVC 5',
        'System.Web',
        'migration',
        'Kestrel',
      ],
      outcomes: [
        'Compare .NET Framework with modern .NET.',
        'Recognize Web Forms, MVC, Web API, Razor Pages, and Blazor.',
        'Explain why migration requires more than renaming a project.',
      ],
      sections: [
        {
          title: 'The names changed over time',
          body: '**.NET Framework** is the original Windows-focused platform. It remains relevant to existing systems. **.NET Core** was the cross-platform redesign; from version 5 onward, its successor is simply called **.NET**. ASP.NET Core keeps the word Core in its name. Version numbers across these products are not one continuous .NET Framework line.\n\nFor new general-purpose web development, start with supported modern .NET and ASP.NET Core. Do not conclude that all older technology is unsupported: .NET Framework support depends on its version and the Windows lifecycle. Equally, do not choose an out-of-support .NET Core release just because an old tutorial uses it.',
        },
        {
          title: 'Know the application models',
          body: '| Model | What it is suited to | Important distinction |\n| --- | --- | --- |\n| Classic ASP.NET Web Forms | Existing event-driven server-rendered sites | Page lifecycle, postbacks, ViewState; no direct Core version |\n| ASP.NET MVC 5 / Web API 2 | Existing .NET Framework web apps and APIs | Typically uses System.Web and different configuration |\n| ASP.NET Core MVC | Server-rendered views or controller APIs | Controller, model, and view responsibilities |\n| Razor Pages | Page-focused server-rendered UI | Page model and handlers live around a page |\n| Minimal APIs | HTTP endpoints with little ceremony | Same Core host and middleware, fewer MVC conventions |\n| Blazor | Component-based web UI in C# | Rendering and interactivity vary by render mode |\n\nMVC is an architectural pattern, not a synonym for every ASP.NET application. A controller API can use MVC infrastructure without rendering an HTML view.',
        },
        {
          title: 'Translate legacy interview language',
          body: 'In Web Forms, **ViewState** carries page/control state across postbacks, generally in a hidden form field. It is not the same as Session, and it is not a database. The page lifecycle includes stages such as initialization, load, event handling, and rendering. Classic modules and handlers operate in the System.Web request pipeline.\n\nIn ASP.NET Core, middleware forms the request pipeline. Dependency injection is built in, startup usually lives in Program.cs, and configuration comes from multiple providers. **Kestrel** is the cross-platform web server. IIS can host or reverse-proxy ASP.NET Core; Core is not restricted to IIS or Windows. These are changed abstractions, not simple renamings.',
        },
        {
          title: 'Plan migration around behavior',
          body: 'Inventory dependencies, authentication, session behavior, hosting, file access, and integration contracts. Some libraries target .NET Standard and work on both platforms; others depend on Windows or System.Web. .NET Standard is an API specification for library compatibility, not a runtime to install.\n\nA sensible migration first protects observable behavior with tests. Then move a small boundary, check compatibility, and measure. Large systems may need an incremental replacement strategy. Avoid rewriting every layer at once simply to adopt a fashionable architecture. Later chapters revisit migration, deployment, and the tradeoffs between modern language features.',
        },
      ],
      diagram: {
        title: 'Two related platform families',
        source:
          'flowchart TB\n  language["C# language"] --> legacy[".NET Framework / Windows"]\n  language --> modern["Modern .NET / cross-platform"]\n  legacy --> oldweb["Web Forms / MVC 5 / Web API 2"]\n  modern --> core["ASP.NET Core"]\n  core --> models["Minimal APIs / MVC / Razor Pages / Blazor"]',
        caption:
          'The platform and framework families overlap conceptually, but their hosting and API contracts differ.',
      },
      example: {
        title: 'Recognize a modern project',
        filename: 'TaskFlow.Web.csproj',
        language: 'xml',
        setup:
          'Inspect the XML project file created by `dotnet new web -n TaskFlow.Web -f net10.0`. This is the complete minimal project configuration.',
        code: '<Project Sdk="Microsoft.NET.Sdk.Web">\n  <PropertyGroup>\n    <TargetFramework>net10.0</TargetFramework>\n    <Nullable>enable</Nullable>\n    <ImplicitUsings>enable</ImplicitUsings>\n  </PropertyGroup>\n</Project>',
        explanation: [
          'The Web SDK selects build behavior for an ASP.NET Core project. A console app uses Microsoft.NET.Sdk instead.',
          'net10.0 targets modern .NET 10. A classic .NET Framework target would look like net48 or net481.',
          'Changing only TargetFramework cannot make a System.Web application compatible with ASP.NET Core. Its framework dependencies and behavior must be assessed.',
        ],
      },
      traps: [
        {
          question: 'Is ASP.NET Core just ASP.NET MVC 5 with a newer version number?',
          answer:
            'No. Core has a different hosting model, request pipeline, configuration system, and platform support. Familiar concepts remain, but System.Web APIs are not simply available in Core.',
          warning: 'Do not propose a target-framework edit as a complete Web Forms migration.',
        },
        {
          question: 'Is .NET Standard another runtime?',
          answer:
            'No. It defines a set of APIs that compatible implementations provide. It helped libraries share code across .NET implementations. New applications normally target an actual modern .NET version.',
          warning:
            'A package targeting .NET Standard can still have practical platform constraints in its dependencies or behavior.',
        },
      ],
      exercise: {
        title: 'Choose the right starting point',
        brief:
          'Your team needs a new Linux-hosted JSON API and also maintains an old Web Forms portal.',
        steps: [
          'Choose a platform and application model for the new API.',
          'List three things to investigate before migrating the portal.',
          'Explain why Web Forms ViewState does not carry over to a Minimal API.',
        ],
        solution:
          'Use a supported modern .NET release with ASP.NET Core, choosing Minimal APIs or controllers based on the team and endpoint complexity. Inspect System.Web dependencies, identity/session behavior, and page/control lifecycle assumptions for the portal. An API has no Web Forms page lifecycle or automatic ViewState model.',
      },
      quiz: {
        question: 'Which statement about ASP.NET Core is correct?',
        options: [
          'It requires Windows and IIS',
          'It includes Web Forms unchanged',
          'It can run on Linux with Kestrel',
          'It is a replacement name for the C# language',
        ],
        answer: 2,
        explanation:
          'ASP.NET Core is cross-platform and uses Kestrel as its default web server. IIS remains an available hosting option, but is not required. Web Forms is a classic ASP.NET technology.',
      },
      references: [
        {
          label: 'Choose between .NET and .NET Framework',
          url: 'https://learn.microsoft.com/en-us/dotnet/standard/choosing-core-framework-server',
        },
        {
          label: 'ASP.NET Core overview',
          url: 'https://learn.microsoft.com/en-us/aspnet/core/introduction-to-aspnet-core?view=aspnetcore-10.0',
        },
      ],
    },
  ],
}
