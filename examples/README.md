# TaskFlow Learning Starters

These original examples accompany .NET Atlas. They target **.NET 10** and use a sample-local public NuGet configuration. Install the .NET 10 SDK from Microsoft, then run the commands below from this directory. In the full website repository, prefix each project path with `examples/`.

## 1. C# Console Application

```powershell
dotnet run --project TaskFlow.Cli -- add "Learn C#"
dotnet run --project TaskFlow.Cli -- list
dotnet run --project TaskFlow.Cli -- complete 1
```

The CLI saves `taskflow.cli.json` in your current directory. `TASKFLOW_DATA_PATH` can select a different path. IDs are printed after creation. Titles are trimmed and limited to 120 UTF-16 code units. Invalid commands exit with code 2; file/data failures exit with code 1. A malformed data file is reported, not silently replaced.

This is a **single-user, one-process-at-a-time** file-store example. Temporary-file replacement reduces partial-write risk but is not a distributed transaction, a backup strategy, or a concurrent writer lock.

## 2. ASP.NET Core API

```powershell
dotnet run --project TaskFlow.Api -- --urls http://localhost:5050
```

In a second PowerShell terminal:

```powershell
$task = Invoke-RestMethod -Method Post -Uri http://localhost:5050/tasks -ContentType application/json -Body '{"title":"Learn ASP.NET Core"}'
Invoke-RestMethod -Uri "http://localhost:5050/tasks/$($task.id)"
Invoke-RestMethod -Method Put -Uri "http://localhost:5050/tasks/$($task.id)" -ContentType application/json -Body '{"title":"Learn ASP.NET Core","isComplete":true}'
Invoke-RestMethod -Uri 'http://localhost:5050/tasks?page=1&pageSize=10'
Invoke-RestMethod -Method Delete -Uri "http://localhost:5050/tasks/$($task.id)"
```

Stop the server with Ctrl+C.

| Method and path                 | Behavior                                                              |
| ------------------------------- | --------------------------------------------------------------------- |
| `GET /health`                   | Minimal process-health response; not a dependency readiness guarantee |
| `GET /tasks?page=1&pageSize=20` | Ordered, bounded list with `items`, `page`, and `pageSize`            |
| `GET /tasks/{id}`               | A task or a 404 Problem Details response                              |
| `POST /tasks`                   | Create from `{ "title": "..." }`; 201 and Location on success         |
| `PUT /tasks/{id}`               | Replace editable fields using title and a Boolean isComplete          |
| `DELETE /tasks/{id}`            | 204 when deleted, 404 when missing                                    |

The default SQLite database is `taskflow.db` under the API content root. Override `ConnectionStrings:Tasks` through configuration, for example with `ConnectionStrings__Tasks` as an environment variable. Page numbers are limited to 1-10000; page sizes to 1-100. Titles are required after trimming and limited to 120 UTF-16 code units. Server-owned IDs cannot be set through create/update DTOs.

### Important Boundaries

- This is an **anonymous, local learning API**. Do not expose it publicly with private data.
- It does not implement login, ownership, tenant isolation, idempotency keys, optimistic concurrency, or a frontend.
- It deliberately uses `EnsureCreated` for a demo database. Do not mix this database with migrations. Move to a fresh, reviewed migrations-managed database or plan an explicit transition before production.
- SQLite ignores some schema facets such as a maximum-length declaration; the application explicitly validates titles.
- Loopback HTTP simplifies local learning. Production needs an appropriate HTTPS and trusted-proxy setup.
- The website's HTTP sandbox is a separate JavaScript model, not this server. It uses an array list response and no pagination to keep the simulation focused.

## 3. Integration Tests

```powershell
dotnet test TaskFlow.Api.Tests -c Release
```

Each factory creates its own SQLite in-memory connection. Tests exercise real HTTP routing, binding, validation, serialization, persistence, pagination, and CRUD behavior. They never intentionally touch the demo file database. These tests do not verify production hosting, TLS, identity, or another relational provider.

## Next Milestones

1. Add a concurrency token and test two stale writers.
2. Integrate a trusted identity provider and enforce owner/tenant access on every operation.
3. Add negative authorization tests that also verify unchanged database state.
4. Plan migrations, safe configuration, structured telemetry, and deployment smoke tests.
5. Rehearse backup restoration and document actual recovery results.

The application project workbench contains the detailed acceptance criteria and links to the corresponding lessons. Completion is self-reported; it is not a production-readiness certification.
