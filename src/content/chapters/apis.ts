import type { Chapter } from '../types'

export const apis: Chapter = {
  id: 'apis',
  title: 'Build better APIs',
  description: 'Design reliable contracts that real clients can depend on.',
  level: 'Intermediate',
  accent: 'cyan',
  lessons: [
    {
      id: 'controllers-and-binding',
      title: 'Controllers, binding & filters',
      subtitle: 'Use MVC conventions intentionally, and know where they differ from Minimal APIs.',
      minutes: 26,
      tags: [
        'controller',
        'ApiController',
        'model binding',
        'filters',
        'ActionResult',
        'FromBody',
        'MVC',
      ],
      outcomes: [
        'Register and route a controller API.',
        'Explain API controller conventions.',
        'Place filters and middleware at the correct boundary.',
      ],
      sections: [
        {
          title: 'Controllers organize related actions',
          body: 'A controller groups actions under a type. ControllerBase supports HTTP APIs without view-rendering features; Controller adds view support for MVC UI. AddControllers registers controller services, and MapControllers maps attribute-routed endpoints. The ApiController attribute enables API-oriented conventions such as binding-source inference and automatic model-state responses.\n\nA controller is not automatically a business service. Keep HTTP concerns such as status codes, headers, and request DTOs at the edge. Substantial business rules belong in cohesive operations that can be used and tested independently of one transport model.',
        },
        {
          title: 'Binding is explicit when ambiguity matters',
          body: 'FromRoute, FromQuery, FromBody, FromHeader, and FromServices communicate where inputs originate. The framework can infer many sources, but an explicit attribute can make a public contract easier to understand. The request body is normally consumed by an input formatter; do not design an action with multiple independent body-bound objects. Use one request DTO containing the fields.\n\nWith ApiController, invalid model state usually returns a 400 response before the action body executes. This is useful, but tests should verify the actual configured behavior. A raw direct call to the controller method bypasses routing, binding, validation filters, and the rest of the HTTP pipeline.',
        },
        {
          title: 'Choose the right interception mechanism',
          body: 'MVC filters run inside the MVC action invocation pipeline. They can handle action, result, resource, authorization, or exception-related concerns within that model. Middleware surrounds a broader HTTP request path. Minimal API endpoint filters are another mechanism with a different scope and lifecycle.\n\nAn exception filter cannot catch every failure that happens elsewhere in middleware or during all response processing. Use centralized exception middleware for broad HTTP error handling. Avoid duplicating the same validation or logging at several levels. ActionResult<T> expresses a successful body type while allowing alternate results such as NotFound; declared metadata and integration tests make the contract more trustworthy.',
        },
        {
          title: 'Route construction versus request-time matching',
          body: 'The host builds endpoint definitions from registered controllers and route metadata during application setup. It still matches each incoming request to an endpoint at request time. The PDF statement that routing is resolved only at startup confuses building the routing structures with selecting an endpoint for a particular request.\n\nThe `[controller]` token substitutes the controller name without its Controller suffix; it does not inherently lowercase that token. ASP.NET Core route-literal matching is generally case-insensitive, while a proxy, static-file host, other server, or cache can have different path behavior. Publish a consistent URL convention instead of relying on capitalization differences.\n\nUse route values for resource identity, query values for optional filtering/sorting/paging, and a body DTO for the submitted representation. Headers carry protocol and cross-cutting metadata. Reading an Authorization header through FromHeader is not authentication: the configured handler must validate its credential. ApiController also requires attribute routing for its actions; a route convention is not a substitute for testing the public HTTP contract.',
        },
      ],
      diagram: {
        title: 'The controller boundary',
        source:
          'flowchart LR\n  middleware["HTTP middleware"] --> route["Controller endpoint"]\n  route --> bind["Binding / model state"]\n  bind --> filters["MVC filter pipeline"]\n  filters --> action["Action / application service"]\n  action --> result["Action result"]',
        caption:
          'A direct method unit test does not exercise the complete controller HTTP pipeline.',
      },
      example: {
        title: 'A controller-based lookup',
        filename: 'Program.cs',
        language: 'csharp',
        setup:
          'Complete net10.0 web example. All types are in this file for teaching; a larger project normally keeps controllers in their own files.',
        code: 'using Microsoft.AspNetCore.Mvc;\n\nvar builder = WebApplication.CreateBuilder(args);\nbuilder.Services.AddControllers();\nvar app = builder.Build();\napp.MapControllers();\napp.Run();\n\n[ApiController]\n[Route("api/tasks")]\npublic sealed class TasksController : ControllerBase\n{\n    [HttpGet("{id:int}")]\n    public ActionResult<TaskResponse> Get(int id)\n    {\n        if (id != 1) return NotFound();\n        return Ok(new TaskResponse(1, "Learn controllers"));\n    }\n}\n\npublic record TaskResponse(int Id, string Title);',
        output: 'GET /api/tasks/1 -> 200 with JSON\nGET /api/tasks/99 -> 404',
        explanation: [
          'ControllerBase avoids view-specific responsibilities for this JSON API.',
          'Attribute routing combines the controller prefix and action pattern.',
          'Both service registration and endpoint mapping are required. Defining the controller class alone does not establish the whole host configuration.',
        ],
      },
      traps: [
        {
          question: 'Does calling a controller method directly test model binding?',
          answer:
            'No. It tests ordinary method behavior only. Routing, formatters, validation conventions, authentication, and filters require an integration test through the configured host.',
          warning:
            'A passing controller unit test does not prove the endpoint accepts the intended HTTP request.',
        },
        {
          question: 'Can an MVC exception filter replace all exception middleware?',
          answer:
            'No. Its scope is the MVC pipeline, not all middleware and host behavior. Use an appropriate centralized boundary for broad HTTP error handling.',
          warning: 'Different interception mechanisms have different coverage.',
        },
      ],
      exercise: {
        title: 'Make the input contract explicit',
        brief:
          'Add an action that receives an ID from the route and a title from a JSON request DTO.',
        steps: [
          'Use one body DTO instead of two body-bound scalar parameters.',
          'Add a title validation attribute.',
          'Test malformed JSON and an empty title through HTTP.',
        ],
        solution:
          'Use a route ID plus one body-bound update request with validation. Under ApiController, malformed input or invalid model state should return the configured validation response before the action performs work. Verify via an integration test, not just a direct method call.',
      },
      quiz: {
        question:
          'Which base class is the usual choice for a controller that only returns API responses?',
        options: ['ControllerBase', 'PageModel', 'DbContext', 'BackgroundService'],
        answer: 0,
        explanation:
          'ControllerBase provides API-oriented controller behavior without view rendering. Controller adds view support; PageModel, DbContext, and BackgroundService serve different responsibilities.',
      },
      references: [
        {
          label: 'Controller web APIs',
          url: 'https://learn.microsoft.com/en-us/aspnet/core/web-api/?view=aspnetcore-10.0',
        },
        {
          label: 'MVC filters',
          url: 'https://learn.microsoft.com/en-us/aspnet/core/mvc/controllers/filters?view=aspnetcore-10.0',
        },
      ],
    },
    {
      id: 'rest-and-http-semantics',
      title: 'REST, status codes & idempotency',
      subtitle: 'Make retries, resource names, and error responses mean something consistent.',
      minutes: 48,
      tags: [
        'REST',
        'GET',
        'POST',
        'PUT',
        'PATCH',
        'DELETE',
        'HEAD',
        'OPTIONS',
        'idempotency',
        '401',
        '403',
        'ETag',
        'HATEOAS',
        'GraphQL',
        'gRPC',
      ],
      outcomes: [
        'Choose resource-oriented routes and HTTP methods.',
        'Explain safe and idempotent semantics.',
        'Design retry-friendly write contracts.',
      ],
      sections: [
        {
          title: 'Model resources, not just method names',
          body: 'REST is an architectural style built around constraints such as a uniform interface, stateless interactions, cacheability, and resource representations. A JSON API with noun-based URLs is not automatically a complete REST implementation. Still, consistent HTTP semantics are useful whether or not a system satisfies every REST constraint.\n\nA task is a resource; JSON is one representation of it. Prefer /tasks/42 over /getTaskById?id=42 for a straightforward lookup. Not every domain action fits CRUD, so an explicit operation endpoint can be reasonable when its semantics are documented. Do not contort a workflow just to make every route look identical.',
        },
        {
          title: 'Methods communicate expectations',
          body: '| Method | Intended use | Important property |\n| --- | --- | --- |\n| GET | Retrieve a representation | Safe and idempotent in intended semantics |\n| POST | Submit processing or create under a collection | Not inherently idempotent |\n| PUT | Create or replace at a known target | Idempotent intended effect |\n| PATCH | Apply a partial change | Idempotency depends on the patch operation |\n| DELETE | Remove the target association/resource | Idempotent intended effect |\n\nIdempotent means repeating an identical request has the same intended server effect, not necessarily the same status or response body. Logging each GET does not violate its intended safe resource semantics. Repeating DELETE may return 404 after the first deletion while remaining idempotent.',
        },
        {
          title: 'Make failures and retries predictable',
          body: 'Use 201 Created for creation with an appropriate Location, 204 for success without a response body, 400 for invalid requests, 401 for an authentication challenge, and 403 when access is forbidden. A server may deliberately use 404 to avoid revealing a protected resource. 409 often represents a state conflict; 412 is appropriate for failed HTTP preconditions such as an If-Match check.\n\nA network timeout after POST does not tell the client whether creation happened. For retry-sensitive operations, define an idempotency key contract with durable deduplication, request-payload matching, expiry, and atomic result storage. Merely accepting an Idempotency-Key header without implementing those guarantees is not protection. Use ETags and conditional requests when optimistic HTTP concurrency fits the resource.',
        },
        {
          title: 'All six REST constraints, with their actual purpose',
          body: '| Constraint | What it contributes | What it does not mean |\n| --- | --- | --- |\n| Client-server | Separates client presentation concerns from server resource responsibilities | A server is forbidden to generate HTML |\n| Stateless | A request carries the context needed to understand it without a remembered interaction sequence | The system has no durable database, or must use JWT |\n| Cacheable | Response semantics state whether reuse is permitted | Every response should be public or cached forever |\n| Uniform interface | Shared resource/representation/message conventions | Noun URLs alone prove REST compliance |\n| Layered system | Components interact through their visible layer | No header or timing can ever reveal an intermediary |\n| Code on demand, optional | A server can extend client behavior by supplying executable code | Every web API must deliver JavaScript |\n\nThe uniform interface includes identifying resources, manipulating them through representations, self-describing messages, and hypermedia controls that guide application state transitions, often called HATEOAS. Many practical JSON APIs use HTTP resource conventions without implementing the complete hypermedia model. Be accurate about the design rather than arguing from a label.\n\nPlural nouns, consistent casing, and shallow resource nesting are useful public-contract conventions. A verb in a URI does not alone prove a formal REST violation, and a noun does not rescue a GET that deletes data. For TaskFlow, choose understandable task/project resources and preserve the intended HTTP semantics.',
        },
        {
          title: 'HEAD, OPTIONS, and body semantics',
          body: 'GET is not the only safe method. HEAD and OPTIONS are safe and idempotent in their defined semantics, as is TRACE, a diagnostic method often disabled by policy. Safe refers to the requested semantics; access logs, metrics, or incidental bookkeeping do not turn a normal retrieval into a user-requested mutation.\n\nHEAD requests the metadata associated with GET without a response body. Some headers that are expensive to compute may be omitted. OPTIONS asks about communication capabilities; a CORS preflight is a specific browser use of OPTIONS, not the meaning of every OPTIONS request. An Allow header and Access-Control-Allow-Methods solve different protocol questions.\n\nRequest framing is not a simple body/no-body checkbox. GET and DELETE content has no generally defined semantics and is often rejected or not handled consistently by intermediaries; avoid depending on it. A DELETE response can be 200 with a result, 202 for accepted asynchronous work, or 204 with no content according to the actual contract. A repeated DELETE may return 404 or an intentionally repeatable success response; HTTP does not require one universal second-response code.\n\nPATCH carries an update instruction format, not automatically a complete replacement. Setting a value can be idempotent; incrementing a value or appending to an array generally is not. A deterministic algorithm is not necessarily idempotent: increment-by-one is deterministic but changes the value on every repetition. Check the operation and its side effects, not just the method name.',
        },
        {
          title: 'Status codes guide clients; they are not universal automation rules',
          body: '| Status | Meaning to preserve | Common trap |\n| --- | --- | --- |\n| 200 | Successful response appropriate to the operation | Assuming it is always safe for a shared cache |\n| 201 | One or more resources created | Treating every successful POST as creation |\n| 202 | Accepted, not yet completed | Showing the work as already finished |\n| 204 | Success with no response content | Sending a JSON body anyway |\n| 304 | Conditional GET/HEAD can reuse a stored representation | Expecting a new representation body |\n| 400 | Broad request-related failure | Claiming it can only mean malformed JSON |\n| 401 | No valid authentication credential for this resource | Forgetting the authentication challenge |\n| 403 | The request is understood but forbidden | Assuming every 403 proves a successful login |\n| 409 / 412 | State conflict / failed HTTP precondition | Silently overwriting a newer version |\n| 422 | Supported content type and valid syntax, but unprocessable instructions | Assuming every API must use it for all validation |\n| 429 | A request-rate policy rejected the request | Retrying immediately in a tight loop |\n| 503 | Temporary inability to handle a request | Assuming a load balancer must automatically remove the instance |\n\nApiController commonly returns 400 for model validation by default. A documented 422 convention is also possible; consistency and client expectations matter. A 5xx result does not prove that no side effect happened, nor that an unlimited retry will help. Bound retry attempts, respect a total deadline, and check operation idempotency. Retry-After can contain a delay in seconds or an HTTP date. Load-balancer ejection and readiness behavior depend on configured health policies, not one magic status response.',
        },
        {
          title: 'REST, GraphQL, and gRPC: compare the contracts',
          body: '| Approach | Contract and common transport | Strength | Cost to examine |\n| --- | --- | --- | --- |\n| Resource-oriented HTTP API | URLs, methods, representations; JSON is common but not mandatory | Broad clients and familiar HTTP/cache tooling | Endpoint shape, versioning, and over/under-fetching |\n| GraphQL | A schema and client-selected fields; commonly over HTTP | Flexible data selection for varied UIs | Resolver authorization, N+1, query cost/depth, caching |\n| gRPC | Service methods and typed messages, commonly Protocol Buffers over HTTP/2 | Generated clients and streaming/service contracts | Browser integration, proxies, compatibility, observability |\n\nGraphQL selection can reduce unwanted response fields but does not guarantee cheap backend work or the absence of over-fetching inside resolvers. A deeply nested query can be expensive. Enforce resource authorization and suitable cost limits; batch resolver access deliberately.\n\ngRPC does not inherently provide GraphQL-style arbitrary field selection or eliminate over-fetching. Message design, field masks where appropriate, deadlines, and compatible schema evolution still matter. Browser clients often use gRPC-Web or another supported integration rather than assuming native gRPC transport works unchanged. Choose based on clients and operations, not a table claiming one protocol is always fastest or always secure.',
        },
      ],
      diagram: {
        title: 'An uncertain write outcome',
        source:
          'sequenceDiagram\n  participant Client\n  participant API\n  participant DB\n  Client->>API: POST + idempotency key\n  API->>DB: Save operation and result atomically\n  API--xClient: Response lost\n  Client->>API: Retry same key and payload\n  API-->>Client: Previously recorded result',
        caption:
          'Reliable deduplication needs storage and atomicity. A header name alone does not make POST safe to retry.',
      },
      example: {
        title: 'Read a task creation contract',
        filename: 'tasks.http',
        language: 'http',
        setup:
          'These requests describe the bundled TaskFlow API sample. Start that sample on localhost:5050 before sending them with an HTTP client. Use the actual returned ID for the second request.',
        code: 'POST http://localhost:5050/tasks\nContent-Type: application/json\n\n{"title":"Learn HTTP semantics"}\n\n###\n\nGET http://localhost:5050/tasks/1\nAccept: application/json',
        output:
          'POST -> 201 Created, Location: /tasks/{newId}\nGET with that newId -> 200 OK with the created task',
        explanation: [
          'Creation returns the identity of the new resource instead of making the client guess it.',
          'The shown /1 path assumes a fresh database; use the Location returned by your own request.',
          'The starter sample does not implement idempotency keys. Repeating its POST creates another task, exactly as its contract allows.',
        ],
      },
      traps: [
        {
          question: 'Must an idempotent request return an identical response every time?',
          answer:
            'No. The intended effect is idempotent. A repeated DELETE can leave the resource absent both times while returning different status codes.',
          warning: 'Response equality is not the definition of idempotency.',
        },
        {
          question: 'Are 401 and 403 the same?',
          answer:
            "No. 401 is an authentication challenge and generally includes an appropriate challenge header. 403 means the request is forbidden under the server's access policy.",
          warning:
            'Some systems intentionally hide resource existence with 404; document and test the policy.',
        },
        {
          question: 'Is every deterministic PATCH operation idempotent?',
          answer:
            'No. Incrementing a counter by one is deterministic, but repeating it changes the counter repeatedly. Idempotency depends on the intended repeated effect, including the operation contract, not merely deterministic code.',
          warning: 'Partial update and repeat-safe update are different properties.',
        },
      ],
      exercise: {
        title: 'Design a retry policy',
        brief: 'A client times out after creating a task and wants to retry automatically.',
        steps: [
          'Explain why the timeout does not prove failure.',
          'Choose whether duplicate task creation is acceptable.',
          'If not, define a durable idempotency-key contract and payload matching rule.',
        ],
        solution:
          'The server may have committed before the response was lost. A safe deduplication design stores the key, normalized request identity, and outcome atomically with the operation. Reuse of a key for a different payload must be rejected. A generic retry loop cannot invent those guarantees.',
      },
      quiz: {
        question:
          'Why can repeated DELETE requests return 204 and then 404 while remaining idempotent?',
        options: [
          '404 is always a success code',
          'Both leave the resource absent as the intended effect',
          'DELETE never reaches a server',
          'Idempotency applies only to JSON bodies',
        ],
        answer: 1,
        explanation:
          'Idempotency concerns the intended effect of repeating a request, not identical response messages. After either request, the resource remains absent.',
      },
      references: [
        {
          label: 'Web API design guidance',
          url: 'https://learn.microsoft.com/en-us/azure/architecture/best-practices/api-design',
        },
        {
          label: 'HTTP methods',
          url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Methods',
        },
        {
          label: 'HTTP semantics: methods, status codes, and conditions',
          url: 'https://www.rfc-editor.org/rfc/rfc9110.html',
        },
        {
          label: 'REST architectural constraints',
          url: 'https://roy.gbiv.com/pubs/dissertation/rest_arch_style.htm',
        },
      ],
    },
    {
      id: 'pagination-and-versioning',
      title: 'Pagination, filtering & API evolution',
      subtitle: 'Bound the work and let clients evolve without accidental breakage.',
      minutes: 28,
      tags: [
        'pagination',
        'offset',
        'cursor',
        'keyset',
        'versioning',
        'filtering',
        'sorting',
        'DTO',
      ],
      outcomes: [
        'Bound and validate list queries.',
        'Compare offset and cursor pagination.',
        'Recognize breaking contract changes.',
      ],
      sections: [
        {
          title: 'An unbounded list is a production risk',
          body: 'Returning every task works in a demo and fails as data grows. Bound page size, validate filters, select only needed columns, and use a stable ordering. A server-controlled maximum prevents a client from asking for a million rows in one response. Expensive count queries should be a deliberate part of the contract, not an automatic addition to every endpoint.\n\nWhitelist sortable fields and translate them to known query expressions. Never concatenate an arbitrary user-supplied column name or SQL fragment into a query. Even when values are parameterized, SQL identifiers and order expressions require a trusted mapping.',
        },
        {
          title: 'Offset and cursor solve different problems',
          body: 'Offset pagination uses Skip and Take, often expressed as page number and size. It is simple and supports jumping to a numbered page, but large offsets can be expensive. Concurrent inserts and deletes can cause repeated or skipped results across separate requests. A stable order helps but does not create a database snapshot across requests.\n\nKeyset pagination uses the last seen sort key, such as CreatedAt plus Id, to fetch the next segment. It can perform well with a matching index, but jumping to arbitrary page numbers is less natural. An opaque cursor may encode these keys; treat it as untrusted input and include the filter/order context when necessary. Base64 is encoding, not integrity protection.',
        },
        {
          title: 'A public contract lasts longer than one release',
          body: 'Removing a field, changing its meaning, tightening accepted input, or changing error behavior can break clients. Adding a field is often compatible, but strict client parsers or generated models may still impose constraints. Preserve semantic compatibility, not only JSON syntax.\n\nVersioning can use URLs, headers, or media types. None is universally best. A /v1 prefix does not automatically implement deprecation, coexistence, or a migration plan. Document support windows, monitor old-client usage, and test contract compatibility. Prefer additive evolution when possible and introduce a new version for real breaking changes.',
        },
      ],
      diagram: {
        title: 'A bounded query contract',
        source:
          'flowchart LR\n  request["page + pageSize + filters"] --> validate["Validate and cap"]\n  validate --> order["Stable ordering"]\n  order --> query["Bounded query"]\n  query --> dto["Items + pagination metadata"]',
        caption:
          'Validation and stable ordering belong before the query executes, especially when the source is a database.',
      },
      example: {
        title: 'A bounded in-memory list endpoint',
        filename: 'Program.cs',
        language: 'csharp',
        setup:
          'Complete web example with a fixed teaching dataset. Request /tasks?page=2&pageSize=3.',
        code: 'var builder = WebApplication.CreateBuilder(args);\nvar app = builder.Build();\nvar tasks = Enumerable.Range(1, 20)\n    .Select(id => new TaskResponse(id, $"Task {id}"))\n    .ToArray();\n\napp.MapGet("/tasks", (int? page, int? pageSize) =>\n{\n    int number = page ?? 1;\n    int size = pageSize ?? 10;\n    if (number is < 1 or > 10000 || size is < 1 or > 100)\n        return Results.BadRequest("Invalid pagination range.");\n\n    var items = tasks.OrderBy(task => task.Id)\n        .Skip((number - 1) * size).Take(size);\n    return Results.Ok(new { items, page = number, pageSize = size });\n});\napp.Run();\n\npublic record TaskResponse(int Id, string Title);',
        output:
          'Page 2 with size 3 contains task IDs 4, 5, and 6.\nPage 0 or pageSize 101 returns 400.',
        explanation: [
          'Explicit limits keep offset arithmetic and result size bounded.',
          'Ordering happens before Skip and Take so pages have a defined meaning.',
          'The example omits a total count intentionally. In a real API, use your consistent Problem Details error contract rather than this abbreviated text error.',
        ],
      },
      traps: [
        {
          question: 'Does OrderBy make offset pagination stable during concurrent writes?',
          answer:
            'It creates a deterministic ordering for each query, but inserts and deletes between requests can still shift offsets. A cross-request snapshot or keyset approach has different guarantees.',
          warning: 'Deterministic ordering and a consistent snapshot are not the same.',
        },
        {
          question: 'Is adding /v2 enough to version an API safely?',
          answer:
            'No. You need a contract, coexistence and deprecation policies, client migration guidance, and monitoring. The URL is only one version-selection mechanism.',
          warning: 'Semantic changes can break clients even when field names stay unchanged.',
        },
      ],
      exercise: {
        title: 'Design a cursor for task activity',
        brief: 'Tasks are ordered by creation time, but multiple tasks can share a timestamp.',
        steps: [
          'Add a unique tie-breaker to the sort.',
          'Define the next-page predicate using both keys.',
          'Specify what happens when filters change between cursor requests.',
        ],
        solution:
          'Order by CreatedAt and Id, and request rows after the last pair lexicographically. Include or validate relevant query context in the cursor contract. Use a matching index. A cursor does not itself prevent tampering or guarantee a historical snapshot.',
      },
      quiz: {
        question: 'Why include a unique tie-breaker in pagination ordering?',
        options: [
          'To bypass authorization',
          'To make rows with equal primary sort values order deterministically',
          'To encrypt the result',
          'To avoid all database indexes',
        ],
        answer: 1,
        explanation:
          'A timestamp or nonunique name alone may leave equal-valued rows without a stable relative order. Adding a unique ID makes ordering and cursor boundaries unambiguous.',
      },
      references: [
        {
          label: 'EF Core pagination',
          url: 'https://learn.microsoft.com/en-us/ef/core/querying/pagination',
        },
        {
          label: 'API implementation guidance',
          url: 'https://learn.microsoft.com/en-us/azure/architecture/best-practices/api-implementation',
        },
      ],
    },
    {
      id: 'openapi-and-clients',
      title: 'OpenAPI, documentation & typed clients',
      subtitle: 'Keep the published contract close to the behavior clients actually receive.',
      minutes: 22,
      tags: [
        'OpenAPI',
        'Swagger',
        'schema',
        'generated clients',
        'AddOpenApi',
        'MapOpenApi',
        'contract testing',
      ],
      outcomes: [
        'Distinguish OpenAPI from a documentation UI.',
        'Expose an environment-appropriate API document.',
        'Identify metadata gaps and generated-client limitations.',
      ],
      sections: [
        {
          title: 'A machine-readable API description',
          body: "OpenAPI describes paths, operations, parameters, request bodies, response shapes, and security requirements. Tooling can turn that description into documentation, client code, or contract checks. Swagger is associated with a family of tools and historical naming; it is not a synonym for every part of OpenAPI.\n\nAn interactive UI is a client that reads the description and can send requests. It is separate from generating or serving the OpenAPI document. ASP.NET Core's built-in OpenAPI support does not by itself mean a Swagger-style UI is installed.",
        },
        {
          title: 'Metadata must match runtime behavior',
          body: 'Typed results, response declarations, validation information, endpoint names, and summaries help tooling describe the contract. Metadata can still be wrong or incomplete, particularly for manually constructed responses, authorization edge cases, custom serializers, or exception paths. A beautiful schema does not prove the endpoint obeys it.\n\nVerify status codes, content types, optionality, nullability, and actual JSON names through integration tests. Be careful about exposing internal-only endpoints in a public document. A development-only document is useful locally; production exposure should be an explicit decision with appropriate access controls, not an accidental default.',
        },
        {
          title: 'Generated clients reduce repetition, not responsibility',
          body: 'A typed client can reduce serialization and route boilerplate. It does not automatically solve authentication, retries, cancellation, timeout budgets, or backward compatibility. Generated code is coupled to the document version and generator options. Review meaningful changes and pin the generation tool for repeatable builds.\n\nOpenAPI versions and generator support evolve. Select a document version your consumer tooling understands, rather than assuming every generator supports every schema feature. Keep examples free of real tokens and personal data. Later lessons cover HttpClientFactory and resilience for calling external services safely.',
        },
      ],
      diagram: {
        title: 'Contract and behavior must agree',
        source:
          'flowchart TB\n  endpoints["Endpoint code + metadata"] --> document["OpenAPI document"]\n  document --> docs["Documentation UI"]\n  document --> client["Generated client"]\n  tests["HTTP contract tests"] --> endpoints\n  tests --> document',
        caption:
          'The document helps consumers, but tests must compare it with real endpoint behavior.',
      },
      example: {
        title: 'Expose the built-in OpenAPI document',
        filename: 'Program.cs',
        language: 'csharp',
        setup:
          'In a net10.0 web project, add the compatible package with `dotnet add package Microsoft.AspNetCore.OpenApi --version 10.*`. Run in Development and request /openapi/v1.json.',
        code: 'var builder = WebApplication.CreateBuilder(args);\nbuilder.Services.AddOpenApi();\nvar app = builder.Build();\n\nif (app.Environment.IsDevelopment())\n    app.MapOpenApi();\n\napp.MapGet("/tasks/{id:int}", (int id) =>\n    TypedResults.Ok(new TaskResponse(id, "Document the API")))\n    .WithName("GetTask");\n\napp.Run();\n\npublic record TaskResponse(int Id, string Title);',
        output:
          '/openapi/v1.json -> OpenAPI JSON in Development\n/tasks/1 -> 200 with a TaskResponse',
        explanation: [
          'The package version must match the target framework major version.',
          'MapOpenApi serves a document, not an interactive Swagger UI.',
          'This tiny endpoint echoes the ID for schema demonstration. A production lookup must implement existence checks and document its 404 response.',
        ],
      },
      traps: [
        {
          question: 'Does AddOpenApi automatically add Swagger UI?',
          answer:
            'No. Built-in document generation and an interactive documentation interface are separate capabilities. A UI requires an appropriate additional integration.',
          warning: 'Do not diagnose a missing UI as proof that document generation failed.',
        },
        {
          question: 'Can generated clients eliminate integration tests?',
          answer:
            'No. Generation reflects the document, which can be incomplete or inaccurate. Network behavior, authentication, serialization, and error contracts still need verification.',
          warning: 'A compiler-valid client can still be incompatible with the server.',
        },
      ],
      exercise: {
        title: 'Audit a documented response',
        brief: 'Compare the generated schema for TaskResponse with a real GET response.',
        steps: [
          'Check property names and types.',
          'Add a 404 path to the endpoint and its metadata.',
          'Decide whether documentation should be public in production.',
        ],
        solution:
          'Verify camelCase JSON names, required/optional properties, and the documented response status set. Add explicit response metadata or typed result unions where appropriate. Keep production exposure deliberate; documentation is useful, but it can reveal internal API surface.',
      },
      quiz: {
        question: 'What does MapOpenApi primarily serve?',
        options: [
          'A relational database schema',
          'A machine-readable OpenAPI document',
          'An automatically authenticated admin panel',
          'A complete generated client app',
        ],
        answer: 1,
        explanation:
          'MapOpenApi maps an endpoint for the generated API document. An interactive UI or generated client consumes that document through separate tooling.',
      },
      references: [
        {
          label: 'OpenAPI in ASP.NET Core',
          url: 'https://learn.microsoft.com/en-us/aspnet/core/fundamentals/openapi/overview?view=aspnetcore-10.0',
        },
      ],
    },
    {
      id: 'caching-and-rate-limiting',
      title: 'Caching & rate limiting',
      subtitle:
        'Reduce repeated work without sharing private data or promising unlimited capacity.',
      minutes: 42,
      tags: [
        'output cache',
        'response cache',
        'Cache-Control',
        'rate limiter',
        '429',
        'ETag',
        'invalidation',
      ],
      outcomes: [
        'Distinguish response caching from server-controlled output caching.',
        'Design safe cache keys and expiry.',
        'Choose rate limits with correct scope and rejection behavior.',
      ],
      sections: [
        {
          title: 'Caches change correctness as well as speed',
          body: 'A cache stores a result for reuse. Before adding one, define the key, freshness requirement, invalidation rule, capacity, and behavior on a miss. A cache key must include every input that changes the result, including tenant or user context when caching personalized data. Accidentally sharing a private response is a security bug, not merely stale data.\n\nResponse caching follows HTTP caching semantics such as Cache-Control and client directives. Output caching lets the server control caching policies for endpoint output. In-memory object caches and distributed caches are different layers again. A browser cache, an API output cache, and a database query cache should not be treated as one interchangeable feature.',
        },
        {
          title: 'Protect the downstream capacity',
          body: "Rate limiting rejects or delays work when a policy's budget is exceeded. Fixed windows, sliding windows, token buckets, and concurrency limits control different dimensions. A concurrency limiter restricts in-flight work, not requests per minute. A per-user limiter depends on a trusted identity; a header supplied by any client is not automatically a reliable partition key.\n\nReturn a deliberate status such as 429 Too Many Requests and, when available and appropriate, retry information. Do not assume every limiter produces identical metadata. A limiter in one process does not automatically create a global budget across replicas. Edge protection and distributed coordination may also be necessary.",
        },
        {
          title: 'Pipeline order makes policy observable',
          body: "If rate limiting runs before output caching, cache hits can still count against the request budget. If a cache short-circuits before a limiter, its hits may bypass that limiter. Choose based on the threat and capacity model. Endpoint-specific policies need endpoint routing metadata before they execute.\n\nASP.NET Core's default output-cache policy avoids common unsafe cases such as authenticated responses and responses setting cookies, but custom policies can change those protections. Test user isolation, query variations, and invalidation. A short TTL reduces the stale window; it does not guarantee immediate freshness after a write.",
        },
        {
          title: 'Read Cache-Control precisely',
          body: '| Directive | Meaning |\n| --- | --- |\n| max-age=60 | A freshness lifetime, accounting for response age and applicable request rules |\n| s-maxage=60 | Freshness specifically for shared caches |\n| private | A private cache can store the response; a shared cache must not |\n| public | Permits shared storage under the remaining cache rules |\n| no-cache | Storage can be allowed, but validate before reuse |\n| no-store | Do not store the response in HTTP caches |\n| must-revalidate | Once stale, do not reuse without successful validation |\n\nA 200 response alone does not make personalized content safe to cache. Consider method semantics, authorization, directives, variants, and the cache implementation. Conversely, HTTP does define conditional caching of POST results: RFC 9110 requires explicit freshness and a Content-Location equal to the POST target for later GET/HEAD reuse. That does not mean a later POST can be skipped using the cached response, and many practical caches support only GET/HEAD.\n\nVary identifies request header dimensions that affect representation selection, such as Accept-Language or Accept-Encoding. Application cache keys must also account for the actual user/tenant/query inputs they depend on. No-store is a cache instruction, not an encryption mechanism or a promise to erase copies already retained elsewhere. Browser back/forward snapshots are also distinct from ordinary HTTP cache reuse.',
        },
        {
          title: 'ETags: revalidation versus lost-update protection',
          body: 'An ETag is an opaque representation validator, often a version identifier or content-derived value. It need not be a cryptographic hash. A strong tag distinguishes representation data under its defined contract; a weak tag begins with `W/` and allows semantic equivalence without byte-for-byte identity.\n\nA client holding a cached representation can send If-None-Match on GET. When a matching representation is still current and normal request checks allow access, the server returns 304 without a response body, and the cache updates/reuses its stored representation. If the representation changed, the server normally returns its new content and validator. If-None-Match uses weak comparison; If-Match uses strong comparison for the relevant conditional operation.\n\nDo not confuse revalidation with authorization. The server still performs normal access checks; possession of an old ETag does not grant access. For a write, evaluating If-Match must connect to an atomic database version check so another writer cannot slip between a separate check and update. A tag that ignores relevant response variants or changes is not a reliable validator.',
          diagram: {
            title: 'Revalidate an existing representation',
            source:
              'sequenceDiagram\n  participant Client as Client cache\n  participant API as API\n  Client->>API: GET catalog\n  API-->>Client: 200 + representation + ETag\n  Note over Client: Store under the cache policy\n  Client->>API: GET + If-None-Match\n  API-->>Client: 304 + updated metadata, no body\n  Note over Client: Reuse stored representation',
            caption:
              'This branch assumes the validator matches and access is permitted. A changed representation normally produces a new 200 response.',
          },
        },
        {
          title: 'Rate-limit headers and cache layers are implementation choices',
          body: 'X-RateLimit-Limit and X-RateLimit-Remaining are common conventions, not headers every framework limiter adds automatically. Review your chosen middleware/gateway contract. Send useful retry guidance when available; a rejected client should back off within a bounded policy rather than immediately amplify the load.\n\nBrowser caches, CDNs, reverse proxies, application/Redis caches, and database internals do not form a mandatory chain. SQL Server caches execution plans and data pages, which is not the same thing as caching every final SELECT result for the application. An in-process cache lookup and a remote CDN hit have different network and latency costs. Measure the actual layer, cache-hit ratio, stale behavior, and invalidation requirements before promising performance numbers.',
        },
      ],
      diagram: {
        title: 'A public endpoint budget',
        source:
          'flowchart LR\n  request["Request"] --> limit{"Budget available?"}\n  limit -->|No| reject["429"]\n  limit -->|Yes| cache{"Fresh cached output?"}\n  cache -->|Yes| hit["Cached response"]\n  cache -->|No| endpoint["Compute and cache"]',
        caption:
          'This policy counts cache hits against the limiter and caches only a deliberately public endpoint.',
      },
      example: {
        title: 'Cache a public catalog and bound requests',
        filename: 'Program.cs',
        language: 'csharp',
        setup:
          'Complete net10.0 web example. The named limiter has one shared application-instance budget, not a per-user or distributed budget.',
        code: 'using Microsoft.AspNetCore.RateLimiting;\n\nvar builder = WebApplication.CreateBuilder(args);\nbuilder.Services.AddOutputCache(options => options.AddPolicy("catalog",\n    policy => policy.Expire(TimeSpan.FromSeconds(30))));\nbuilder.Services.AddRateLimiter(options =>\n{\n    options.RejectionStatusCode = 429;\n    options.AddFixedWindowLimiter("public", limit =>\n    {\n        limit.PermitLimit = 10;\n        limit.Window = TimeSpan.FromMinutes(1);\n        limit.QueueLimit = 0;\n    });\n});\nvar app = builder.Build();\napp.UseRouting();\napp.UseRateLimiter();\napp.UseOutputCache();\napp.MapGet("/catalog", () => new { category = "Learning", generatedAt = DateTimeOffset.UtcNow })\n    .CacheOutput("catalog").RequireRateLimiting("public");\napp.Run();',
        output:
          'Within cache lifetime: generatedAt is reused.\nAfter exhausting the shared window budget: 429.',
        explanation: [
          'The cache policy applies to this public endpoint and expires after 30 seconds.',
          'The limiter runs first, so cache hits still consume permits.',
          'The fixed window and generated timestamps are time-dependent. Test the policy boundaries instead of expecting one fixed output string.',
        ],
      },
      additionalExamples: [
        {
          title: 'Read a conditional GET exchange',
          filename: 'conditional-get.http',
          language: 'http',
          setup:
            'Protocol illustration, not an executable script or a transcript from the starter API. Assume /catalog is a public endpoint implementing the stated cache policy and validator. The bundled starter does not implement this ETag contract.',
          code: 'GET /catalog HTTP/1.1\nHost: api.example.test\n\nHTTP/1.1 200 OK\nDate: Wed, 30 Sep 2026 10:00:00 GMT\nCache-Control: public, max-age=60\nETag: "catalog-v1"\nContent-Type: application/json\nContent-Length: 21\n\n{"category":"course"}\n\nGET /catalog HTTP/1.1\nHost: api.example.test\nIf-None-Match: "catalog-v1"\n\nHTTP/1.1 304 Not Modified\nDate: Wed, 30 Sep 2026 10:01:10 GMT\nCache-Control: public, max-age=60\nETag: "catalog-v1"',
          output:
            'The second response has no body. The client reuses the previously stored JSON after validation.',
          explanation: [
            'The second request is made after the illustrated freshness lifetime and carries the previously received validator.',
            'The matching 304 updates cache metadata without transferring the JSON again. A mismatching validator would take the changed-representation branch.',
            'The example uses a fixed ASCII JSON body with the stated byte length. Production framing and header parsing should be handled by the HTTP framework.',
          ],
        },
      ],
      traps: [
        {
          question: 'Is a short TTL enough to make user-specific caching safe?',
          answer:
            "No. A wrong cache key can expose another user's data immediately. Correct isolation and cache eligibility come before freshness tuning.",
          warning:
            'Never use cache speed as a reason to bypass authorization or tenant separation.',
        },
        {
          question: 'Does an in-process rate limit apply globally across ten replicas?',
          answer:
            'Not automatically. Each instance generally maintains its own state. A global budget needs an appropriate gateway or distributed design.',
          warning: 'Scaling out can multiply the effective aggregate limit.',
        },
        {
          question: 'Does Cache-Control: no-cache mean no response is stored?',
          answer:
            'No. It requires validation before reuse while storage can still be allowed. Use no-store when the intended HTTP cache policy is to prevent storing the response.',
          warning: 'The names sound similar, but they define different cache behavior.',
        },
      ],
      exercise: {
        title: 'Define a safe cache policy',
        brief: 'TaskFlow has a public category list and a private list of tasks per owner.',
        steps: [
          'Choose which endpoint is a simple output-cache candidate.',
          'List every varying input for the private list.',
          'Define invalidation behavior after a task update.',
        ],
        solution:
          'The public category list is the simpler candidate. Private task caching must account for authenticated identity, tenant, filters, sort, and pagination, while preserving authorization. Define invalidation or acceptable staleness explicitly. Do not disable protective defaults without tests for cross-user isolation.',
      },
      quiz: {
        question: 'What does a concurrency limiter primarily bound?',
        options: [
          'Total database rows forever',
          'Simultaneously active operations',
          'All requests across every replica automatically',
          'The age of a cache entry',
        ],
        answer: 1,
        explanation:
          'A concurrency limiter controls how many operations are in flight. That differs from a fixed-window request-count budget and from cache expiry.',
      },
      references: [
        {
          label: 'Output caching',
          url: 'https://learn.microsoft.com/en-us/aspnet/core/performance/caching/output?view=aspnetcore-10.0',
        },
        {
          label: 'Rate limiting',
          url: 'https://learn.microsoft.com/en-us/aspnet/core/performance/rate-limit?view=aspnetcore-10.0',
        },
        {
          label: 'Cache-Control directives',
          url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Cache-Control',
        },
        {
          label: 'HTTP conditional requests',
          url: 'https://www.rfc-editor.org/rfc/rfc9110.html#section-13',
        },
      ],
    },
  ],
}
