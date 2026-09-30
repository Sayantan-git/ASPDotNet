using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);
string connectionString = builder.Configuration.GetConnectionString("Tasks")
    ?? $"Data Source={Path.Combine(builder.Environment.ContentRootPath, "taskflow.db")}";
builder.Services.AddDbContext<TaskDbContext>(options => options.UseSqlite(connectionString));
builder.Services.AddProblemDetails();
builder.Services.AddHealthChecks();

var app = builder.Build();
app.UseExceptionHandler();
app.UseStatusCodePages();

await using (var scope = app.Services.CreateAsyncScope())
{
    var database = scope.ServiceProvider.GetRequiredService<TaskDbContext>();
    await database.Database.EnsureCreatedAsync();
}

app.MapHealthChecks("/health");

var tasks = app.MapGroup("/tasks");

tasks.MapGet("/", async (TaskDbContext database, int? page, int? pageSize, CancellationToken token) =>
{
    int number = page ?? 1;
    int size = pageSize ?? 20;
    if (number is < 1 or > 10000 || size is < 1 or > 100)
        return Results.ValidationProblem(new Dictionary<string, string[]>
        {
            ["pagination"] = ["Use page 1 to 10000 and pageSize 1 to 100."]
        });

    var items = await database.Tasks.AsNoTracking()
        .OrderBy(task => task.Id)
        .Skip((number - 1) * size)
        .Take(size)
        .Select(task => new TaskResponse(task.Id, task.Title, task.IsComplete))
        .ToListAsync(token);
    return Results.Ok(new { items, page = number, pageSize = size });
});

tasks.MapGet("/{id:int}", async (int id, TaskDbContext database, CancellationToken token) =>
{
    var task = await database.Tasks.AsNoTracking()
        .Where(item => item.Id == id)
        .Select(item => new TaskResponse(item.Id, item.Title, item.IsComplete))
        .SingleOrDefaultAsync(token);
    return task is null ? MissingTask() : Results.Ok(task);
});

tasks.MapPost("/", async (CreateTaskRequest request, TaskDbContext database, CancellationToken token) =>
{
    var error = ValidateTitle(request.Title);
    if (error is not null) return error;

    var task = new TaskItem { Title = request.Title!.Trim() };
    database.Tasks.Add(task);
    await database.SaveChangesAsync(token);
    return Results.Created($"/tasks/{task.Id}", new TaskResponse(task.Id, task.Title, task.IsComplete));
});

tasks.MapPut("/{id:int}", async (int id, UpdateTaskRequest request, TaskDbContext database, CancellationToken token) =>
{
    var error = ValidateTitle(request.Title);
    if (error is not null) return error;
    if (request.IsComplete is null)
        return Results.ValidationProblem(new Dictionary<string, string[]>
        {
            ["isComplete"] = ["Provide a Boolean completion state."]
        });

    var task = await database.Tasks.SingleOrDefaultAsync(item => item.Id == id, token);
    if (task is null) return MissingTask();
    task.Title = request.Title!.Trim();
    task.IsComplete = request.IsComplete.Value;
    await database.SaveChangesAsync(token);
    return Results.Ok(new TaskResponse(task.Id, task.Title, task.IsComplete));
});

tasks.MapDelete("/{id:int}", async (int id, TaskDbContext database, CancellationToken token) =>
{
    var task = await database.Tasks.SingleOrDefaultAsync(item => item.Id == id, token);
    if (task is null) return MissingTask();
    database.Tasks.Remove(task);
    await database.SaveChangesAsync(token);
    return Results.NoContent();
});

app.Run();

static IResult? ValidateTitle(string? title) =>
    string.IsNullOrWhiteSpace(title) || title.Trim().Length > 120
        ? Results.ValidationProblem(new Dictionary<string, string[]>
        {
            ["title"] = ["Use a nonblank title of at most 120 characters."]
        })
        : null;

static IResult MissingTask() => Results.Problem(statusCode: 404, title: "Task not found");

public partial class Program { }

public sealed class TaskDbContext(DbContextOptions<TaskDbContext> options) : DbContext(options)
{
    public DbSet<TaskItem> Tasks => Set<TaskItem>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<TaskItem>().Property(task => task.Title).IsRequired().HasMaxLength(120);
    }
}

public sealed class TaskItem
{
    public int Id { get; set; }
    public string Title { get; set; } = "";
    public bool IsComplete { get; set; }
}

public sealed record CreateTaskRequest(string? Title);
public sealed record UpdateTaskRequest(string? Title, bool? IsComplete);
public sealed record TaskResponse(int Id, string Title, bool IsComplete);