import type { Chapter } from '../types'

export const data: Chapter = {
  id: 'data',
  title: 'SQL & Entity Framework Core',
  description: 'Persist the right data and understand the queries your application sends.',
  level: 'Intermediate',
  accent: 'gold',
  lessons: [
    {
      id: 'sql-and-relational-data',
      title: 'Relational data, SQL & indexes',
      subtitle: 'Learn the database model before asking an ORM to hide its syntax.',
      minutes: 65,
      tags: [
        'SQL',
        'primary key',
        'foreign key',
        'JOIN',
        'index',
        'normalization',
        'NULL',
        'ACID',
        'CTE',
        'window functions',
        'ROW_NUMBER',
        'RANK',
        'DENSE_RANK',
        'LAG',
        'LEAD',
        'TRUNCATE',
        'DROP',
        'BCNF',
      ],
      outcomes: [
        'Model tables, keys, and relationships.',
        'Read joins and parameterized queries.',
        'Explain index benefits and write costs.',
      ],
      sections: [
        {
          title: 'Tables express relationships and constraints',
          body: 'A relational table stores rows with defined columns. A primary key identifies a row. A foreign key references a candidate key in another table and can enforce referential integrity. A unique constraint protects a uniqueness rule even when multiple application requests race. Application validation alone cannot guarantee uniqueness under concurrency.\n\nNormalization reduces avoidable duplication and update anomalies. TaskFlow can store a project once and reference its ID from many tasks rather than copying the project name into every task. Denormalization can help measured read workloads, but introduces consistency work. It should be a deliberate tradeoff, not the default response to a slow query.',
        },
        {
          title: 'Queries combine, filter, and aggregate',
          body: 'SELECT chooses columns, WHERE filters rows, JOIN combines related rows, GROUP BY forms groups, and HAVING filters those groups. INNER JOIN keeps matching rows; LEFT JOIN also preserves left-side rows without a match, using nulls for the missing right side. Putting a right-side condition in WHERE can accidentally remove those unmatched rows.\n\nSQL NULL represents missing or unknown data and uses three-valued logic. Use IS NULL rather than = NULL. COUNT(*) counts rows; COUNT(column) excludes null values in that column. Always parameterize untrusted values. Parameters do not directly stand in for table or column identifiers, so dynamic identifiers need a trusted whitelist.',
        },
        {
          title: 'Indexes serve particular access patterns',
          body: 'An index can reduce the data scanned for a filter or ordering, but consumes storage and adds maintenance work to writes. Composite index column order matters. A function applied to an indexed column can prevent a straightforward seek, depending on the database and index design. Inspect the execution plan and realistic data distribution before deciding.\n\nTransactions provide atomicity, consistency under declared constraints, isolation, and durability according to the database configuration. Isolation levels change which concurrent effects are visible. A transaction does not automatically make incorrect business logic correct. SQLite, SQL Server, and PostgreSQL have different features and concurrency behavior, so test on the actual production engine where it matters.',
        },
        {
          title: 'Join types and the number of rows they produce',
          body: '| Join | Rows retained | TaskFlow example |\n| --- | --- | --- |\n| INNER | Matching combinations only | Tasks with a matching project |\n| LEFT | Every left row, with NULLs for missing right-side data | All projects, including empty ones |\n| RIGHT | Every right row | The same relationship with the preserved side reversed |\n| FULL OUTER | Matched rows and unmatched rows from either side | Reconcile two imported project lists |\n| CROSS | Every left/right combination | Generate every member/day planning combination |\n| SELF | A table referenced twice with different aliases | Match a member to their manager |\n\nA self join is a use of an ordinary join, not a separate SQL keyword. Use a LEFT self join when top-level managers must remain in the result. A join does not promise one output row per left row: joining one project to five tasks produces five matching rows. This is why COUNT(*) after a join may count task combinations rather than projects.\n\nCheck engine support before copying syntax. SQL Server supports the join types above. Older SQLite versions lack RIGHT/FULL joins; the SQLite version embedded in a tool matters. For every join, state the desired row meaning first: one row per task, per project, or per assignment. Then check whether the keys and join predicate preserve that meaning.',
        },
        {
          title: 'Normalization from 1NF to BCNF',
          body: 'A **functional dependency** means one set of attributes determines another. If each MemberId identifies exactly one member name, MemberId determines MemberName. A candidate key is a minimal set that identifies a row; a superkey identifies a row but may contain unnecessary extra attributes.\n\n| Form | Rule to explain | Example of a problem |\n| --- | --- | --- |\n| 1NF | Use values atomic for the chosen model and avoid repeating groups | A comma-separated list of task IDs in one assignment cell |\n| 2NF | In 1NF, no non-prime attribute depends on only part of a candidate key | In Assignment(TaskId, MemberId), TaskTitle depends only on TaskId |\n| 3NF | For every nontrivial dependency, the determinant is a superkey or the dependent attribute is prime | Storing ProjectName through ProjectId on every task creates an avoidable transitive dependency |\n| BCNF | Every determinant of a nontrivial dependency is a superkey | A dependency with a non-key determinant, even in some 3NF relations |\n\nAn attribute is **prime** when it belongs to at least one candidate key. The common 3NF shortcut, "the key, the whole key, and nothing but the key," is useful for ordinary examples, but the formal rule handles multiple candidate keys. BCNF requires a **superkey**, not necessarily a minimal candidate key.\n\nFor TaskFlow, put task facts in Tasks, member facts in Members, and assignment facts such as allocated hours in Assignments. A decomposition should be lossless: joining it back must not invent or lose facts. Also check whether important dependencies can still be enforced conveniently. Denormalization is an intentional read/performance tradeoff with a consistency plan, not an automatic improvement.',
        },
        {
          title: 'Logical query order, grouping, and NULL',
          body: 'A useful logical reading order is FROM/JOIN and their matching conditions, WHERE, GROUP BY, HAVING, SELECT, DISTINCT, ORDER BY, then the applicable row-limiting operation. This explains why a SELECT alias usually cannot be referenced in WHERE in SQL Server: the alias is not yet part of that logical stage. It is **not** the physical execution plan. The optimizer can reorder operations while preserving the query semantics.\n\nWHERE filters input rows; HAVING filters formed groups. Aggregate functions such as SUM, AVG, MIN, MAX, and COUNT summarize rows. Most aggregates ignore NULL inputs; COUNT(*) counts rows, while COUNT(expression) counts non-NULL expression values. An all-NULL SUM is generally NULL, not automatically zero.\n\n`value = NULL` normally evaluates to UNKNOWN under modern SQL Server NULL semantics, not simply false. WHERE retains TRUE rows, so those UNKNOWN results are excluded. Use IS NULL and IS NOT NULL. COALESCE chooses the first non-NULL argument; NULLIF returns NULL when two expressions compare equal. For example, `1.0 * Completed / NULLIF(Total, 0)` avoids division by zero but leaves the business meaning of a missing ratio for you to decide.\n\nISNULL is SQL Server-specific and is not completely interchangeable with COALESCE: result type and metadata rules differ. LIMIT is not SQL Server syntax. Use TOP, or ORDER BY with OFFSET/FETCH, as appropriate. For a portable exercise, name the database dialect before presenting a query.',
        },
        {
          title: 'CTEs and window functions: keep rows, add context',
          body: 'A **common table expression**, or CTE, names a query expression for the statement immediately following WITH. It is not automatically a persisted table, a reusable session variable, or a performance optimization. SQL Server may inline it, re-evaluate parts of it, or introduce physical plan operators; do not assume it is materialized once. Recursive CTEs can express hierarchies, but need a termination rule and cycle/depth safeguards.\n\nA window function calculates across related rows **without collapsing each group into one row**. PARTITION BY restarts the calculation per group. ORDER BY inside OVER defines the window order; a final ORDER BY still controls displayed output.\n\n| Function | For estimates 8, 8, 3 in descending order | Meaning |\n| --- | --- | --- |\n| ROW_NUMBER | 1, 2, 3 | Unique positions; add a stable tie-breaker |\n| RANK | 1, 1, 3 | Equal values share a rank; gaps follow ties |\n| DENSE_RANK | 1, 1, 2 | Equal values share a rank; no gaps |\n| LAG / LEAD | Previous / next row in the stated order | Compare neighboring observations |\n\nUse a unique ID as an additional ROW_NUMBER ordering key when deterministic positions matter. Do **not** add that unique ID to the RANK/DENSE_RANK order when the intention is to preserve equal-estimate ties. For a running total, an explicit `ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW` frame avoids unintentionally grouping peers through a default RANGE frame.\n\nTo find the second-highest **distinct** estimate, rank by estimate with DENSE_RANK, then filter rank 2 in an outer query or CTE. If you want all tied tasks, return their rows; if you want one estimate value, select it distinctly. Fewer than two distinct values means no such result. To find duplicate non-null emails, use WHERE Email IS NOT NULL, GROUP BY Email, and HAVING COUNT(*) > 1; decide first whether casing and whitespace make addresses equivalent.',
          diagram: {
            title: 'Grouping collapses rows; windows preserve them',
            source:
              'flowchart LR\n  rows["Task rows: 8, 8, 3 hours"] --> grouped["GROUP BY project"]\n  grouped --> summary["One row: total 19"]\n  rows --> window["DENSE_RANK by estimate"]\n  window --> ranked["Three rows: ranks 1, 1, 2"]',
            caption:
              'A window calculation adds context to each row. GROUP BY instead changes the result to one row per group.',
          },
        },
        {
          title: 'DELETE, TRUNCATE, DROP, and SQL command families',
          body: 'DDL describes structure operations such as CREATE, ALTER, and DROP. DML describes row manipulation such as INSERT, UPDATE, and DELETE; some teaching schemes classify SELECT separately as DQL. DCL names permission operations such as GRANT and REVOKE; transaction-control statements include BEGIN TRANSACTION, COMMIT, ROLLBACK, and SAVE TRANSACTION in SQL Server. These are teaching categories, not a reliable predictor of rollback behavior.\n\n| SQL Server operation | Row filter? | Table remains? | Transaction and identity behavior |\n| --- | --- | --- | --- |\n| DELETE | WHERE is available | Yes | Can roll back before commit; normally does not reset identity |\n| TRUNCATE TABLE | No per-row WHERE | Yes | Can roll back inside an explicit transaction; resets identity under its documented rules |\n| DROP TABLE | No | No | Supported table drops can roll back inside an explicit transaction |\n\nThe reference PDF marks TRUNCATE and DROP as never rollback-capable. **That is not correct for SQL Server.** Other engines and cloud warehouse variants have different DDL/transaction behavior; MySQL commonly performs implicit commits around DDL, and SQLite has no TRUNCATE TABLE statement. Never generalize one engine table to every SQL product.\n\nTRUNCATE uses allocation-level logging rather than logging individual row deletions; "less logging" does not mean "no logging." It also has permission, foreign-key, and feature restrictions and does not fire ordinary DELETE triggers. None of these statements should be tried against valuable data just to see what happens. Practice destructive commands only in an isolated disposable database, with the engine and transaction state explicit.',
        },
        {
          title: 'SQL Server index and transaction interview traps',
          body: 'In a rowstore SQL Server table, a clustered index stores table rows at its leaf level in key order. The table can have one clustered index, or be a heap with none. This does not promise contiguous disk placement or ordered query output: use ORDER BY for an output guarantee. A nonclustered index is a separate structure whose row locator depends on whether the base table is clustered or a heap.\n\nA composite key such as (ProjectId, IsComplete, Id) should match real predicates and ordering. A unique index enforces a uniqueness rule as well as providing an access path. Included non-key columns can cover a query without becoming ordering keys. An index seek is not automatically better than every scan: the useful plan depends on the number of rows, lookups, statistics, and cost.\n\nACID isolation does not mean transactions can never affect each other. Isolation levels deliberately choose which anomalies are allowed. SQL Server READ COMMITTED with locking prevents dirty reads but can still allow later statements to observe changed data; READ_COMMITTED_SNAPSHOT changes read implementation to statement-level versioned reads. SNAPSHOT and SERIALIZABLE provide different guarantees and costs.\n\nA **deadlock** is a cycle of transactions waiting on resources held by each other. Ordinary blocking can be a one-way wait without a cycle. SQL Server chooses a deadlock victim, rolls its transaction back, and reports error 1205. Inspect the deadlock graph, use a consistent resource-access order, keep transactions short, and index relevant access paths. A bounded retry of the whole replay-safe transaction may help; retrying just the final statement can violate the business operation.',
        },
      ],
      diagram: {
        title: 'A project owns many tasks',
        source:
          'erDiagram\n  PROJECT ||--o{ TASK : contains\n  PROJECT {\n    int Id PK\n    string Name\n  }\n  TASK {\n    int Id PK\n    int ProjectId FK\n    string Title\n    bool IsComplete\n  }',
        caption:
          'The foreign key expresses the relationship; database constraints protect it across concurrent callers.',
      },
      example: {
        title: 'Create and query a small relational model',
        filename: 'taskflow.sql',
        language: 'sql',
        setup:
          'Run once in a fresh SQLite database using an SQLite client. PRAGMA enables foreign-key enforcement for this connection.',
        code: "PRAGMA foreign_keys = ON;\nCREATE TABLE Projects (\n    Id INTEGER PRIMARY KEY,\n    Name TEXT NOT NULL\n);\nCREATE TABLE Tasks (\n    Id INTEGER PRIMARY KEY,\n    ProjectId INTEGER NOT NULL REFERENCES Projects(Id),\n    Title TEXT NOT NULL,\n    IsComplete INTEGER NOT NULL DEFAULT 0\n);\nCREATE INDEX IX_Tasks_ProjectId ON Tasks(ProjectId);\nINSERT INTO Projects VALUES (1, 'Learn .NET');\nINSERT INTO Tasks (ProjectId, Title) VALUES (1, 'Understand joins');\n\nSELECT Projects.Name, Tasks.Title\nFROM Projects\nJOIN Tasks ON Tasks.ProjectId = Projects.Id\nWHERE Projects.Id = 1;",
        output: 'Learn .NET | Understand joins',
        explanation: [
          'NOT NULL protects required storage fields, but it does not reject an empty title; business validation is still needed.',
          'The foreign key prevents a task from pointing to an unknown project when enforcement is enabled.',
          'The literal ID is fixed teaching data. Application-supplied values should be sent as parameters, never pasted into SQL text.',
        ],
      },
      additionalExamples: [
        {
          title: 'Rank task estimates without losing ties',
          filename: 'task-rankings.sql',
          language: 'sql',
          setup:
            'Self-contained read-only query. This syntax works in SQL Server and SQLite 3.25 or later. The CTE supplies all sample rows, so no application tables are needed.',
          code: 'WITH TaskEstimates(TaskId, ProjectId, EstimatedHours) AS (\n    SELECT 1, 10, 8\n    UNION ALL SELECT 2, 10, 8\n    UNION ALL SELECT 3, 10, 3\n)\nSELECT TaskId, EstimatedHours,\n    ROW_NUMBER() OVER (PARTITION BY ProjectId ORDER BY EstimatedHours DESC, TaskId) AS Position,\n    RANK() OVER (PARTITION BY ProjectId ORDER BY EstimatedHours DESC) AS GappedRank,\n    DENSE_RANK() OVER (PARTITION BY ProjectId ORDER BY EstimatedHours DESC) AS DistinctRank,\n    LAG(EstimatedHours) OVER (PARTITION BY ProjectId ORDER BY TaskId) AS PreviousHours,\n    LEAD(EstimatedHours) OVER (PARTITION BY ProjectId ORDER BY TaskId) AS NextHours,\n    SUM(EstimatedHours) OVER (PARTITION BY ProjectId ORDER BY TaskId\n        ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS RunningHours\nFROM TaskEstimates\nORDER BY TaskId;',
          output:
            'TaskId | EstimatedHours | Position | GappedRank | DistinctRank | PreviousHours | NextHours | RunningHours\n1 | 8 | 1 | 1 | 1 | NULL | 8 | 8\n2 | 8 | 2 | 1 | 1 | 8 | 3 | 16\n3 | 3 | 3 | 3 | 2 | 8 | NULL | 19',
          explanation: [
            'The two eight-hour tasks share rank 1. RANK skips to 3 afterward; DENSE_RANK moves to 2.',
            'TaskId breaks ties for ROW_NUMBER only. Adding it to the other ranking orders would make the equal estimates stop tying.',
            'LAG, LEAD, and the running total use task-ID order, not ranking order. An absent neighboring row produces NULL by default.',
          ],
        },
        {
          title: 'Find the second-highest distinct estimate',
          filename: 'second-highest-estimate.sql',
          language: 'sql',
          setup:
            'Self-contained read-only SQL Server / SQLite 3.25+ query. It returns a distinct estimate, not every task tied at that estimate. No existing database tables are required.',
          code: 'WITH TaskEstimates(TaskId, EstimatedHours) AS (\n    SELECT 1, 8\n    UNION ALL SELECT 2, 8\n    UNION ALL SELECT 3, 3\n    UNION ALL SELECT 4, 3\n), Ranked AS (\n    SELECT EstimatedHours,\n        DENSE_RANK() OVER (ORDER BY EstimatedHours DESC) AS EstimateRank\n    FROM TaskEstimates\n)\nSELECT DISTINCT EstimatedHours\nFROM Ranked\nWHERE EstimateRank = 2;',
          output: 'EstimatedHours\n3',
          explanation: [
            'The outer query can filter the window result after it has been computed.',
            'DISTINCT makes the requested output one estimate value. To return all tied tasks instead, carry TaskId through Ranked and return the task rows.',
            'If there is only one distinct non-null estimate, no rank 2 exists. Define how your API represents that absence.',
          ],
        },
        {
          title: 'Detect duplicate non-null email values',
          filename: 'duplicate-emails.sql',
          language: 'sql',
          setup:
            'Self-contained read-only SQL Server / SQLite query. Sample values are already normalized; a real application must choose and enforce a normalization and collation policy.',
          code: "WITH Members(MemberId, Email) AS (\n    SELECT 1, 'member@example.test'\n    UNION ALL SELECT 2, 'member@example.test'\n    UNION ALL SELECT 3, 'other@example.test'\n    UNION ALL SELECT 4, NULL\n)\nSELECT Email, COUNT(*) AS Occurrences\nFROM Members\nWHERE Email IS NOT NULL\nGROUP BY Email\nHAVING COUNT(*) > 1\nORDER BY Email;",
          output: 'Email | Occurrences\nmember@example.test | 2',
          explanation: [
            'WHERE removes missing emails before grouping. HAVING keeps only groups with multiple members.',
            'Case sensitivity depends on the database collation and expression. Do not assume the same query has identical string-equality semantics on every engine.',
            'Detection is not prevention. Add an appropriate database uniqueness constraint when the business rule forbids duplicates.',
          ],
        },
      ],
      traps: [
        {
          question: 'Does adding an index always make the database faster?',
          answer:
            "No. It can improve matching read patterns while adding write, storage, and maintenance costs. Its usefulness depends on query shape, selectivity, and the optimizer's plan.",
          warning: 'More indexes are not a substitute for inspecting the slow query.',
        },
        {
          question: 'Does NOT NULL reject an empty string?',
          answer:
            'Not in the ordinary SQL semantics used here. Null and an empty string are different values. Add a suitable constraint or domain validation if blank content is forbidden.',
          warning: 'Required storage and valid business content are different rules.',
        },
        {
          question: 'Can TRUNCATE TABLE be rolled back in SQL Server?',
          answer:
            'Yes, within a supported explicit transaction before commit. SQL Server logs enough information to roll it back. Rollback behavior is database-specific, so a universal DELETE/TRUNCATE/DROP table is misleading.',
          warning:
            'Do not confuse allocation-level logging with an operation being unlogged or irreversible.',
        },
        {
          question: 'Should a unique ID be added to every ranking window?',
          answer:
            'Use a tie-breaker for deterministic ROW_NUMBER positions. Adding a unique ID to RANK or DENSE_RANK also changes which rows count as ties, which can break a second-highest-distinct-value query.',
          warning: 'The second row and the second distinct value are different questions.',
        },
      ],
      exercise: {
        title: 'Preserve projects with no tasks',
        brief: 'Change the query to list every project, including projects that have no tasks.',
        steps: [
          'Use a LEFT JOIN.',
          'Add a project with no tasks and inspect null task columns.',
          'Explain how a task-side WHERE condition can change the result.',
        ],
        solution:
          'Start from Projects and LEFT JOIN Tasks. Unmatched projects remain with null task columns. A WHERE Tasks.IsComplete = 0 condition removes those null rows; place suitable relationship filtering in the join condition or explicitly account for missing tasks, depending on the intended result.',
      },
      quiz: {
        question: 'Which constraint protects a unique business key even when requests race?',
        options: [
          'A client-side form check',
          'A database unique constraint',
          'A CSS required indicator',
          'A SELECT before every INSERT without a constraint',
        ],
        answer: 1,
        explanation:
          'A database unique constraint enforces the invariant across concurrent writers. A pre-insert check can improve feedback, but two requests can both pass it before either inserts.',
      },
      references: [
        {
          label: 'Relational data concepts',
          url: 'https://learn.microsoft.com/en-us/training/modules/explore-relational-data-offerings/',
        },
        {
          label: 'SQL Server index design',
          url: 'https://learn.microsoft.com/en-us/sql/relational-databases/sql-server-index-design-guide',
        },
        {
          label: 'SQL Server TRUNCATE TABLE',
          url: 'https://learn.microsoft.com/en-us/sql/t-sql/statements/truncate-table-transact-sql',
        },
        {
          label: 'SQL Server window functions and OVER',
          url: 'https://learn.microsoft.com/en-us/sql/t-sql/queries/select-over-clause-transact-sql',
        },
        {
          label: 'SQL Server common table expressions',
          url: 'https://learn.microsoft.com/en-us/sql/t-sql/queries/with-common-table-expression-transact-sql',
        },
      ],
    },
    {
      id: 'ef-core-and-migrations',
      title: 'EF Core, DbContext & migrations',
      subtitle: 'Map your objects to a database without forgetting what the database does.',
      minutes: 43,
      tags: [
        'EF Core',
        'DbContext',
        'DbSet',
        'migrations',
        'EnsureCreated',
        'change tracker',
        'SQLite',
      ],
      outcomes: [
        'Explain the context and change tracker.',
        'Persist entities using a provider.',
        'Distinguish schema migrations from EnsureCreated.',
      ],
      sections: [
        {
          title: 'An ORM translates between models',
          body: 'Entity Framework Core is an object-relational mapper, or ORM. It maps .NET types to relational storage and translates supported LINQ queries into database commands. A provider supplies engine-specific behavior, such as SQLite or SQL Server support. The context is a short-lived unit of work with a change tracker, not a global database connection singleton.\n\nDbSet represents access to an entity type. Adding an entity to a set normally tracks it as Added; SaveChanges sends the required commands. A query can execute immediately when materialized even if you never call SaveChanges. Reading and writing have different execution triggers.',
        },
        {
          title: 'Track changes within a clear lifetime',
          body: 'A tracked entity carries state in the context. After loading it, changing a property, and calling SaveChangesAsync, EF can issue an update. A context can also resolve repeated tracked entities to the same instance within its tracking scope. This helps consistency inside a unit of work, but a long-lived context can retain stale data and excessive state.\n\nDbContext is not thread-safe. Await one operation before starting another on the same instance. In ASP.NET Core, AddDbContext normally registers a scoped context. The lifetime should fit one coherent operation, not an entire user session or the application lifetime.',
        },
        {
          title: 'Schema evolution is a deployment concern',
          body: 'Migrations record model changes as versioned schema operations. Generate a migration, review the generated code or SQL, test it on representative data, and deploy it through a controlled process. A migration that drops a column can destroy data even when it builds successfully.\n\nEnsureCreated creates a schema for simple disposable scenarios and bypasses the migrations history model. Do not create a database with EnsureCreated and later assume migrations can manage it seamlessly. The example uses an in-memory database deliberately. For durable TaskFlow development, choose migrations from the beginning, keep backups, and coordinate schema changes with compatible application releases.',
        },
        {
          title: 'Code-first versus database-first: who owns the schema?',
          body: 'In a migrations-driven workflow, the EF model and migration history are reviewed with the application. In a database-first workflow, an existing schema is inspected by `dotnet ef dbcontext scaffold` to generate mapped types and a context. Neither workflow makes C# or SQL universally the better source of truth. A shared database managed by a DBA team has different ownership constraints from a new service with its own database.\n\nReverse engineering can overwrite generated files when forced. Keep custom behavior in separate partial classes and use supported partial hooks rather than editing generated code that will be replaced. Scaffold only authorized schemas/tables, review the result, and avoid embedding credentials in generated OnConfiguring code. A configuration-name connection reference and `--no-onconfiguring` help keep secrets outside generated source.\n\nMigration generation compares the current model with the prior model snapshot; it does not prove that every live database matches that snapshot. Review scripts, especially renames that might be inferred as drop/add. Removing the last unapplied migration is different from undoing a deployed schema change. Do not remove shared migration history without coordinating how existing databases will move forward.',
        },
        {
          title: 'Connections, FindAsync, and operations that bypass SaveChanges',
          body: 'Connection strings identify a server and database and configure authentication and transport. `GetConnectionString("Tasks")` reads the ConnectionStrings:Tasks configuration key. Keep secrets in appropriate external configuration, and never log a full connection string. For SQL Server, `Encrypt=True;TrustServerCertificate=False` expresses encrypted transport with certificate validation; overriding validation to make a local connection work is not a production security solution.\n\nEF Core normally opens and closes a connection around an operation as needed, but applications can explicitly open, supply, or share a connection. The owner must manage that lifetime. Connection pooling and DbContext pooling are separate optimizations. A context is not one permanently open connection.\n\nFindAsync checks the context for an already-tracked entity with the key before querying. FirstOrDefaultAsync runs its query; ToListAsync materializes the composed query, not necessarily every row in the table. Add usually records a new tracked entity without database I/O; AddAsync is mainly needed for particular asynchronous value generators.\n\nSaveChanges persists **tracked changes**. Reads execute when queried, and ExecuteUpdateAsync, ExecuteDeleteAsync, and database SQL execution APIs send commands without waiting for a later SaveChanges. These set-based operations do not automatically synchronize already-tracked entities. Reload or isolate the unit of work so stale tracked state does not overwrite their effects.',
        },
      ],
      diagram: {
        title: 'From tracked changes to SQL',
        source:
          'flowchart LR\n  entity["Entity changes"] --> tracker["DbContext change tracker"]\n  tracker --> save["SaveChangesAsync"]\n  save --> provider["Relational provider"]\n  provider --> db["Database commands"]',
        caption:
          'Tracking changes is not the same as committing them. The provider controls engine-specific behavior.',
      },
      example: {
        title: 'Persist a task in an isolated database',
        filename: 'Program.cs',
        language: 'csharp',
        setup:
          'Create a net10.0 console project and add `Microsoft.EntityFrameworkCore.Sqlite --version 10.*` with dotnet add package. The open in-memory connection keeps this demo database alive only for the example.',
        code: 'using Microsoft.Data.Sqlite;\nusing Microsoft.EntityFrameworkCore;\n\nawait using var connection = new SqliteConnection("Data Source=:memory:");\nawait connection.OpenAsync();\nvar options = new DbContextOptionsBuilder<TaskDbContext>()\n    .UseSqlite(connection).Options;\nawait using var db = new TaskDbContext(options);\nawait db.Database.EnsureCreatedAsync();\ndb.Tasks.Add(new TaskItem { Title = "Learn persistence" });\nawait db.SaveChangesAsync();\nConsole.WriteLine(await db.Tasks.CountAsync());\n\npublic sealed class TaskDbContext(DbContextOptions<TaskDbContext> options) : DbContext(options)\n{\n    public DbSet<TaskItem> Tasks => Set<TaskItem>();\n}\n\npublic sealed class TaskItem\n{\n    public int Id { get; set; }\n    public string Title { get; set; } = "";\n    public bool IsComplete { get; set; }\n}',
        output: '1',
        explanation: [
          'An open SQLite connection preserves this in-memory database across context commands.',
          'SaveChangesAsync writes the tracked new entity, and CountAsync executes a separate query.',
          'EnsureCreated is appropriate for this throwaway example, not an instruction to replace production migrations.',
        ],
      },
      additionalExamples: [
        {
          title: 'Reverse-engineer a selected SQL Server table',
          filename: 'scaffold-taskflow.ps1',
          language: 'bash',
          setup:
            'Run from an existing net10.0 application project with a configured design-time host. Configure ConnectionStrings:Tasks externally with a development account authorized to inspect the intended SQL Server schema. These commands require a reachable database; they do not create or install SQL Server.',
          code: 'dotnet new tool-manifest\ndotnet tool install dotnet-ef --version 10.*\ndotnet add package Microsoft.EntityFrameworkCore.SqlServer --version 10.*\ndotnet add package Microsoft.EntityFrameworkCore.Design --version 10.*\ndotnet ef dbcontext scaffold "Name=ConnectionStrings:Tasks" Microsoft.EntityFrameworkCore.SqlServer --context ImportedTaskContext --context-dir Data/Generated --output-dir Models/Generated --table dbo.Tasks --no-onconfiguring',
          explanation: [
            'Create a tool manifest only if the project does not already have one. Matching EF tool/provider major versions keeps the design-time setup coherent.',
            'The Name= form resolves a configured connection string instead of putting a password in command history. No real credential belongs in a shared example.',
            'The selected table and separate generated folders bound the operation. Do not add --force until you understand and have protected the files it will replace.',
          ],
        },
      ],
      traps: [
        {
          question: 'Is DbContext thread-safe because its methods are async?',
          answer:
            'No. Async APIs avoid blocking; they do not allow concurrent operations on the same context. Use separate appropriate contexts for independent concurrent work.',
          warning: 'Task.WhenAll over queries on one context is a common failure pattern.',
        },
        {
          question: 'Can EnsureCreated and migrations be mixed casually?',
          answer:
            'No. EnsureCreated bypasses migration history and is intended for different scenarios. Moving to migrations needs a deliberate database transition, not an extra method call.',
          warning: 'Never delete a valuable database just to make a migration error disappear.',
        },
      ],
      exercise: {
        title: 'Introduce a durable schema safely',
        brief:
          'Move from the throwaway in-memory demonstration to a local development database managed by migrations.',
        steps: [
          'Use a persistent connection configuration in a proper host.',
          'Install matching EF tooling and design-time support.',
          'Generate and review an initial migration before applying it to a fresh development database.',
        ],
        solution:
          'Use a consistent EF major version, a design-time context creation path, and a fresh database managed by migrations. Review migration operations and keep data backups. Do not apply an initial migration blindly over an unrelated existing schema.',
      },
      quiz: {
        question: 'When does adding an entity normally write it to the database?',
        options: [
          'Immediately when new is called',
          'When it is assigned to a variable',
          'When SaveChanges or SaveChangesAsync executes successfully',
          'Only when the process exits',
        ],
        answer: 2,
        explanation:
          'Add normally changes tracking state. SaveChanges executes the database work. Query materialization is separate and can execute reads without any SaveChanges call.',
      },
      references: [
        { label: 'EF Core overview', url: 'https://learn.microsoft.com/en-us/ef/core/' },
        {
          label: 'Migrations overview',
          url: 'https://learn.microsoft.com/en-us/ef/core/managing-schemas/migrations/',
        },
      ],
    },
    {
      id: 'ef-query-performance',
      title: 'Efficient queries & the N+1 trap',
      subtitle: 'Read the SQL, limit the result, and count round trips.',
      minutes: 30,
      tags: [
        'AsNoTracking',
        'Include',
        'projection',
        'N+1',
        'ToQueryString',
        'split query',
        'lazy loading',
        'index',
      ],
      outcomes: [
        'Project only required data for read endpoints.',
        'Identify N+1 and cartesian expansion.',
        'Inspect SQL and query plans instead of guessing.',
      ],
      sections: [
        {
          title: 'Fetch the shape the caller needs',
          body: 'An API list usually does not need full tracked entities with every column and navigation. Select a response projection before materializing, filter in the database, order deterministically, and bound the result. This reduces transferred data and can reduce tracking overhead. AsNoTracking is useful for read-only entity queries, but do not treat it as a universal speed flag.\n\nA projection containing only scalar values or DTO data does not need entity tracking in the same way as a projection that includes actual entity instances. Understand what your projection contains. No-tracking also changes identity resolution unless you choose an appropriate identity-resolution variant.',
        },
        {
          title: 'N+1 is a round-trip pattern',
          body: 'N+1 happens when one query loads a set and then an additional query runs for each item, often through lazy-loaded navigation access or a loop. Ten tasks can become eleven queries. The cost grows with both item count and network latency. Log database commands and inspect the request as a whole.\n\nEager loading with Include can help, but including several collection navigations in one query can multiply rows through a cartesian expansion. Projection or split queries can be better for a particular shape. Split queries introduce additional round trips and can observe inconsistent data across statements unless the transaction/isolation strategy addresses it. Measure the tradeoff.',
        },
        {
          title: 'A generated query still needs a database plan',
          body: 'ToQueryString helps inspect generated SQL during development, while logging and database tooling reveal actual commands and timings. The database execution plan shows scans, seeks, joins, and estimates. A fast query on five rows may fail badly on a million rows with skewed values.\n\nAvoid loading data and then filtering in memory accidentally, calling ToList repeatedly, or using unbounded Includes. Compiled queries, context pooling, and special performance options belong after basic query shape and indexes are correct. Do not log sensitive parameter values in production merely to diagnose performance; use appropriate access controls and redaction.',
        },
      ],
      diagram: {
        title: 'A targeted read query',
        source:
          'flowchart LR\n  filter["WHERE open tasks"] --> order["ORDER BY Id"]\n  order --> select["SELECT Id, Title"]\n  select --> limit["LIMIT 20"]\n  limit --> response["Small response DTOs"]',
        caption:
          'Reduce rows and columns before materialization. Then verify the generated SQL and its execution plan.',
      },
      example: {
        title: 'Project a bounded read model',
        filename: 'TaskQueries.cs',
        language: 'csharp',
        setup:
          'Query excerpt inside an async operation with an injected TaskDbContext named db and a CancellationToken named cancellationToken. Use the entity and context from the preceding EF lesson.',
        code: 'var query = db.Tasks\n    .AsNoTracking()\n    .Where(task => !task.IsComplete)\n    .OrderBy(task => task.Id)\n    .Select(task => new { task.Id, task.Title })\n    .Take(20);\n\nstring sql = query.ToQueryString();\nvar items = await query.ToListAsync(cancellationToken);',
        output: 'At most 20 open tasks, ordered by ID, with only ID and title projected.',
        explanation: [
          'Where, ordering, projection, and Take remain in the provider query before execution.',
          'ToQueryString is a diagnostic tool; do not expose its SQL through a public API.',
          'The scalar projection already avoids tracking full task entities. AsNoTracking makes the read intention clear but is not the main optimization in this particular query.',
        ],
      },
      traps: [
        {
          question: 'Is Include always the fix for a slow EF query?',
          answer:
            'No. It may remove N+1 round trips but can overfetch columns and multiply rows across collections. A projection, split query, or different endpoint shape may be better.',
          warning: 'Count rows and round trips, not only the number of LINQ statements.',
        },
        {
          question: 'Does AsNoTracking mean no work or no allocations?',
          answer:
            'No. The database still executes a query, transfers data, and materializes results. It primarily changes entity tracking behavior.',
          warning: 'A badly shaped no-tracking query is still a badly shaped query.',
        },
      ],
      exercise: {
        title: 'Diagnose a slow project list',
        brief: "A page loads 50 projects, then accesses each project's lazily loaded tasks.",
        steps: [
          'Count the likely number of queries.',
          'Design a projection for only the displayed project name and task count.',
          'Compare SQL and query timing on a realistic dataset.',
        ],
        solution:
          'The pattern can issue one project query plus one task query per project. A translated projection with a task count can often answer the display requirement without loading every task. Inspect the generated SQL and database plan, because exact translation depends on the provider and model.',
      },
      quiz: {
        question: 'What is the most direct symptom of an N+1 query pattern?',
        options: [
          'One query plus another query per loaded item',
          'A JSON response with one extra field',
          'A database with one index',
          'A single query returning no rows',
        ],
        answer: 0,
        explanation:
          'N+1 describes repeated round trips driven by the loaded item count. It often arises from lazy navigation access or explicit queries inside a loop.',
      },
      references: [
        {
          label: 'Efficient EF Core querying',
          url: 'https://learn.microsoft.com/en-us/ef/core/performance/efficient-querying',
        },
        {
          label: 'Single and split queries',
          url: 'https://learn.microsoft.com/en-us/ef/core/querying/single-split-queries',
        },
      ],
    },
    {
      id: 'relationships-and-transactions',
      title: 'Relationships & transaction boundaries',
      subtitle:
        'Keep related writes consistent without holding a database hostage to a network call.',
      minutes: 30,
      tags: [
        'relationships',
        'foreign key',
        'transaction',
        'isolation',
        'cascade delete',
        'SaveChanges',
        'outbox',
      ],
      outcomes: [
        'Model relationship cardinality and deletion behavior.',
        'Explain the atomicity of a SaveChanges call.',
        'Choose a transaction boundary around database work.',
      ],
      sections: [
        {
          title: 'Cardinality describes the relationship',
          body: 'One-to-many means a project can have many tasks while each task belongs to one project. Many-to-many means a task can have many labels and a label can belong to many tasks, usually represented by a join table. One-to-one needs a uniqueness constraint in addition to a relationship. Navigation properties help object access, while foreign keys enforce storage relationships.\n\nRequired versus optional relationships affect nullability and deletion behavior. Cascade delete can remove dependent rows automatically; restrict behavior prevents deletion while dependents remain. Choose deliberately. A convenience default can become a serious data-loss incident when a project is deleted.',
        },
        {
          title: 'A unit of work should be atomic where required',
          body: 'With a relational provider supporting transactions, one SaveChanges call normally uses a transaction so its changes succeed together or roll back together. Multiple SaveChanges calls are not automatically one transaction. Use an explicit transaction when the business operation requires several database stages to commit as a unit.\n\nIsolation controls how concurrent work can interact, with tradeoffs involving locks, snapshots, anomalies, and throughput. Do not assume every engine uses the same default or implements identically named levels in the same way. Keep transactions short and make queries efficient.',
        },
        {
          title: 'A database transaction does not cover the world',
          body: "Sending email or calling another service inside a database transaction does not make that external side effect atomic with the database. A remote call may succeed while the transaction later rolls back, or vice versa. Holding locks while waiting on a slow network dependency also damages capacity.\n\nFor reliable follow-up work, consider recording an outbox message in the same database transaction, then delivering it separately with deduplication. Later architecture lessons develop that model. If a database execution strategy retries transient failures, explicit transaction workflows must be composed using the strategy's supported pattern so the whole unit can be replayed safely.",
        },
      ],
      diagram: {
        title: 'One database transaction',
        source:
          'flowchart LR\n  begin["Begin transaction"] --> first["Update task A"]\n  first --> second["Update task B"]\n  second --> commit["Commit both"]\n  second -. failure .-> rollback["Rollback database work"]',
        caption:
          'This boundary protects the database work. External email or HTTP side effects need a separate consistency design.',
      },
      example: {
        title: 'Commit two stages together',
        filename: 'TaskOperations.cs',
        language: 'csharp',
        setup:
          'Method-body excerpt inside an async operation with TaskDbContext db, existing firstId and secondId integers, and CancellationToken cancellationToken. It deliberately uses two SaveChanges calls to show the explicit transaction boundary.',
        code: 'await using var transaction = await db.Database\n    .BeginTransactionAsync(cancellationToken);\n\nvar first = await db.Tasks.SingleAsync(task => task.Id == firstId, cancellationToken);\nfirst.IsComplete = true;\nawait db.SaveChangesAsync(cancellationToken);\n\nvar second = await db.Tasks.SingleAsync(task => task.Id == secondId, cancellationToken);\nsecond.IsComplete = true;\nawait db.SaveChangesAsync(cancellationToken);\n\nawait transaction.CommitAsync(cancellationToken);',
        output:
          'Both updates commit together. A failure before commit leaves the transaction uncommitted and disposal rolls it back.',
        explanation: [
          'The explicit transaction links two separate SaveChanges calls.',
          'For a simple pair of tracked updates, one SaveChanges call would usually be simpler and already atomic.',
          'Do not insert an email call into this transaction and assume the email becomes rollback-capable.',
        ],
      },
      traps: [
        {
          question:
            'Does SaveChanges make every earlier database operation part of one global transaction?',
          answer:
            "No. Its normal atomicity covers that call's changes. Separate calls need an explicit shared transaction when they must form one database unit.",
          warning: 'A DbContext lifetime is not itself a transaction boundary.',
        },
        {
          question: 'Can a SQL rollback unsend an email?',
          answer:
            'No. Ordinary external side effects are outside the database transaction. Use a reliable workflow such as an outbox, idempotent delivery, and explicit failure handling.',
          warning: 'Cross-system consistency is a design problem, not an extra try/catch.',
        },
      ],
      exercise: {
        title: 'Protect a project deletion',
        brief:
          'Deleting a project currently cascades to every task, but the business now requires archiving.',
        steps: [
          'Define the required relationship and deletion policy.',
          'Change the schema through a reviewed migration.',
          'Test deletion attempts and archive behavior with related rows.',
        ],
        solution:
          'Replace accidental destructive behavior with an explicit archive operation and a deliberate foreign-key deletion policy. Update both domain behavior and database constraints, review the migration, and test existing data. Soft deletion also needs filtering and retention rules; it is not just one Boolean field.',
      },
      quiz: {
        question:
          'Which operation is not automatically rolled back by a local database transaction?',
        options: [
          'A row update in that transaction',
          'An insert in that transaction',
          'An email already sent to an external provider',
          'A delete in that transaction',
        ],
        answer: 2,
        explanation:
          'The local transaction controls its database operations. An email provider is a separate system; successful delivery cannot be undone by rolling back SQL changes.',
      },
      references: [
        {
          label: 'EF Core transactions',
          url: 'https://learn.microsoft.com/en-us/ef/core/saving/transactions',
        },
        {
          label: 'EF Core relationships',
          url: 'https://learn.microsoft.com/en-us/ef/core/modeling/relationships',
        },
      ],
    },
    {
      id: 'concurrency-and-data-access',
      title: 'Optimistic concurrency & data-access choices',
      subtitle:
        'Detect lost updates, and choose EF Core, Dapper, or a repository for an actual reason.',
      minutes: 50,
      tags: [
        'optimistic concurrency',
        'rowversion',
        'DbUpdateConcurrencyException',
        'Dapper',
        'repository',
        'Unit of Work',
        'ETag',
        'stored procedures',
        'FromSql',
        'parameterization',
        'CommandDefinition',
      ],
      outcomes: [
        'Explain a lost update and concurrency token.',
        'Handle conflicts without blindly overwriting.',
        'Compare EF Core, Dapper, and repository abstractions.',
      ],
      sections: [
        {
          title: 'Two users can overwrite each other',
          body: "Alice and Ben both read version 4 of a task. Alice updates it to version 5. Ben then saves his older edit. Without a concurrency check, Ben may overwrite Alice's work. Optimistic concurrency allows parallel reading but checks whether the stored version still matches the original when writing.\n\nEF Core can include a concurrency token in the update predicate. If the expected row is no longer matched, SaveChanges throws DbUpdateConcurrencyException. SQL Server rowversion is a database-generated binary token, not a date/time value. SQLite has no identical automatic rowversion feature; an application-managed GUID or integer token can be used with an explicit update policy.",
        },
        {
          title: 'A conflict needs a business decision',
          body: 'Options include rejecting the stale write, reloading and asking the user to merge, or applying a domain-specific merge. Blindly refreshing the token and retrying the same overwrite defeats the purpose of detecting the conflict. Deletion by another request is also a possible cause.\n\nFor an HTTP API, an ETag with If-Match can express a precondition and map a stale version to 412. A body-based version contract might use 409 depending on the documented API design. Authorization must still verify ownership independently. A concurrency token proves a version condition, not that the caller is entitled to edit.',
        },
        {
          title: 'Choose the access layer for its value',
          body: 'EF Core provides mapping, LINQ translation, change tracking, and migrations. Dapper is a lightweight mapper around SQL execution, giving you direct control over queries while leaving more SQL and persistence behavior to your code. Both require parameterization, transaction design, and testing. Raw SQL is not inherently faster simply because it is handwritten.\n\nDbContext already embodies repository-like and unit-of-work behavior. A generic repository that merely renames every EF method may hide useful capabilities without protecting a meaningful boundary. A focused domain query or persistence interface can still be valuable. Choose the abstraction based on ownership, test strategy, and actual replacement or complexity needs.',
        },
        {
          title: 'Stored procedures: a database contract, not a speed guarantee',
          body: 'A stored procedure is a named database routine with a parameter and result contract. In SQL Server, execution plans can be compiled and cached and can later be recompiled; "precompiled forever" is not an accurate model. Parameter-sensitive plans, statistics, indexes, returned row count, and network cost still matter. A procedure is not automatically faster than an equivalent parameterized query.\n\nProcedures can be useful for existing database-owned operations, reviewed multi-step SQL work, or carefully tuned reporting. Grant only the required execution rights and preserve a stable result shape. A procedure that concatenates input into dynamic SQL can still be injection-vulnerable. Use parameters inside the routine as well as at its caller.\n\nEF Core FromSql/FromSqlInterpolated can parameterize interpolated **values** when the interpolated expression is passed to the intended API. Constructing a plain string first, or concatenating input into FromSqlRaw, loses that safety. Parameterize values and whitelist any unavoidable dynamic identifiers. EF Core does not make arbitrary raw SQL safe automatically.\n\nSQL Server does not support composing an ordinary SELECT around EXEC as if it were a table expression. Materialize a procedure result directly or use an appropriate client boundary; do not append server-side Where/OrderBy expecting every procedure call to remain composable. Entity materialization also needs the expected mapped columns. A stored-procedure output DTO or keyless result type can provide a more suitable contract.',
        },
        {
          title: 'Dapper: explicit SQL, parameters, ownership, and cancellation',
          body: 'Dapper maps result columns to .NET members while leaving SQL and schema evolution to the application. It does not provide EF-style entity tracking or migrations, but an application using Dapper can still use a separate migration tool. Use explicit columns and bounded result sets rather than SELECT * as a default.\n\nPass values through a parameter object or DynamicParameters. CommandDefinition carries options including a command timeout and CancellationToken, so an asynchronous query can observe request cancellation. Cancellation and a timeout are not the same policy. Open and dispose the connection according to ownership; disposing a pooled connection normally returns it to the pool rather than destroying every physical connection.\n\nA QuerySingleOrDefaultAsync result can legitimately be null. Reflect that in the return type and translate absence at the HTTP boundary. Choose Single versus First based on whether multiple matches should be treated as a contract error. For large streaming workloads, understand whether the selected API buffers rows and how long the connection remains open.\n\nCompare Dapper with a similarly shaped, projected no-tracking EF query using representative data. The PDF\'s "Dapper is faster" table is a starting hypothesis, not a universal result. Both tools can share a database; sharing an actual connection and transaction requires explicit ownership and transaction passing, not just equal connection strings.',
        },
        {
          title: 'Repository and service boundaries do not erase database semantics',
          body: 'A repository contract can give an application a useful domain-focused persistence boundary. A service can orchestrate a business operation across those contracts without knowing HTTP details. This makes it easier to test business decisions using controlled doubles. It does not prove real SQL translation, constraints, isolation, or provider behavior; those still need database integration tests.\n\nAvoid committing separately inside every repository method when one service operation must be atomic across several changes. Give the transaction/unit-of-work boundary an explicit owner. Replacing SQL Server with a document store can change joins, consistency, identity, and query capabilities, so a generic interface is not a promise of a zero-change technology swap.\n\nFor TaskFlow, a small endpoint using DbContext directly can be a deliberate, testable choice. Extract a service or focused repository when it separates substantial business policy or a useful boundary. Do not add a repository per table simply to match a folder diagram. Domains, persistence entities, and DTOs need not have a one-to-one relationship.',
        },
      ],
      diagram: {
        title: 'Detect a stale update',
        source:
          'sequenceDiagram\n  participant Alice\n  participant DB as Task version\n  participant Ben\n  DB-->>Alice: Version 4\n  DB-->>Ben: Version 4\n  Alice->>DB: Update where version = 4\n  Note over DB: Now version 5\n  Ben->>DB: Update where version = 4\n  DB-->>Ben: No match / conflict',
        caption:
          'The version comparison belongs in the write condition, so the check and update are not a separate race.',
      },
      example: {
        title: 'Use an application-managed version token',
        filename: 'Concurrency.cs',
        language: 'csharp',
        setup:
          'EF Core excerpts: add a Guid Version property to TaskItem, configure it in OnModelCreating, and use the update logic inside an async endpoint with db, a tracked task, request.Version, and cancellationToken. These are separate placement blocks, not one standalone Program.cs.',
        code: 'modelBuilder.Entity<TaskItem>()\n    .Property(task => task.Version).IsConcurrencyToken();\n\nvar entry = db.Entry(task);\nentry.Property(item => item.Version).OriginalValue = request.Version;\ntask.Version = Guid.NewGuid();\n\ntry\n{\n    await db.SaveChangesAsync(cancellationToken);\n    return Results.Ok(new { task.Id, task.Version });\n}\ncatch (DbUpdateConcurrencyException)\n{\n    return Results.Conflict(new { message = "The task changed. Reload before saving." });\n}',
        output:
          'Matching original version -> update succeeds with a new version\nStale original version -> conflict response',
        explanation: [
          'Initialize Version on new entities and change it on every update that the concurrency policy protects.',
          "The client version becomes the original expected value in EF's write predicate.",
          'The excerpt omits authorization and input validation for focus; both are mandatory in the real update endpoint. Use your established Problem Details contract for production errors.',
        ],
      },
      additionalExamples: [
        {
          title: 'A parameterized Dapper task lookup',
          filename: 'TaskLookup.cs',
          language: 'csharp',
          setup:
            'Reusable class-library example targeting net10.0. Add the Dapper and Microsoft.Data.SqlClient packages. The caller supplies a trusted configured connection string and cancellation token. SQL Server must contain dbo.Tasks with Id, Title, and IsComplete columns; no local SQL Server is bundled with the learning app.',
          code: 'using Dapper;\nusing Microsoft.Data.SqlClient;\n\npublic sealed record TaskRow(int Id, string Title, bool IsComplete);\n\npublic sealed class TaskLookup(string connectionString)\n{\n    public async Task<TaskRow?> FindAsync(int taskId, CancellationToken cancellationToken)\n    {\n        await using var connection = new SqlConnection(connectionString);\n        await connection.OpenAsync(cancellationToken);\n        var command = new CommandDefinition(\n            "SELECT Id, Title, IsComplete FROM dbo.Tasks WHERE Id = @TaskId",\n            new { TaskId = taskId },\n            commandTimeout: 15,\n            cancellationToken: cancellationToken);\n        return await connection.QuerySingleOrDefaultAsync<TaskRow>(command);\n    }\n}',
          explanation: [
            'TaskId is a bound parameter, not pasted into the SQL text. The query returns explicit columns and is bounded by a unique key.',
            'The nullable result represents a missing task. The endpoint still needs authentication, ownership checks, and a safe response contract.',
            'The method owns its connection and passes cancellation through both opening and querying. The command timeout is separately configured in seconds.',
          ],
        },
        {
          title: 'Define a bounded SQL Server procedure',
          filename: 'GetOpenTasks.sql',
          language: 'sql',
          setup:
            'SQL Server-only definition for an isolated development database with dbo.Tasks(Id, Title, IsComplete). Run the CREATE OR ALTER statement as its own batch using an authorized database tool. It changes the schema and is not a SQLite example.',
          code: "CREATE OR ALTER PROCEDURE dbo.GetOpenTasks\n    @Limit int = 20\nAS\nBEGIN\n    SET NOCOUNT ON;\n    IF @Limit IS NULL OR @Limit < 1 OR @Limit > 100\n        THROW 50001, 'Limit must be between 1 and 100.', 1;\n\n    SELECT TOP (@Limit) Id, Title, IsComplete\n    FROM dbo.Tasks\n    WHERE IsComplete = 0\n    ORDER BY Id;\nEND;",
          explanation: [
            'The routine validates its bound parameter and returns a deterministic, limited projection.',
            'SET NOCOUNT ON suppresses affected-row count messages; it does not suppress the SELECT result set.',
            'The routine has no owner filter, so it demonstrates query mechanics only. Add trusted access scoping before using it for private multi-user data.',
          ],
        },
        {
          title: 'Call the procedure with an explicit command type',
          filename: 'ProcedureCall.cs',
          language: 'csharp',
          setup:
            'Method-body excerpt after opening the SqlConnection from the Dapper example. Import System.Data and Dapper, use the same TaskRow record, and supply a CancellationToken named cancellationToken. The GetOpenTasks procedure must already exist.',
          code: 'var command = new CommandDefinition(\n    "dbo.GetOpenTasks",\n    new { Limit = 20 },\n    commandType: CommandType.StoredProcedure,\n    commandTimeout: 15,\n    cancellationToken: cancellationToken);\n\nIEnumerable<TaskRow> tasks = await connection.QueryAsync<TaskRow>(command);',
          explanation: [
            'CommandType.StoredProcedure treats the command text as a routine name and binds Limit as a parameter.',
            'For a procedure returning mapped EF entities, a direct FromSqlInterpolated call is another option, but its result shape and composition restrictions must be checked.',
            'These database-dependent examples are not evidence that a SQL Server deployment has been configured or performance-tested.',
          ],
        },
      ],
      traps: [
        {
          question: 'Is SQL Server rowversion a timestamp you can display as a date?',
          answer:
            'No. It is a database-generated binary version token. It is useful for detecting changed rows, not for recording human time.',
          warning:
            'Do not assume a similarly named feature exists with identical behavior in every provider.',
        },
        {
          question: 'Does a repository automatically make data access independent of EF?',
          answer:
            'No. If it leaks IQueryable, tracked entities, or EF-specific behavior, callers still depend on those semantics. A useful boundary must define what it actually isolates.',
          warning: 'An extra interface can rename coupling without removing it.',
        },
      ],
      exercise: {
        title: 'Reproduce a lost update',
        brief: 'Use two separate contexts to load the same task and save conflicting edits.',
        steps: [
          'Observe the overwrite without a token.',
          'Add a concurrency token and repeat.',
          'Define a conflict response that does not silently overwrite the first edit.',
        ],
        solution:
          'Load the same initial version into each context. Save the first edit with a new token, then attempt the second with the old expected version. Handle DbUpdateConcurrencyException at the operation boundary and ask for reload or a deliberate merge. Do not share one context for this test.',
      },
      quiz: {
        question: 'What does an optimistic concurrency token prove?',
        options: [
          'That the user is an administrator',
          'That the expected stored version still matches during the write',
          'That no other request ever read the row',
          'That a request can be retried forever',
        ],
        answer: 1,
        explanation:
          'The token checks a version condition atomically with the write. It does not authorize the caller or prevent others from reading the same data.',
      },
      references: [
        {
          label: 'EF Core concurrency',
          url: 'https://learn.microsoft.com/en-us/ef/core/saving/concurrency',
        },
        { label: 'Dapper project', url: 'https://github.com/DapperLib/Dapper' },
        {
          label: 'EF Core SQL queries and parameterization',
          url: 'https://learn.microsoft.com/en-us/ef/core/querying/sql-queries',
        },
        {
          label: 'SQL Server stored procedures',
          url: 'https://learn.microsoft.com/en-us/sql/relational-databases/stored-procedures/stored-procedures-database-engine',
        },
      ],
    },
  ],
}
