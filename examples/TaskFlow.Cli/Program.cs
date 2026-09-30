using System.Text.Json;

if (args.Length == 0 || args[0] is "help" or "--help")
{
    Console.WriteLine("TaskFlow CLI\n  add \"Task title\"\n  list\n  complete <id>");
    return 0;
}

var jsonOptions = new JsonSerializerOptions(JsonSerializerDefaults.Web) { WriteIndented = true };

try
{
    string dataPath = Path.GetFullPath(
        Environment.GetEnvironmentVariable("TASKFLOW_DATA_PATH") ?? "taskflow.cli.json");
    List<TaskEntry> tasks = [];
    if (File.Exists(dataPath))
    {
        string json = await File.ReadAllTextAsync(dataPath);
        tasks = JsonSerializer.Deserialize<List<TaskEntry>>(json, jsonOptions)
            ?? throw new InvalidDataException("The task file must contain a JSON array.");
        if (tasks.Any(task => task is null || task.Id < 1 || string.IsNullOrWhiteSpace(task.Title)
                || task.Title.Length > 120)
            || tasks.Select(task => task.Id).Distinct().Count() != tasks.Count)
            throw new InvalidDataException("The task file contains invalid or duplicate task data.");
    }

    switch (args[0].ToLowerInvariant())
    {
        case "list" when args.Length == 1:
            if (tasks.Count == 0) Console.WriteLine("No tasks yet.");
            foreach (var task in tasks.OrderBy(task => task.Id))
                Console.WriteLine($"{task.Id}. [{(task.IsComplete ? "x" : " ")}] {task.Title}");
            return 0;

        case "add" when args.Length == 2:
            string title = args[1].Trim();
            if (title.Length is < 1 or > 120)
            {
                Console.Error.WriteLine("Use a nonblank title of at most 120 characters.");
                return 2;
            }
            int nextId = tasks.Count == 0 ? 1 : checked(tasks.Max(task => task.Id) + 1);
            tasks.Add(new TaskEntry(nextId, title, false));
            await SaveAsync(tasks, dataPath, jsonOptions);
            Console.WriteLine($"Created task {nextId}: {title}");
            return 0;

        case "complete" when args.Length == 2 && int.TryParse(args[1], out int id) && id > 0:
            int index = tasks.FindIndex(task => task.Id == id);
            if (index < 0)
            {
                Console.Error.WriteLine($"Task {id} was not found.");
                return 2;
            }
            tasks[index] = tasks[index] with { IsComplete = true };
            await SaveAsync(tasks, dataPath, jsonOptions);
            Console.WriteLine($"Completed task {id}.");
            return 0;

        default:
            Console.Error.WriteLine("Unknown command or invalid arguments. Run with --help.");
            return 2;
    }
}
catch (Exception exception) when (exception is IOException or InvalidDataException or UnauthorizedAccessException or JsonException or OverflowException or ArgumentException)
{
    Console.Error.WriteLine($"Task data could not be processed: {exception.Message}");
    return 1;
}

static async Task SaveAsync(List<TaskEntry> tasks, string path, JsonSerializerOptions options)
{
    Directory.CreateDirectory(Path.GetDirectoryName(path)!);
    string temporaryPath = $"{path}.{Guid.NewGuid():N}.tmp";
    try
    {
        await File.WriteAllTextAsync(temporaryPath, JsonSerializer.Serialize(tasks, options));
        File.Move(temporaryPath, path, overwrite: true);
    }
    finally
    {
        if (File.Exists(temporaryPath)) File.Delete(temporaryPath);
    }
}

public sealed record TaskEntry(int Id, string Title, bool IsComplete);