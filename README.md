# .NET Atlas

A self-paced C# and ASP.NET Core learning workspace. Start with the language and the web, then build toward secure APIs, persistence, testing, architecture, and deployment.

**60 lessons | 12 chapters | 64 diagrams | 60 knowledge checks | 127 interview pitfalls | 3 project paths**

The curriculum targets **.NET 10 LTS and C# 14**. Explanations use plain English without dropping the technical distinctions that matter. Each lesson includes concepts, a diagram, an example with setup instructions, a walkthrough, interview traps, an exercise with a reference approach, a quiz, and further reading.

## Run the Learning App

Prerequisites: Node.js **20.19+** or a supported newer LTS release, and npm. Node 22 is used in CI. The learning website itself does not require a .NET installation.

```powershell
npm ci
npm run dev
```

Open the URL printed by Vite, normally `http://localhost:5173`. The first screen is the first lesson, or your most recently opened lesson on this browser. The starter ZIP is generated automatically before development and production builds.

## Inside the Workspace

- **Learning path:** searchable, filterable chapters from beginner to advanced.
- **Lesson reader:** concept notes, Mermaid diagrams, highlighted main and supplementary examples, copy/download controls, exercises, and quizzes.
- **Practice room:** randomized quiz sessions, interview flashcards, an HTTP sandbox, and a reorderable middleware model.
- **Project workbench:** a CLI, an API, and production-oriented extension milestones.
- **Notebook:** editable lesson notes, bookmarks, progress export, and validated backup restore.
- **Reference shelf:** official sources, a glossary, quick revision, six interview scenarios, a page-linked PDF review, and deeper specialist paths.

Progress is stored in `localStorage` on the current browser origin. It has no account or cloud synchronization. Same-origin tabs receive storage updates; simultaneous edits use last-write-wins behavior, not collaborative merging. Browser storage may be cleared, disabled, or quota-limited. Export a backup to move data between devices or domains. Notes and exports are plaintext: **do not store credentials or sensitive personal data**.

## Curriculum

| Chapter                                | Focus                                                                            |
| -------------------------------------- | -------------------------------------------------------------------------------- |
| 01. .NET foundations                   | Language/platform/framework distinctions, setup, HTTP, modern and legacy ASP.NET |
| 02. The C# essentials                  | Types, control flow, methods, nullability, collections, generics                 |
| 03. Objects & good design              | Encapsulation, interfaces, polymorphism, records, SOLID, delegates and events    |
| 04. C# in the real world               | LINQ, exceptions, async/await, cancellation, concurrency, disposal               |
| 05. ASP.NET Core fundamentals          | Hosting, configuration, routing, middleware, DI, validation                      |
| 06. Build better APIs                  | Controllers, REST semantics, pagination, OpenAPI, caching, rate limiting         |
| 07. SQL & EF Core                      | Relational modeling, migrations, query performance, transactions, concurrency    |
| 08. Security by design                 | Identity, JWT/OIDC, ownership, CORS/CSRF/XSS, secret handling                    |
| 09. MVC, Razor & Blazor                | Server rendering, render modes, forms, SignalR, accessibility, localization      |
| 10. Test, debug & observe              | Unit/integration tests, diagnostics, logs, metrics, traces, benchmarks           |
| 11. Architecture & distributed systems | CQRS, modules, jobs, resilience, caching, outbox, system design                  |
| 12. Ship & prepare for interviews      | Containers, CI, hosting, recovery, modern C#, migration, capstone                |

The study-time figures are estimates including guided practice, not measured reading times. A broad core course cannot cover every specialization in the ecosystem. The reference shelf explicitly separates further study such as gRPC, GraphQL, Aspire, advanced Blazor, and SQL tuning. Completion marks, quiz scores, and flashcard ratings are study aids, **not a certification or guarantee of interview readiness**.

## Run the Real C# Examples

Install the **.NET 10 SDK** first. See [examples/README.md](examples/README.md) for complete setup, HTTP examples, and boundaries.

```powershell
dotnet run --project examples/TaskFlow.Cli -- add "Learn C#"
dotnet run --project examples/TaskFlow.Cli -- list
dotnet test examples/TaskFlow.Api.Tests -c Release
dotnet run --project examples/TaskFlow.Api -- --urls http://localhost:5050
```

The bundled API is an **anonymous local teaching starter**, not a production-ready service. It includes real SQLite persistence and HTTP integration tests, but intentionally leaves identity, ownership, concurrency tokens, and production migration/deployment work as project milestones. Do not expose it with private data.

The website's HTTP and middleware labs are **JavaScript simulations**, not a C# compiler or a connection to the bundled API. Code examples are clearly marked as complete programs, configuration snippets, or excerpts requiring surrounding types/services. Expected-output blocks describe expected behavior, not an execution transcript.

## Verification

```powershell
npm test
npm run lint
npm run format:check
npm run build
npx playwright install chromium
npm run test:e2e
npm run test:dotnet
npm run test:cli
npm run test:snippets
```

The browser suite starts a production preview on port 4173. If you already run another application there, stop that unrelated listener or choose a different test port in the Playwright configuration. Tests use isolated browser profiles and do not modify the progress in your normal learning tab.

Coverage includes content integrity, search, progress validation, simulation behavior, notes/bookmark persistence, backup import/export, cross-tab synchronization, storage failure, project downloads, quiz sessions, all lesson and supplementary diagram renders, PDF reference/revision navigation, existing-progress compatibility, responsive layouts, and automated WCAG A/AA checks. Automated accessibility checks do not replace keyboard and assistive-technology review.

The starter tests use isolated SQLite in-memory databases. The CLI smoke script uses temporary files and verifies that damaged data is not overwritten. The snippet check builds 33 self-contained lesson examples, compares the actual output of 20 console programs, and verifies three portable SQL result sets on SQLite. SQL Server-only procedures and Dapper/AutoMapper integration excerpts require their stated environments and are not executed by that checker. These checks do not claim to test a production identity provider, TLS proxy, or deployment platform.

## Publish on GitHub Pages

1. Create a GitHub repository and upload/commit the project, excluding generated files listed in `.gitignore`.
2. In the repository's **Settings > Pages**, choose **GitHub Actions** as the build source.
3. Push to `main` or `master`, or run the workflow manually from the default branch.
4. The workflow builds and verifies the app, then publishes `dist` to Pages. The deployment job reports the URL.

Hash routing and a relative Vite asset base support a repository subpath such as `https://YOUR-NAME.github.io/YOUR-REPOSITORY/`. A dedicated backend is not needed for the learning website. **GitHub Pages cannot run the ASP.NET Core API**; deploy that separately to an appropriate server or managed host.

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for manual hosting and release details.

## Source and Content Notes

The supplied 41-page **Master Interview Study Reference**, dated May 30, 2026, was reviewed against the course on September 30, 2026. Missing topics are integrated into the existing lessons without changing saved lesson IDs. The **Reference shelf > PDF review** view links its sections to course material and explains important corrections, including SQL Server transaction rollback, JWT revocation, async-void failures, and HTTP caching/idempotency. The **Quick revision** view consolidates interview recall and production scenarios.

The PDF itself is not redistributed. New material is written in original wording and linked to primary documentation. See [docs/CONTENT.md](docs/CONTENT.md) for the review scope, verification boundaries, and source attribution.

The app uses React, TypeScript, Vite, Lucide, Mermaid, Prism, React Markdown, Zod, and self-hosted fonts. There are no analytics scripts or application accounts. Opening external references makes normal requests to their respective websites. Hosting providers may maintain their own request logs.

The .NET logo is used as a technology identifier and does not imply Microsoft endorsement. See the content notes for font, icon, and logo sources. No project license has been selected on your behalf; choose an appropriate license before inviting reuse of a public repository.
