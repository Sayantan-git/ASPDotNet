# Content and Learning Design

## Baseline and Scope

The course targets .NET 10 LTS / C# 14 and was authored against the September 2026 platform baseline. The .NET support policy and ASP.NET Core fundamentals were checked against Microsoft's documentation. .NET 10 is supported through November 14, 2028; supported installations must keep up with servicing patches.

The course is a broad, cumulative core path, not a claim to contain every API or prepare every learner for every role. Advanced specialization links are distinguished from authored lessons. Interview traps teach distinctions and tradeoffs rather than promising a fixed interview question bank.

## PDF Reference Status

The user subsequently supplied all 41 pages of **Master Interview Study Reference: ASP.NET Core, REST APIs, Authentication, SQL**, dated May 30, 2026. The supplied text and page images were reviewed on September 30, 2026. The initial release had no PDF; this update replaces that limitation with a documented topic comparison.

- The original 60 lesson IDs and quiz-answer meanings remain stable so saved progress, notes, and old backups still work.
- Existing lessons now cover the missing SQL depth, database-first scaffolding, Dapper/procedures, AutoMapper, launch profiles, SSO/SAML, refresh/revocation details, REST constraints, conditional caching, and protocol comparisons.
- The reference shelf's **PDF review** view maps all 13 source sections and all 41 pages to course lessons, and explains 15 groups of corrections/qualifications. **Quick revision** adds 12 recall prompts and six production scenarios.
- The source PDF itself is not stored or redistributed in the public website. Explanations, examples, and diagrams are newly authored, rather than a reproduction of the attachment.
- The source's proposed 60-day tracker only contains details for Days 1-5. No nonexistent later-day plan was inferred. Its May 30 "today" is a historical date, not a newly assigned learner start date.

Important corrections include SQL Server rollback of TRUNCATE and supported DROP operations; PATCH idempotency; HEAD/OPTIONS safety; conditional POST caching; DI creation/disposal; runtime route matching; Required on a non-nullable integer; EF query/direct-command execution; raw SQL parameterization; JWT revocation and session scalability; HttpOnly limitations; SSO logout propagation; and async-void exception behavior. SQL dialect differences and AutoMapper 15 licensing are explicit.

Primary checks included Microsoft's TRUNCATE/DROP documentation, AutoMapper's queryable-extension and 15.0 upgrade guides, MDN's PATCH and Cache-Control references, and HTTP Semantics RFC 9110. Lesson references link to these and related sources. The PDF is used as a coverage checklist, not as unquestioned technical authority.

## Lesson Structure

`src/content/types.ts` defines the lesson and chapter contract. Chapter modules live in `src/content/chapters`; `src/content/curriculum.ts` builds the index and concept search.

Each lesson contains:

1. A title, study estimate, searchable tags, and concrete learning outcomes.
2. Concept-first sections explaining meaning, motivation, behavior, caveats, and project connection.
3. A main Mermaid diagram with an explanatory caption, plus optional section diagrams.
4. A main practical example with filename, language, setup, code, and a walkthrough, plus optional additionalExamples.
5. At least two interview pitfalls with a strong answer and a warning about the tempting misconception.
6. An exercise with steps and a reference approach.
7. A multiple-choice check with a zero-based answer index and explanation.
8. Relevant official or primary-source references.

The C# examples use an explicit distinction between complete programs and excerpts. A package command using `10.*` selects a current compatible servicing release for experimentation; the bundled runnable projects pin their package versions. Expected outcomes describe what to observe, not proof that every snippet was executed in every environment.

## Editing Content

Keep concepts before code. Use straightforward English while preserving caveats. Define prerequisite terms before relying on them. Connect examples to TaskFlow where it genuinely helps; do not force every concept into an artificial analogy.

Keep IDs stable because bookmarks, notes, links, and quiz answers use them. If you change an answer's option order, consider the effect on existing saved numeric answers. A future incompatible curriculum update should introduce a migration or bump the saved-data version rather than silently reinterpreting user progress.

The current integrity test intentionally expects 12 chapters with five lessons each. Adding chapters requires updating those expectations and reviewing count limits, displayed counts, saved-data validation, and backup compatibility. Existing lessons are safe to deepen without changing their IDs or quiz-answer meanings.

Run `npm test`, `npm run build`, and `npm run test:e2e` after meaningful changes. The browser suite renders every authored diagram. Test new standalone C# examples with the intended SDK/provider and label unexecuted excerpts honestly.

The snippet checker compiles 33 standalone C# examples, compares 20 console outputs, and verifies three read-only portable SQL result sets using isolated SQLite databases. SQL Server-only procedures, Dapper/AutoMapper integration excerpts, real identity-provider flows, and database reverse-engineering commands require their stated environments and are not executed by that checker. SQLite output verification is not a SQL Server performance or compatibility certification.

Reference coverage, corrections, glossary terms, and scenario/recall prompts live in `src/content/reference.ts`. Tests verify their lesson links and source-page coverage. Add new flashcards after existing ones rather than reordering old entries, because saved self-review uses lesson ID plus trap index.

## Visual and Library Sources

- .NET technology mark: [Simple Icons](https://simpleicons.org/), obtained from `https://cdn.simpleicons.org/dotnet/C5ED7B`. Simple Icons distributes icon artwork under CC0; trademark rights still apply. The mark identifies the taught technology, not an affiliation or endorsement.
- UI icons: [Lucide](https://lucide.dev/), supplied by the installed `lucide-react` package.
- Diagrams: original course diagrams rendered with [Mermaid](https://mermaid.js.org/).
- Fonts: Manrope, Space Grotesk, and JetBrains Mono through [Fontsource](https://fontsource.org/), served locally from installed packages. Their upstream licenses remain applicable.
- Syntax highlighting: [Prism](https://prismjs.com/).
- Markdown rendering: React Markdown with GFM support. Raw HTML is not enabled in lesson Markdown.

Dependency licenses are retained by their packages. Choose the repository's own license before public reuse; no license has been selected for the user.

## Privacy and Honest Assessment

The learning application has no backend account store, analytics, or remote code-execution service. User notes and progress are local, unencrypted browser data. Backup exports are unencrypted JSON. The simulation data is transient and resets when that lab is remounted; it is separate from the persistent .NET API.

Lesson completion and project checkboxes are self-reported. Flashcards are self-rated. Quiz statistics reflect the latest answer for each question, including retries, not a proctored exam score. The app does not award a credential or guarantee employment readiness.
