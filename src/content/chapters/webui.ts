import type { Chapter } from '../types'

export const webui: Chapter = {
  id: 'webui',
  title: 'MVC, Razor & Blazor',
  description: 'Choose a web UI model and understand its rendering and state boundaries.',
  level: 'Intermediate',
  accent: 'cyan',
  lessons: [
    {
      id: 'mvc-and-razor-pages',
      title: 'MVC & Razor Pages',
      subtitle: 'Render useful HTML on the server with clear page and request responsibilities.',
      minutes: 26,
      tags: ['MVC', 'Razor Pages', 'Razor', 'cshtml', 'PageModel', 'Tag Helpers', 'PRG'],
      outcomes: [
        'Separate models, views, and controllers.',
        'Compare page-focused and controller-focused organization.',
        'Understand server rendering and redirect-after-post.',
      ],
      sections: [
        {
          title: 'HTML can come from the server',
          body: 'A server-rendered application handles an HTTP request and returns HTML that the browser displays. Razor combines HTML with C# expressions and control structures in .cshtml files. The C# runs on the server; the browser receives the resulting HTML, not the original Razor source. JavaScript can add client behavior, but is not required for every interaction.\n\nMVC separates a controller handling request coordination, a model containing relevant data, and a view rendering the response. A view model should contain what that page needs, not expose every persistence entity and navigation. Keep database queries out of view templates so rendering remains understandable and testable.',
        },
        {
          title: 'Razor Pages organizes around pages',
          body: 'Razor Pages places page markup beside a PageModel with handlers such as OnGet and OnPost. This can be a simpler structure for page-oriented forms than separate controller actions and view folders. It uses the same broader ASP.NET Core host, DI, authorization, and middleware infrastructure.\n\nTag Helpers integrate server-side behavior with HTML-like syntax, for example generating a form action or validation message. They are not browser custom elements. Razor normally HTML-encodes dynamic output to reduce XSS risk; bypassing that encoding requires a deliberate trusted-content policy.',
        },
        {
          title: 'Model the browser workflow',
          body: 'For a successful form mutation, the **Post/Redirect/Get** pattern returns a redirect after processing the POST. The browser then performs a GET for the resulting page. This reduces accidental resubmission when the user refreshes. It does not by itself prevent double-clicked or retried writes; server-side idempotency and constraints may still be needed.\n\nUse ModelState to preserve validation feedback on invalid submissions. ViewData and ViewBag are less strongly typed than a dedicated view model. TempData can carry small values across a redirect, but is not a database or a general session store. Choose the state mechanism based on its actual lifetime and confidentiality needs.',
        },
      ],
      diagram: {
        title: 'Post, redirect, get',
        source:
          'sequenceDiagram\n  participant Browser\n  participant Page as Page handler\n  participant DB\n  Browser->>Page: POST form\n  Page->>DB: Validate and save\n  Page-->>Browser: Redirect\n  Browser->>Page: GET resulting page\n  Page-->>Browser: Rendered HTML',
        caption:
          'The redirect separates the mutation request from the final page display. It is not a complete duplicate-write defense.',
      },
      example: {
        title: 'Render a Razor task list',
        filename: 'Index.cshtml',
        language: 'razor',
        setup:
          'Create `dotnet new webapp -n TaskFlow.Pages -f net10.0`. Replace Pages/Index.cshtml with this page and run the project. The seeded titles are presentation data for this first rendering example.',
        code: '@page\n@{\n    ViewData["Title"] = "TaskFlow";\n    string[] titles = ["Learn Razor", "Validate a form"];\n}\n\n<h1>TaskFlow</h1>\n<ul>\n    @foreach (string title in titles)\n    {\n        <li>@title</li>\n    }\n</ul>',
        output: 'An HTML heading and two list items, rendered by the server.',
        explanation: [
          'The @page directive makes this a Razor Page endpoint.',
          'The foreach executes on the server, generating one li element per title.',
          'Razor encodes each title as text. Database retrieval belongs in a page model or application service as the example grows.',
        ],
      },
      traps: [
        {
          question: 'Does a browser execute the C# inside a .cshtml file?',
          answer:
            'No. Razor runs on the server and produces HTML. Blazor WebAssembly is a different client execution model, not how ordinary Razor views work.',
          warning: 'Razor syntax appears in several technologies whose hosting models differ.',
        },
        {
          question: 'Does Post/Redirect/Get guarantee one write only?',
          answer:
            'No. It reduces refresh resubmission after a successful redirect, but duplicate submissions and network retries still require server-side safeguards where necessary.',
          warning: 'A browser workflow pattern is not a durable idempotency protocol.',
        },
      ],
      exercise: {
        title: 'Move data out of the template',
        brief: 'Replace the seeded array with a strongly typed page model property.',
        steps: [
          'Populate the property in OnGet.',
          'Render the page without running a query in the template.',
          'Explain how an invalid POST should preserve validation messages.',
        ],
        solution:
          'The PageModel coordinates data loading and exposes a read-oriented property to the Razor page. Invalid POSTs return the page with ModelState and needed view data; successful mutations redirect. Keep persistence and validation behavior outside the markup.',
      },
      quiz: {
        question: 'What does a normal Razor view send to the browser?',
        options: [
          'Its uncompiled C# source',
          'Rendered HTML',
          'A database connection',
          'A .NET SDK installer',
        ],
        answer: 1,
        explanation:
          'The server executes Razor and sends the rendered response. The browser does not need the .NET SDK to display ordinary server-rendered HTML.',
      },
      references: [
        {
          label: 'Razor Pages introduction',
          url: 'https://learn.microsoft.com/en-us/aspnet/core/razor-pages/?view=aspnetcore-10.0',
        },
        {
          label: 'MVC overview',
          url: 'https://learn.microsoft.com/en-us/aspnet/core/mvc/overview?view=aspnetcore-10.0',
        },
      ],
    },
    {
      id: 'blazor-and-render-modes',
      title: 'Blazor components & render modes',
      subtitle: 'Know where a component runs before reasoning about its events and services.',
      minutes: 32,
      tags: [
        'Blazor',
        'SSR',
        'InteractiveServer',
        'WebAssembly',
        'InteractiveAuto',
        'lifecycle',
        'prerendering',
      ],
      outcomes: [
        'Compare static and interactive rendering modes.',
        'Explain component state and lifecycle.',
        'Identify server/client service and security boundaries.',
      ],
      sections: [
        {
          title: 'Components are reusable UI units',
          body: 'A Razor component combines markup and C# behavior in a .razor file. Parameters carry input from a parent, event callbacks communicate changes, and local fields hold component state. Re-rendering computes updated UI output; it is not the same as creating a new browser page for every click.\n\nUse parameters as inputs rather than silently mutating parent-owned values. Keep state ownership clear: local component state, shared circuit state, browser storage, and database state have different lifetimes. A value that survives one render does not necessarily survive refresh or a new connection.',
        },
        {
          title: 'Rendering mode determines execution',
          body: '| Mode | Where behavior runs | Main tradeoff |\n| --- | --- | --- |\n| Static server rendering | Server renders HTML for requests | No ordinary interactive component event loop |\n| Interactive Server | Server circuit with browser updates | Connection and server-side per-circuit resources |\n| Interactive WebAssembly | Browser .NET runtime | Download/startup cost and separate API security |\n| Interactive Auto | Initially server; later visits can use downloaded client runtime | Both execution environments must be supported |\n\nAuto does not mean an existing component effortlessly migrates all its live state between server and client. Client code is not trusted simply because it is written in C#.',
        },
        {
          title: 'Lifecycle and prerendering affect work',
          body: 'OnInitialized and OnInitializedAsync establish initial component behavior. OnParametersSet reacts to supplied parameters. OnAfterRenderAsync is useful when rendered DOM or JavaScript interop is needed, with firstRender distinguishing the first interactive render. Avoid unbounded state changes that trigger repeated rendering loops.\n\nPrerendering and later interactive startup can cause initialization work to occur in different phases or more than once. Services available on the server may not exist in the browser. Use documented state persistence patterns when appropriate, and do not perform duplicate writes in an initialization method. In Interactive Server, a scoped service commonly lives for a circuit rather than a single HTTP request, which matters especially for DbContext lifetime.',
        },
      ],
      diagram: {
        title: 'Two interactive execution locations',
        source:
          'flowchart TB\n  component["Razor component"] --> server["Interactive Server"]\n  component --> wasm["Interactive WebAssembly"]\n  server --> circuit["Server state + SignalR circuit"]\n  wasm --> browser["Browser runtime + API calls"]',
        caption:
          'The same UI vocabulary does not imply the same execution location, state lifetime, or trust boundary.',
      },
      example: {
        title: 'An interactive completion counter',
        filename: 'TaskCounter.razor',
        language: 'razor',
        setup:
          'Create `dotnet new blazor -n TaskFlow.Blazor -f net10.0 --interactivity Server`. Add this component under Components/Pages and visit /task-counter. The template imports the render-mode names.',
        code: '@page "/task-counter"\n@rendermode InteractiveServer\n\n<h1>Completed tasks</h1>\n<p role="status">@completedTasks completed</p>\n<button type="button" @onclick="CompleteTask">Complete a task</button>\n\n@code {\n    private int completedTasks;\n\n    private void CompleteTask()\n    {\n        completedTasks++;\n    }\n}',
        output: 'Each click increments the visible count within the interactive component state.',
        explanation: [
          'InteractiveServer enables the component event behavior through the server circuit.',
          'The count is local state, not a saved task record. Refresh or a new circuit can reset it.',
          'The semantic button and status announcement are useful accessibility defaults.',
        ],
      },
      traps: [
        {
          question: 'Is a Blazor scoped service always one per HTTP request?',
          answer:
            'No. In Interactive Server, scoped services commonly follow the circuit lifetime. WebAssembly has its own client lifetime behavior. Choose service ownership for the actual render mode.',
          warning:
            'A long-lived circuit DbContext can create stale tracking and concurrent-use problems.',
        },
        {
          question: 'Can browser C# keep an API secret private?',
          answer:
            'No. Code and data delivered to a browser are accessible to that client. Keep secrets and trusted authorization enforcement on the server.',
          warning: 'WebAssembly is an execution format, not a secrecy boundary.',
        },
      ],
      exercise: {
        title: 'Explain a nonworking event',
        brief: 'A component has an @onclick handler but is rendered only as static SSR.',
        steps: [
          'Identify why no interactive event is processed.',
          'Choose an appropriate interactive mode and host support.',
          'Explain where its state will live after the change.',
        ],
        solution:
          'Static SSR renders HTML without the ordinary interactive component event loop. Add a supported interactive render mode and required host configuration. For Interactive Server the state lives in the server circuit; for WebAssembly it lives in the browser and protected operations still call an authorized API.',
      },
      quiz: {
        question: 'Where does Interactive Server component event logic normally execute?',
        options: [
          'Inside the browser JavaScript engine as C# source',
          'On the server circuit',
          'Inside SQL Server',
          'Only at build time',
        ],
        answer: 1,
        explanation:
          'Interactive Server executes component logic on the server and synchronizes UI interaction over a connection. This differs from Interactive WebAssembly, where .NET runs in the browser.',
      },
      references: [
        {
          label: 'Blazor render modes',
          url: 'https://learn.microsoft.com/en-us/aspnet/core/blazor/components/render-modes?view=aspnetcore-10.0',
        },
        {
          label: 'Component lifecycle',
          url: 'https://learn.microsoft.com/en-us/aspnet/core/blazor/components/lifecycle?view=aspnetcore-10.0',
        },
      ],
    },
    {
      id: 'forms-and-validation',
      title: 'Forms, validation & user feedback',
      subtitle: 'Make invalid input understandable while keeping the server authoritative.',
      minutes: 26,
      tags: [
        'EditForm',
        'EditContext',
        'DataAnnotationsValidator',
        'InputText',
        'validation',
        'forms',
        'antiforgery',
      ],
      outcomes: [
        'Build a bound form with validation messages.',
        'Separate UI validation from trusted server rules.',
        'Handle pending, failed, and successful submissions.',
      ],
      sections: [
        {
          title: 'A form is a stateful workflow',
          body: "A useful form has more states than empty and submitted. It can be dirty, invalid, submitting, accepted, or failed because of a server problem. Preserve the user's entered data on failure, associate messages with fields, and distinguish validation errors from an unavailable service. A disabled submit button can reduce duplicate clicks but cannot replace server-side duplicate handling.\n\nUse semantic labels and controls. A placeholder is not a label, because it disappears during entry and is often an unreliable accessible name. Tell assistive technology when important submission status changes without repeatedly interrupting every keystroke.",
        },
        {
          title: 'Blazor tracks an edit context',
          body: 'EditForm coordinates editing and submission. Its model can create an EditContext, which tracks fields, modified state, and validation messages. InputText and other InputBase-derived controls integrate with that context. DataAnnotationsValidator connects data-annotation rules, while ValidationMessage and ValidationSummary render feedback.\n\nOnValidSubmit runs after the configured validation succeeds. It does not prove that a remote API will accept the operation or that the user is authorized. Async submission should return Task, be awaited, and show failures without dropping input. Form naming and binding requirements differ between static server forms and interactive modes; follow the mode-specific guidance.',
        },
        {
          title: 'Rules exist on both sides for different reasons',
          body: 'Client validation saves a round trip and improves feedback. Server validation protects the actual data and can enforce rules requiring trusted state, such as unique names or project membership. A browser can bypass client checks, and two valid-looking submissions can race. Database constraints are the final protection for relevant storage invariants.\n\nCookie-authenticated state-changing forms also need antiforgery protections according to the application model. Validation, authentication, authorization, and antiforgery are separate checks. Do not treat a successful EditForm validation result as a security decision or display "saved" before persistence actually succeeds.',
        },
      ],
      diagram: {
        title: 'The submission state machine',
        source:
          'flowchart LR\n  editing["Editing"] --> validate{"Valid input?"}\n  validate -->|No| feedback["Field feedback"]\n  feedback --> editing\n  validate -->|Yes| submit["Await server operation"]\n  submit --> success["Saved after confirmed success"]\n  submit --> failure["Keep input and show failure"]',
        caption:
          'A valid form can still fail authorization, concurrency, or persistence checks on the server.',
      },
      example: {
        title: 'Validate a task draft',
        filename: 'TaskForm.razor',
        language: 'razor',
        setup:
          'Add this component to the Interactive Server Blazor project from the previous lesson. It validates a local draft only and does not persist a database record.',
        code: '@page "/task-form"\n@rendermode InteractiveServer\n@using System.ComponentModel.DataAnnotations\n\n<EditForm Model="draft" OnValidSubmit="AcceptDraft" FormName="task-draft">\n    <DataAnnotationsValidator />\n    <label for="task-title">Task title</label>\n    <InputText id="task-title" @bind-Value="draft.Title" />\n    <ValidationMessage For="() => draft.Title" />\n    <button type="submit">Validate draft</button>\n</EditForm>\n<p role="status">@status</p>\n\n@code {\n    private readonly TaskDraft draft = new();\n    private string status = "";\n    private void AcceptDraft() => status = $"Valid draft: {draft.Title.Trim()}";\n\n    public sealed class TaskDraft\n    {\n        [Required, StringLength(120)]\n        public string Title { get; set; } = "";\n    }\n}',
        output:
          'Invalid input shows a field message. Valid input displays a local draft confirmation.',
        explanation: [
          'DataAnnotationsValidator connects the model attributes to the EditForm validation pipeline.',
          'The message is associated with the Title field, and the label identifies its input.',
          'The wording says valid draft rather than saved, because no persistence operation occurred.',
        ],
      },
      traps: [
        {
          question: 'Does OnValidSubmit mean the server must accept the data?',
          answer:
            "No. It means the form's configured validation passed. Server authorization, concurrency, unique constraints, and additional business rules can still reject the operation.",
          warning: 'UI validity is not a trusted persistence guarantee.',
        },
        {
          question: 'Does disabling Submit prevent duplicate writes completely?',
          answer:
            'No. It helps the current UI interaction, but retries, multiple tabs, direct clients, and network uncertainty remain. Server-side safeguards must match the operation.',
          warning: 'A browser control cannot enforce a global uniqueness or idempotency rule.',
        },
      ],
      exercise: {
        title: 'Add an honest saving state',
        brief: 'Connect the draft form to an asynchronous API operation.',
        steps: [
          'Track submitting state and await the request.',
          'Preserve input when the API fails.',
          'Show saved only after a confirmed successful response.',
        ],
        solution:
          'Use an async Task handler with a try/finally that clears the pending state. Map validation responses to useful field feedback and show nonvalidation errors separately. Keep the data until success is confirmed, and rely on server validation and authorization regardless of the UI checks.',
      },
      quiz: {
        question: 'Which layer must remain authoritative when browser validation passes?',
        options: [
          'The input placeholder',
          "The server's validation and authorization boundary",
          'The submit button color',
          'The browser history',
        ],
        answer: 1,
        explanation:
          'Client validation is useful feedback but can be bypassed. The server must enforce data rules and access checks before performing protected or persistent operations.',
      },
      references: [
        {
          label: 'Blazor forms',
          url: 'https://learn.microsoft.com/en-us/aspnet/core/blazor/forms/?view=aspnetcore-10.0',
        },
        {
          label: 'Blazor validation',
          url: 'https://learn.microsoft.com/en-us/aspnet/core/blazor/forms/validation?view=aspnetcore-10.0',
        },
      ],
    },
    {
      id: 'state-and-signalr',
      title: 'State management & SignalR',
      subtitle: 'Keep durable truth separate from temporary connections and live notifications.',
      minutes: 28,
      tags: [
        'SignalR',
        'Hub',
        'state',
        'session',
        'circuit',
        'groups',
        'WebSockets',
        'reconnection',
      ],
      outcomes: [
        'Choose state storage by lifetime and scope.',
        'Explain SignalR connection and hub behavior.',
        'Design notifications that can recover from disconnects.',
      ],
      sections: [
        {
          title: 'State has a location and a lifetime',
          body: 'Component fields, server session, browser storage, an in-memory cache, and a database all store state with different guarantees. Browser storage belongs to an origin and device profile; it is not automatically synchronized across devices. Session is temporary application state, not a durable business record. A database is the usual source of truth for tasks that must survive restarts.\n\nScaling to multiple app instances exposes local-state assumptions. A request may reach a different instance, a process can restart, and a circuit can disconnect. Define what can be reconstructed and what must be persisted. Do not store essential task data only in a hub or an interactive component.',
        },
        {
          title: 'SignalR coordinates real-time communication',
          body: 'SignalR provides a higher-level API for client/server real-time messaging and selects a supported transport such as WebSockets when available. A hub exposes methods clients can call and provides ways to address clients, users, and groups. Hub instances are transient; do not use their fields as shared durable state.\n\nUse IHubContext from other application services to send notifications. Authenticate and authorize the hub and its operations. Group membership is a routing convenience, not an independent security boundary. Never let an arbitrary client join any private project group merely by supplying its name.',
        },
        {
          title: 'Delivery and recovery need a plan',
          body: 'Connections can drop, clients can miss messages, and reconnecting may create new connection state. A live notification should often tell the client that something changed so it can refetch authorized current data. If every event must be processed, use sequence identifiers, durable storage, replay, and deduplication appropriate to the requirement.\n\nScale-out can require a backplane or a managed SignalR service, plus compatible authentication and routing configuration. Sending a message is not the same as proving that a human saw it. Keep business transactions independent of temporary browser availability, and do not hold a database transaction open while waiting for client acknowledgement.',
        },
      ],
      diagram: {
        title: 'Database truth, live notification',
        source:
          'flowchart LR\n  command["Authorized update"] --> db["Persist task"]\n  db --> event["Change notification"]\n  event --> hub["SignalR hub context"]\n  hub --> client["Connected client"]\n  client --> refresh["Refetch authorized state"]',
        caption:
          'Notifications improve timeliness. Durable data and reconnection recovery establish correctness.',
      },
      example: {
        title: 'Send a user-scoped task notification',
        filename: 'TaskNotifications.cs',
        language: 'csharp',
        setup:
          'Host/service excerpts for an API with configured authentication. AddSignalR belongs before Build; MapHub follows middleware. The service receives IHubContext<TaskHub>. Map validated identities to SignalR user identifiers consistently.',
        code: 'builder.Services.AddSignalR();\n\napp.MapHub<TaskHub>("/hubs/tasks").RequireAuthorization();\n\npublic sealed class TaskHub : Microsoft.AspNetCore.SignalR.Hub\n{\n}\n\npublic sealed class TaskNotifier(\n    Microsoft.AspNetCore.SignalR.IHubContext<TaskHub> hub)\n{\n    public Task NotifyAsync(string ownerId, int taskId, CancellationToken cancellationToken)\n        => hub.Clients.User(ownerId).SendAsync(\n            "TaskChanged", taskId, cancellationToken);\n}',
        output:
          'Connected clients mapped to the authorized owner user ID receive a TaskChanged notification.',
        explanation: [
          'Import Microsoft.AspNetCore.SignalR for the SendAsync extension in the service file.',
          'ownerId must come from trusted application state, not an arbitrary client instruction.',
          'A disconnected client can miss this message. Refetch authoritative data on reconnect; add durable delivery only if the product requires it.',
        ],
      },
      traps: [
        {
          question: 'Can a SignalR Hub field store all current tasks?',
          answer:
            'No. Hub instances are transient, and process-local memory is not durable or shared across replicas. Store durable tasks in an appropriate data store.',
          warning: 'Connection state and business state need different ownership.',
        },
        {
          question: 'Are SignalR groups an authorization system?',
          answer:
            'No. They route messages to selected connections. The application must authorize group membership and protected operations, including after reconnects.',
          warning: 'A predictable group name must not grant access by itself.',
        },
      ],
      exercise: {
        title: 'Recover from a missed notification',
        brief: 'A client disconnects while three tasks change, then reconnects.',
        steps: [
          'Define how it reloads current authorized task data.',
          'Decide whether exact event replay is necessary.',
          'Test that reconnecting does not grant unauthorized project membership.',
        ],
        solution:
          'For a task list, refetching current state on reconnect may be enough. Audit-style workflows need durable sequenced events and replay. Re-establish only authorized subscriptions and do not assume the old connection or group state survived.',
      },
      quiz: {
        question: 'What should remain the source of truth when a SignalR client misses a message?',
        options: [
          'The last hub instance field',
          'Durable authorized application data',
          'The connection ID string',
          'The browser animation state',
        ],
        answer: 1,
        explanation:
          'A transient connection cannot provide durable truth. Clients should reconcile with authorized persisted state, or use a specifically designed durable event replay mechanism when required.',
      },
      references: [
        {
          label: 'SignalR introduction',
          url: 'https://learn.microsoft.com/en-us/aspnet/core/signalr/introduction?view=aspnetcore-10.0',
        },
        {
          label: 'SignalR hubs',
          url: 'https://learn.microsoft.com/en-us/aspnet/core/signalr/hubs?view=aspnetcore-10.0',
        },
      ],
    },
    {
      id: 'accessibility-and-localization',
      title: 'Accessibility, localization & usable errors',
      subtitle: 'A correct backend is not enough if people cannot use the interface.',
      minutes: 24,
      tags: [
        'accessibility',
        'a11y',
        'localization',
        'culture',
        'IStringLocalizer',
        'keyboard',
        'semantic HTML',
      ],
      outcomes: [
        'Build keyboard- and screen-reader-friendly forms.',
        'Separate culture-sensitive display from machine contracts.',
        'Localize messages without corrupting identifiers or data.',
      ],
      sections: [
        {
          title: 'Semantics are the first accessibility tool',
          body: 'Use buttons for actions, links for navigation, labels for form controls, and headings that reflect document structure. Native controls already provide useful keyboard and accessibility behavior. A clickable div does not become an accessible button merely because it looks like one. Focus must remain visible and move predictably when a dialog opens or a view changes.\n\nDo not communicate validation or task state only through color. Pair color with text or a recognizable icon and accessible label. Associate errors with their fields, preserve entered data after failure, and ensure content works at narrow widths and enlarged text sizes. Automated checks help, but keyboard and assistive-technology testing remain important.',
        },
        {
          title: 'Culture affects formatting and interpretation',
          body: 'Dates, numbers, currencies, sorting, and translated messages depend on cultural conventions. A date such as 03/04/2026 is ambiguous without a convention. Prefer unambiguous machine formats for APIs, such as documented ISO 8601 timestamps, and format human-facing values using the selected culture. Currency requires a currency identity, not only a decimal number.\n\nRequest localization middleware chooses a culture from configured providers, such as query strings, cookies, or Accept-Language. Configure supported cultures and a fallback rather than accepting unlimited arbitrary behavior. Place localization before components that depend on it, considering routing-based culture providers when used.',
        },
        {
          title: 'Translate meaning, not every technical value',
          body: 'IStringLocalizer can resolve messages from localized resources. Keep machine-readable error codes stable while translating human messages. Do not localize database keys, permission identifiers, or JSON field names casually: clients depend on those contracts. Avoid concatenating translated fragments where word order differs across languages.\n\nA layout must allow longer translated text and right-to-left behavior where supported. Server logs may need a stable diagnostic vocabulary, while user-facing errors need understandable localized language. Accessibility and localization are ongoing acceptance criteria, not a final styling pass after all behavior has been fixed.',
        },
      ],
      diagram: {
        title: 'Separate machine data from presentation',
        source:
          'flowchart LR\n  data["Stable domain data"] --> api["Documented API format"]\n  data --> culture["Selected supported culture"]\n  culture --> view["Localized human display"]\n  view --> semantics["Accessible semantic controls"]',
        caption:
          'Machine contracts remain stable while the presentation adapts to language, culture, and accessibility needs.',
      },
      example: {
        title: 'A labeled input with related feedback',
        filename: 'TaskFields.cshtml',
        language: 'razor',
        setup:
          "HTML/Razor form-field excerpt. Place it inside a properly handled server form, including the framework's antiforgery protection when required. Set aria-invalid and the error text from actual validation state.",
        code: '<label for="task-title">Task title</label>\n<input id="task-title" name="Title" type="text"\n       required maxlength="120"\n       aria-describedby="title-hint title-error"\n       aria-invalid="true" />\n<p id="title-hint">Maximum 120 characters.</p>\n<p id="title-error">Enter a task title.</p>\n<button type="submit">Create task</button>',
        output:
          'The input has a persistent label, related guidance, and an explicit invalid-state message.',
        explanation: [
          'The label targets the input ID, and aria-describedby connects the additional text.',
          'This excerpt shows the invalid state; do not leave aria-invalid true after the field becomes valid.',
          'HTML required is useful client feedback, but the server must validate the same rule. Localize the human-facing strings through your resource strategy.',
        ],
      },
      traps: [
        {
          question: 'Is placeholder text an adequate replacement for a label?',
          answer:
            'No. It disappears during typing and is not a reliable substitute for a persistent, programmatically associated label.',
          warning:
            'A visually compact form can still be unusable if its controls have no clear names.',
        },
        {
          question: 'Should localized APIs change permission IDs to translated words?',
          answer:
            'No. Keep machine identifiers stable and translate human-facing messages separately. Changing contract identifiers by culture creates ambiguity and compatibility problems.',
          warning: 'Presentation language and protocol identity solve different needs.',
        },
      ],
      exercise: {
        title: 'Audit a task form without a mouse',
        brief: 'Use only the keyboard to navigate, submit invalid input, and recover.',
        steps: [
          'Check focus order and visible focus indicators.',
          'Confirm every field has a label and associated error.',
          'Try a longer translated message and a narrow viewport.',
        ],
        solution:
          'Every action should be reachable and operable using expected keyboard behavior. Errors should be understandable without color and linked to their fields. Layout must wrap without hiding controls or overlapping text. Keep machine-readable codes unchanged when localizing messages.',
      },
      quiz: {
        question: 'Which value should normally remain stable across UI languages?',
        options: [
          'A human error sentence',
          'A translated button label',
          'A machine-readable permission identifier',
          'A localized month name',
        ],
        answer: 2,
        explanation:
          'Permission identifiers are part of a machine contract. Translate the explanation shown to people, not the identifier used to make authorization decisions.',
      },
      references: [
        {
          label: 'ASP.NET Core localization',
          url: 'https://learn.microsoft.com/en-us/aspnet/core/fundamentals/localization?view=aspnetcore-10.0',
        },
        { label: 'WAI accessibility tutorials', url: 'https://www.w3.org/WAI/tutorials/' },
      ],
    },
  ],
}
