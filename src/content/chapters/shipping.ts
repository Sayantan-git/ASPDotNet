import type { Chapter } from '../types'

export const shipping: Chapter = {
  id: 'shipping',
  title: 'Ship & prepare for interviews',
  description: 'Deploy with confidence and demonstrate what you can build and explain.',
  level: 'Advanced',
  accent: 'coral',
  lessons: [
    {
      id: 'containers-and-ci',
      title: 'Containers & continuous integration',
      subtitle: 'Turn a clean checkout into a repeatable, tested deployment artifact.',
      minutes: 30,
      tags: [
        'Docker',
        'CI',
        'GitHub Actions',
        'container',
        'image',
        'non-root',
        'artifact',
        'supply chain',
      ],
      outcomes: [
        'Explain images, containers, and multi-stage builds.',
        'Build and test from a clean environment.',
        'Keep secrets and durable data outside disposable images.',
      ],
      sections: [
        {
          title: 'An image packages a process environment',
          body: 'A container image contains application files and the runtime environment needed by a process. A container is a running instance with isolation provided by the host. It is not a complete virtual machine and does not automatically make an insecure application safe. Containers share a host kernel according to the platform model.\n\nA multi-stage Docker build uses an SDK image to restore, compile, and publish, then copies only runtime output into a smaller runtime image. This reduces the final footprint and separates build tools from execution. Pin and update base images through a reviewed policy; a permanently pinned vulnerable image is not a security strategy.',
        },
        {
          title: 'Keep the runtime disposable',
          body: 'Run with a non-root identity when possible, grant only required filesystem permissions, and configure the listening port explicitly. Do not bake passwords or private keys into image layers or build arguments that can appear in history. Inject runtime configuration through the hosting platform and a suitable secret mechanism.\n\nThe container writable layer is not a durable database backup. SQLite demos need a writable persistent volume when data must survive replacement; production may use a managed relational database instead. Logs should normally go to standard output/error for collection. Health checks and graceful shutdown still need application and platform configuration.',
        },
        {
          title: 'CI establishes a reproducible gate',
          body: 'Continuous integration runs restore, build, and tests on a clean checkout. It catches missing files, undeclared dependencies, and environment assumptions. Use a supported SDK, dependency caching with correct lock/configuration inputs, and explicit permissions for automation credentials. Do not expose secrets to untrusted pull-request code.\n\nBuild once and promote the tested artifact through environments where practical. A green build is not proof of authorization, migration safety, or operational recovery unless those checks are actually included. Separate the static learning website deployment from the ASP.NET Core server deployment: GitHub Pages serves files, not a running .NET API.',
        },
      ],
      diagram: {
        title: 'Build once, test, publish',
        source:
          'flowchart LR\n  commit["Clean source checkout"] --> restore["Restore dependencies"]\n  restore --> build["Build + test"]\n  build --> artifact["Versioned artifact / image"]\n  artifact --> deploy["Deploy and smoke test"]',
        caption:
          'The artifact should be traceable to source and test results. Static Pages hosting and API hosting are separate targets.',
      },
      example: {
        title: 'A non-root TaskFlow container',
        filename: 'Dockerfile',
        language: 'docker',
        setup:
          'Illustrative Dockerfile for the bundled TaskFlow.Api. Use the API project directory as build context. Its Tasks connection string must be configuration-driven. Mount a writable persistent volume at /data when retaining SQLite data.',
        code: 'FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build\nWORKDIR /src\nCOPY *.csproj ./\nRUN dotnet restore\nCOPY . .\nRUN dotnet publish -c Release -o /out --no-restore\n\nFROM mcr.microsoft.com/dotnet/aspnet:10.0\nWORKDIR /app\nCOPY --from=build /out .\nRUN mkdir /data\nRUN chown $APP_UID /data\nENV ASPNETCORE_HTTP_PORTS=8080\nENV ConnectionStrings__Tasks="Data Source=/data/taskflow.db"\nUSER $APP_UID\nEXPOSE 8080\nENTRYPOINT ["dotnet", "TaskFlow.Api.dll"]',
        explanation: [
          'Only published output reaches the runtime stage.',
          'The non-root process has a specifically writable data directory rather than broad filesystem permissions.',
          'The sample uses a demo schema strategy; production still needs reviewed migrations, backups, HTTPS termination, authentication, and a patched image policy.',
        ],
      },
      traps: [
        {
          question: 'Can GitHub Pages host an ASP.NET Core server process?',
          answer:
            'No. Pages is static file hosting. It can host this learning application, while an ASP.NET Core API needs a server, container platform, or suitable managed app host.',
          warning: 'Uploading a DLL to a static host does not execute it.',
        },
        {
          question: 'Does a container image safely store a secret if the final file is deleted?',
          answer:
            'Not necessarily. Secrets can remain in earlier layers, build history, or caches. Keep them out of images and use supported secret injection mechanisms.',
          warning: 'Layered build history changes the meaning of deleting a file later.',
        },
      ],
      exercise: {
        title: 'Define a clean build gate',
        brief: 'Write a CI workflow that verifies TaskFlow before producing a release artifact.',
        steps: [
          'Install a supported .NET SDK and restore.',
          'Build Release and run tests with the intended configuration.',
          'Publish an artifact only after successful checks and keep deployment secrets out of pull-request jobs.',
        ],
        solution:
          'Use a clean checkout, explicit SDK setup, restore, Release build, tests, and then publish. Verify package and project paths, isolate test data, and give workflow tokens the least required permissions. Add migration and deployment smoke checks where those risks apply.',
      },
      quiz: {
        question: 'Why use separate SDK and runtime container stages?',
        options: [
          'To hide unvalidated tokens',
          'To keep build tooling out of the final runtime image',
          'To make every database transaction distributed',
          'To avoid patching the runtime',
        ],
        answer: 1,
        explanation:
          'A multi-stage build compiles with the SDK and ships a smaller runtime-oriented artifact. It does not eliminate security updates or application configuration requirements.',
      },
      references: [
        {
          label: 'Containerize a .NET app',
          url: 'https://learn.microsoft.com/en-us/dotnet/core/docker/build-container',
        },
        {
          label: 'GitHub Actions for .NET',
          url: 'https://docs.github.com/en/actions/use-cases-and-examples/building-and-testing/building-and-testing-net',
        },
      ],
    },
    {
      id: 'deployment-and-hosting',
      title: 'Deploy to Azure, IIS or Linux',
      subtitle: 'Separate publishing files from running and operating a service.',
      minutes: 30,
      tags: [
        'Azure',
        'IIS',
        'Linux',
        'Kestrel',
        'reverse proxy',
        'publish',
        'framework-dependent',
        'self-contained',
        'TLS',
      ],
      outcomes: [
        'Compare deployment models and host choices.',
        'Understand proxy headers and HTTPS termination.',
        'Plan configuration, storage, and schema compatibility.',
      ],
      sections: [
        {
          title: 'Publishing produces files, not an operating service',
          body: "A framework-dependent deployment expects a compatible .NET/ASP.NET Core runtime on the host. A self-contained deployment includes the runtime for a selected target platform, increasing artifact size and making runtime updates part of your republish process. Native AOT is another option with compatibility constraints, not simply a smaller switch for every existing application.\n\nChoose Azure App Service, a container platform, IIS, or Linux with a process manager based on the team's operational needs. IIS may require the appropriate hosting bundle and application-pool configuration. Linux hosting commonly pairs Kestrel with a reverse proxy and systemd or a container orchestrator.",
        },
        {
          title: 'The network path affects application behavior',
          body: 'A reverse proxy may terminate HTTPS and forward HTTP internally. The app needs trusted forwarded-header configuration to reconstruct the original scheme and client information where required. Trust only known proxies/networks; blindly accepting forwarded headers from arbitrary clients can allow spoofing and security mistakes.\n\nIncorrect scheme handling can cause redirect loops, insecure cookie behavior, or wrong absolute links. Configure HTTPS, certificates, HSTS where appropriate, request size limits, and timeouts at the relevant layers. Development certificates are not production certificate management.',
        },
        {
          title: 'Deploy compatible code and data',
          body: 'Inject environment-specific configuration and secrets without rebuilding source for every environment. Verify writable paths, persistent storage, connection permissions, and outbound dependencies. A process that starts but cannot write its database or decrypt its cookies is not a successful deployment.\n\nSchema changes should support the deployment strategy. Rolling deployments may run old and new application versions simultaneously, so use expand-and-contract changes where needed: add compatible structure, migrate behavior/data, then remove obsolete structure later. Test rollback assumptions. Rolling back the application binary cannot necessarily reverse a destructive database migration.',
        },
      ],
      diagram: {
        title: 'The hosted request path',
        source:
          'flowchart LR\n  internet["Client over HTTPS"] --> proxy["Trusted TLS proxy / host"]\n  proxy --> kestrel["Kestrel / app process"]\n  kestrel --> config["Runtime configuration"]\n  kestrel --> storage["Persistent database / files"]',
        caption:
          'Correct proxy trust, process supervision, runtime availability, and storage permissions are part of hosting.',
      },
      example: {
        title: 'Publish a framework-dependent build',
        filename: 'publish.ps1',
        language: 'bash',
        setup:
          'Run from this repository root after installing the .NET 10 SDK. These commands publish and run locally; they do not provision Azure or IIS. Stop on any failed command.',
        code: 'dotnet test examples/TaskFlow.Api.Tests -c Release\ndotnet publish examples/TaskFlow.Api -c Release --self-contained false -o artifacts/taskflow-api\ndotnet artifacts/taskflow-api/TaskFlow.Api.dll --urls http://localhost:5050',
        output:
          'A published local ASP.NET Core process, provided a compatible runtime and valid configuration are available.',
        explanation: [
          'The published artifact uses a compatible installed runtime.',
          'The local loopback HTTP URL is for verification, not a complete production HTTPS configuration.',
          'Use a service manager or platform runtime in production; an unattended terminal is not process supervision.',
        ],
      },
      traps: [
        {
          question: 'Does self-contained mean no runtime security updates are needed?',
          answer:
            'No. The runtime is bundled, so you must rebuild and redeploy with patched runtime content. It changes ownership of updating, not the need to update.',
          warning: 'An old self-contained artifact can keep running an old vulnerable runtime.',
        },
        {
          question: 'Can every migration be undone by rolling back the app image?',
          answer:
            'No. Database state persists independently, and destructive schema/data changes may be irreversible without a restore or forward repair.',
          warning: 'Deployment rollback and data recovery need separate plans.',
        },
      ],
      exercise: {
        title: 'Prepare a deployment checklist',
        brief: 'Deploy TaskFlow behind a TLS-terminating reverse proxy.',
        steps: [
          'Verify trusted forwarded headers and secure redirects.',
          'Test database permissions and persistent storage.',
          'Run health, create/read, and unauthorized-access smoke tests against the deployed URL.',
        ],
        solution:
          'Check the full public request path, not just localhost. Ensure only trusted proxies influence forwarded data, the process is supervised, data survives replacement, and secrets are injected securely. Test the real authentication and storage configuration before routing normal users to the release.',
      },
      quiz: {
        question: 'Who must ship patched runtime bits for a self-contained app?',
        options: [
          'Nobody, because it is self-contained',
          'The application release process',
          'Only the browser vendor',
          'The source-control server automatically',
        ],
        answer: 1,
        explanation:
          'Self-contained deployment bundles the runtime with the app. Updating that runtime normally requires publishing and deploying a new artifact containing the patched version.',
      },
      references: [
        {
          label: 'ASP.NET Core hosting',
          url: 'https://learn.microsoft.com/en-us/aspnet/core/host-and-deploy/?view=aspnetcore-10.0',
        },
        {
          label: '.NET deployment models',
          url: 'https://learn.microsoft.com/en-us/dotnet/core/deploying/',
        },
      ],
    },
    {
      id: 'production-operations',
      title: 'Health checks, recovery & production readiness',
      subtitle: 'Plan how the service fails, restarts, and recovers before you need the plan.',
      minutes: 30,
      tags: [
        'health checks',
        'liveness',
        'readiness',
        'backup',
        'recovery',
        'graceful shutdown',
        'SLO',
        'incident',
      ],
      outcomes: [
        'Distinguish liveness from readiness.',
        'Define safe health output and probe behavior.',
        'Verify backup, restore, and incident procedures.',
      ],
      sections: [
        {
          title: 'Different probes answer different questions',
          body: 'Liveness asks whether the process is functioning enough that restarting it might help. Readiness asks whether it should receive normal traffic. A database dependency failure might make an instance unready without implying that endlessly restarting the process will fix the database. A startup probe can allow initialization time before normal probe expectations apply.\n\nAvoid health probes that perform destructive or expensive work. Choose timeouts and failure thresholds appropriate to the platform. Do not expose connection strings, exception traces, or detailed internal topology to unauthenticated callers. Operational detail belongs in a protected endpoint or telemetry system.',
        },
        {
          title: 'An operational plan needs evidence',
          body: 'Monitor successful-request rate, latency, saturation, and critical dependency health. Alert on actionable user-impacting symptoms with a clear owner and runbook. A runbook describes how to investigate and recover a specific class of failure, including checks that confirm recovery. Too many noisy alerts teach people to ignore the important one.\n\nTest backup restoration into an isolated environment and verify both data integrity and the time required. Include keys, configuration, schema versions, and dependent storage in the recovery plan. A database restored without the required encryption keys may be unusable.',
        },
        {
          title: 'Prepare for restarts and imperfect shutdown',
          body: 'Stop accepting new work when appropriate, cancel or drain in-flight operations within a budget, and keep durable jobs retryable. The platform can still terminate the process abruptly. Important business data must not depend on finalizers or a last-moment shutdown write.\n\nRelease readiness includes supported runtime patches, least privilege, secret rotation, dependency review, tested migrations, authorization checks, error handling, logging privacy, and a rollback or roll-forward plan. Record residual risks honestly. No checklist guarantees the absence of defects, but it can make important assumptions visible and testable.',
        },
      ],
      diagram: {
        title: 'Readiness and liveness are different',
        source:
          'flowchart TB\n  host["Running host"] --> live["Liveness: process functioning?"]\n  host --> ready["Readiness: safe to receive traffic?"]\n  ready --> dependency["Required dependency checks"]\n  live --> restart["Restart only when useful"]\n  ready --> traffic["Traffic routing decision"]',
        caption:
          'A dependency outage should not automatically trigger a restart storm across every healthy application process.',
      },
      example: {
        title: 'Expose a minimal process health endpoint',
        filename: 'Program.cs',
        language: 'csharp',
        setup:
          'Complete web example. This built-in check reports host health only; it deliberately does not claim to verify database readiness.',
        code: 'var builder = WebApplication.CreateBuilder(args);\nbuilder.Services.AddHealthChecks();\nvar app = builder.Build();\n\napp.MapHealthChecks("/health/live");\napp.MapGet("/", () => Results.Ok(new { service = "TaskFlow" }));\n\napp.Run();',
        output:
          '/health/live normally returns 200 with Healthy while this host can serve the check.',
        explanation: [
          'No custom dependency checks are registered, so this is not a database readiness proof.',
          'Use tagged or separate checks for readiness when required dependencies must be verified.',
          'Keep detailed diagnostics protected and avoid making the probe itself an expensive workload.',
        ],
      },
      traps: [
        {
          question: 'Should a database outage always fail liveness?',
          answer:
            'Not necessarily. Restarting the application may not fix the external database and can create a restart storm. Readiness is often the better place for required dependency status.',
          warning: 'Probe design influences platform behavior, not only a dashboard color.',
        },
        {
          question: 'Is a backup successful if the file exists?',
          answer:
            'That is insufficient. Test restoration, integrity, key availability, schema compatibility, and recovery time. A backup has value when it can support the required recovery.',
          warning: 'Untested recovery assumptions often fail during an incident.',
        },
      ],
      exercise: {
        title: 'Rehearse a recovery',
        brief:
          'In an isolated environment, restore TaskFlow data and start a compatible application build.',
        steps: [
          'Measure restoration time and identify the recovery point.',
          'Verify representative task and ownership data.',
          'Check keys, configuration, and readiness before declaring recovery.',
        ],
        solution:
          'Compare the rehearsal against the documented RPO and RTO. Validate application-level data and access behavior, not only database startup. Record missing dependencies and update the runbook. Do not test destructive recovery procedures against a live production database.',
      },
      quiz: {
        question: 'What does readiness primarily decide?',
        options: [
          'Whether source code compiles',
          'Whether an instance should receive normal traffic',
          'Whether a password is long enough',
          'Whether an IDE is installed',
        ],
        answer: 1,
        explanation:
          "Readiness informs traffic routing based on the instance's ability to serve its required workload. It differs from liveness, which guides whether restarting the process may help.",
      },
      references: [
        {
          label: 'ASP.NET Core health checks',
          url: 'https://learn.microsoft.com/en-us/aspnet/core/host-and-deploy/health-checks?view=aspnetcore-10.0',
        },
        {
          label: 'Reliability design',
          url: 'https://learn.microsoft.com/en-us/azure/well-architected/reliability/',
        },
      ],
    },
    {
      id: 'modern-csharp-and-migration',
      title: 'Modern C#, compatibility & migration',
      subtitle:
        'Adopt useful language features without losing track of runtime and deployment constraints.',
      minutes: 28,
      tags: [
        'C# 14',
        'field',
        'extension members',
        'primary constructors',
        'collection expressions',
        'AOT',
        'reflection',
        'source generators',
        'migration',
      ],
      outcomes: [
        'Distinguish language, SDK, runtime, and library versions.',
        'Recognize modern language features and their tradeoffs.',
        'Plan incremental migration from legacy applications.',
      ],
      sections: [
        {
          title: 'Version numbers describe different contracts',
          body: 'The SDK contains compiler and build tools. TargetFramework controls the target framework API surface. The runtime executes the built app. NuGet packages have their own versions. C# language features may be primarily compiler syntax or may require runtime/library support. Do not assume setting LangVersion to latest makes every old target support every new feature.\n\nThis course uses .NET 10 and C# 14 as its baseline. Use supported servicing patches and stable SDK selection in CI. Avoid depending on preview features accidentally. Older examples using Startup, System.Web, or unsupported runtimes should be translated with their original hosting model in mind.',
        },
        {
          title: 'Use modern syntax when it clarifies intent',
          body: 'Collection expressions simplify construction when a target type is known. Primary constructors reduce constructor ceremony, but ordinary class primary-constructor parameters do not automatically become public properties the way positional record parameters do. Pattern matching can clarify branching. Required and init improve construction contracts without replacing validation.\n\nC# 14 adds features including extension members and field-backed property syntax. The field keyword lets a property accessor use compiler-provided backing storage while another accessor can remain automatic. These conveniences should reduce noise, not hide expensive work or unclear ownership. Recognize the older equivalent so you can read existing codebases and explain the semantics.',
        },
        {
          title: 'Compatibility includes runtime behavior',
          body: 'Reflection inspects types and members at runtime. Attributes provide metadata that frameworks can inspect. Source generators produce code during compilation. Trimming and Native AOT can remove or constrain dynamically discovered behavior, so libraries may need annotations or generated alternatives such as source-generated serialization. A normal JIT build passing does not prove an AOT publish is compatible.\n\nFor legacy migration, inventory System.Web, authentication, session, Windows-only APIs, configuration, and third-party dependencies. Protect behavior with tests, move a bounded slice, and compare results. Incremental replacement can reduce risk. Do not use a framework upgrade as an excuse for an unrelated complete architecture rewrite.',
        },
      ],
      diagram: {
        title: 'Compatibility has several layers',
        source:
          'flowchart LR\n  sdk["SDK / compiler"] --> language["C# syntax and semantics"]\n  language --> target["Target framework APIs"]\n  target --> runtime["Runtime / platform"]\n  runtime --> deployment["JIT / trimming / AOT deployment"]',
        caption:
          'A language feature, package API, and deployment capability do not become compatible merely because their version numbers look similar.',
      },
      example: {
        title: 'A C# 14 field-backed property',
        filename: 'Program.cs',
        language: 'csharp',
        setup:
          'Complete .NET 10 / C# 14 console example. Older language versions need an explicit private backing field instead of the field keyword.',
        code: 'var title = new TaskTitle();\ntitle.Value = "  Learn modern C#  ";\nConsole.WriteLine(title.Value);\n\npublic sealed class TaskTitle\n{\n    public string Value\n    {\n        get;\n        set\n        {\n            ArgumentException.ThrowIfNullOrWhiteSpace(value);\n            field = value.Trim();\n        }\n    } = "Untitled";\n}',
        output: 'Learn modern C#',
        explanation: [
          'The getter uses compiler-provided storage while the setter validates and normalizes before assigning it.',
          'The initial value establishes a valid state before the first external assignment.',
          'This is a language convenience, not automatic thread safety, persistence, or deep immutability.',
        ],
      },
      traps: [
        {
          question:
            'Do ordinary primary-constructor parameters automatically become public properties?',
          answer:
            'No. Ordinary classes and structs do not get the same positional-property generation as records. Parameters are available according to primary-constructor rules, but public members must be declared when needed.',
          warning: 'Similar syntax can have different generated members across type kinds.',
        },
        {
          question: 'Does a successful normal build prove Native AOT compatibility?',
          answer:
            'No. Reflection, dynamic code generation, trimming, and library support can behave differently during AOT publication. Use the actual publish mode and address its diagnostics.',
          warning:
            'Do not suppress trimming warnings without understanding the missing-runtime-behavior risk.',
        },
      ],
      exercise: {
        title: 'Translate rather than blindly upgrade',
        brief: 'A legacy API uses Startup, System.Web session, and a Windows-only library.',
        steps: [
          'Separate syntax changes from framework dependencies.',
          'Identify a migration boundary protected by HTTP behavior tests.',
          'Decide which dependencies must be replaced, isolated, or kept temporarily.',
        ],
        solution:
          'Startup-to-Program restructuring is only one part. System.Web session and Windows-specific integrations need architectural and hosting decisions. Migrate a small verified behavior boundary, preserve contracts, and test the target deployment environment. A target-framework edit alone cannot resolve incompatible APIs.',
      },
      quiz: {
        question: 'What does TargetFramework primarily select?',
        options: [
          'The color theme of the editor',
          'The framework API surface the project targets',
          'The production database password',
          'The Git branch name',
        ],
        answer: 1,
        explanation:
          'TargetFramework identifies the framework contract for compilation and compatibility. SDK selection, language version, package versions, and production configuration are related but distinct choices.',
      },
      references: [
        {
          label: 'What is new in C# 14',
          url: 'https://learn.microsoft.com/en-us/dotnet/csharp/whats-new/csharp-14',
        },
        {
          label: 'Native AOT deployment',
          url: 'https://learn.microsoft.com/en-us/dotnet/core/deploying/native-aot/',
        },
        {
          label: 'Migrate to ASP.NET Core',
          url: 'https://learn.microsoft.com/en-us/aspnet/core/migration/?view=aspnetcore-10.0',
        },
      ],
    },
    {
      id: 'capstone-and-interviews',
      title: 'Capstone & interview readiness',
      subtitle: 'Turn the concepts into a working system and a clear explanation of its tradeoffs.',
      minutes: 40,
      tags: [
        'capstone',
        'interview',
        'TaskFlow',
        'revision',
        'tradeoffs',
        'portfolio',
        'readiness',
      ],
      outcomes: [
        'Demonstrate an end-to-end task workflow.',
        'Explain failure and security behavior without memorized slogans.',
        'Identify evidence gaps before a technical interview.',
      ],
      sections: [
        {
          title: 'Build one coherent application',
          body: 'Start with TaskFlow CLI to model tasks and validate input. Grow it into a persistent HTTP API with create, list, read, update, and delete operations, then add identity, ownership, and concurrency rules. Write tests that exercise both successful and rejected operations. Finally, publish the application and verify its real hosting path.\n\nThe bundled API is a runnable learning baseline, not a production-certified product. Its intentionally small public local endpoints let you study persistence and HTTP first. The project milestones guide the additional authentication, authorization, migration, observability, and deployment work. Do not expose an unfinished learning API with real private data.',
        },
        {
          title: 'Explain a request end to end',
          body: 'Practice a two-minute walkthrough: the client sends HTTPS, the host accepts the request, middleware establishes identity and checks relevant policies, routing and binding select the operation, the application validates input and ownership, EF Core executes a bounded query or transaction, and the server returns a documented response. Mention cancellation and telemetry where they affect behavior.\n\nThen explain what changes on a bad path: invalid JSON, a blank title, another owner\'s ID, a stale version, a database timeout, or a client retry. Strong answers connect the mechanism to the failure it prevents. Saying "we use DI, JWT, and clean architecture" is weaker than explaining their actual lifetimes, trust boundaries, and tradeoffs.',
        },
        {
          title: 'Use evidence, not completion badges',
          body: 'A useful readiness review includes writing a small C# function without copying, predicting a middleware trace, explaining reference copying, fixing an async blocking path, reading generated SQL, and designing a cross-user authorization test. Review questions you missed and explain why the tempting wrong answer is wrong.\n\nCourse progress and quiz results are learning signals, not a certification or guarantee of interview success. Specialize further for the role: advanced SQL tuning, gRPC, GraphQL, Azure services, Kubernetes, deep Blazor, legacy Web Forms, or domain-specific architecture may need dedicated study. Keep using official documentation and build unfamiliar examples yourself. The goal is the ability to reason and verify, not to claim you have memorized everything.',
        },
      ],
      diagram: {
        title: 'Build, verify, explain',
        source:
          'flowchart LR\n  cli["CLI: C# rules"] --> api["API: HTTP + persistence"]\n  api --> security["Identity + ownership"]\n  security --> quality["Tests + telemetry"]\n  quality --> deployment["Deploy + recovery"]\n  deployment --> explain["Explain decisions and tradeoffs"]',
        caption:
          'Each stage should produce working behavior and evidence. Reading alone cannot establish production readiness.',
      },
      example: {
        title: 'Run the capstone baseline checks',
        filename: 'verify-taskflow.ps1',
        language: 'bash',
        setup:
          'Run from this repository root with the .NET 10 SDK installed. Stop on a failed command and inspect its output. The commands verify the bundled API baseline, not the optional production milestones.',
        code: 'dotnet restore examples/TaskFlow.Api.Tests\ndotnet build examples/TaskFlow.Api.Tests -c Release --no-restore\ndotnet test examples/TaskFlow.Api.Tests -c Release --no-build\ndotnet run --project examples/TaskFlow.Api -- --urls http://localhost:5050',
        output:
          'A successful build and test run, followed by the local TaskFlow API. Stop the server with Ctrl+C when finished.',
        explanation: [
          'The test project references the API, so building it verifies both projects.',
          'Run and inspect actual test results; do not treat this expected-outcome text as a test report.',
          'The production project checklist adds requirements beyond this intentionally small local starter.',
        ],
      },
      traps: [
        {
          question: 'Does completing every lesson prove production readiness?',
          answer:
            'No. You need hands-on implementation, negative tests, deployment experience, and the ability to explain tradeoffs. Progress is a study record, not an independent assessment.',
          warning: 'Be precise about what you have built and what you have only read.',
        },
        {
          question: 'What should you do when an interview question lacks key requirements?',
          answer:
            'Ask focused questions or state reasonable assumptions, then explain how the design changes under different constraints. Do not pretend one solution is universally correct.',
          warning: 'A confident slogan is not a substitute for a defensible technical argument.',
        },
      ],
      exercise: {
        title: 'Run your own technical review',
        brief: 'Demonstrate TaskFlow to someone who can ask why each design choice exists.',
        steps: [
          'Show one complete create-read-update-delete workflow and a rejected invalid input.',
          'Demonstrate an authorization or concurrency test you added.',
          'Explain one measured bottleneck and one deployment recovery procedure.',
          'List remaining gaps honestly and choose the next focused study topic.',
        ],
        solution:
          'A strong review combines working behavior, passing relevant tests, and clear limitations. The baseline alone is not enough for production. Complete and verify the security and operational milestones, explain why the tempting shortcuts fail, and continue targeted practice on weak areas.',
      },
      quiz: {
        question: 'Which is the strongest evidence that task ownership is enforced?',
        options: [
          'The Delete button is hidden for other users',
          'A JWT exists in the browser',
          'A server integration test rejects a cross-user update and verifies unchanged data',
          'Every lesson has a completion checkmark',
        ],
        answer: 2,
        explanation:
          'The test exercises the trusted boundary and confirms no unauthorized write occurred. UI state, token presence, and course completion do not prove object-level authorization.',
      },
      references: [
        {
          label: 'ASP.NET Core documentation',
          url: 'https://learn.microsoft.com/en-us/aspnet/core/?view=aspnetcore-10.0',
        },
        { label: 'C# documentation', url: 'https://learn.microsoft.com/en-us/dotnet/csharp/' },
        {
          label: '.NET architecture guides',
          url: 'https://learn.microsoft.com/en-us/dotnet/architecture/',
        },
      ],
    },
  ],
}
