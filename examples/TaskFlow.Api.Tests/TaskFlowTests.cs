using System.Net;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Xunit;

public sealed class TaskFlowTests
{
    [Fact]
    public async Task CreateReadUpdateDeleteRoundTripUsesTheHttpContract()
    {
        await using var factory = new TaskFlowFactory();
        using var client = factory.CreateClient();

        using var createdResponse = await client.PostAsJsonAsync("/tasks", new { title = "  Learn integration tests  " });
        Assert.Equal(HttpStatusCode.Created, createdResponse.StatusCode);
        var created = await createdResponse.Content.ReadFromJsonAsync<TaskResponse>();
        Assert.NotNull(created);
        Assert.Equal("Learn integration tests", created.Title);
        Assert.False(created.IsComplete);
        Assert.Equal($"/tasks/{created.Id}", createdResponse.Headers.Location?.ToString());

        var read = await client.GetFromJsonAsync<TaskResponse>(createdResponse.Headers.Location);
        Assert.Equal(created, read);

        using var updatedResponse = await client.PutAsJsonAsync($"/tasks/{created.Id}", new { title = "  Verified  ", isComplete = true });
        Assert.Equal(HttpStatusCode.OK, updatedResponse.StatusCode);
        var updated = await updatedResponse.Content.ReadFromJsonAsync<TaskResponse>();
        Assert.Equal(new TaskResponse(created.Id, "Verified", true), updated);

        using var deleted = await client.DeleteAsync($"/tasks/{created.Id}");
        Assert.Equal(HttpStatusCode.NoContent, deleted.StatusCode);
        Assert.Equal("", await deleted.Content.ReadAsStringAsync());
        using var missing = await client.GetAsync($"/tasks/{created.Id}");
        Assert.Equal(HttpStatusCode.NotFound, missing.StatusCode);
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public async Task InvalidTitleReturnsProblemDetailsWithoutCreatingData(string? title)
    {
        await using var factory = new TaskFlowFactory();
        using var client = factory.CreateClient();
        using var response = await client.PostAsJsonAsync("/tasks", new { title });
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Equal("application/problem+json", response.Content.Headers.ContentType?.MediaType);
        var problem = await response.Content.ReadFromJsonAsync<JsonElement>();
        Assert.True(problem.GetProperty("errors").TryGetProperty("title", out _));
        var list = await client.GetFromJsonAsync<JsonElement>("/tasks");
        Assert.Equal(0, list.GetProperty("items").GetArrayLength());
    }

    [Fact]
    public async Task OversizedTitleAndMalformedJsonAreRejected()
    {
        await using var factory = new TaskFlowFactory();
        using var client = factory.CreateClient();
        using var oversized = await client.PostAsJsonAsync("/tasks", new { title = new string('a', 121) });
        Assert.Equal(HttpStatusCode.BadRequest, oversized.StatusCode);
        using var content = new StringContent("{invalid", Encoding.UTF8, "application/json");
        using var malformed = await client.PostAsync("/tasks", content);
        Assert.Equal(HttpStatusCode.BadRequest, malformed.StatusCode);
    }

    [Fact]
    public async Task MissingCompletionStateDoesNotMutateTheTask()
    {
        await using var factory = new TaskFlowFactory();
        using var client = factory.CreateClient();
        using var createdResponse = await client.PostAsJsonAsync("/tasks", new { title = "Original" });
        var created = await createdResponse.Content.ReadFromJsonAsync<TaskResponse>();
        Assert.NotNull(created);
        using var invalidUpdate = await client.PutAsJsonAsync($"/tasks/{created.Id}", new { title = "Changed" });
        Assert.Equal(HttpStatusCode.BadRequest, invalidUpdate.StatusCode);
        var current = await client.GetFromJsonAsync<TaskResponse>($"/tasks/{created.Id}");
        Assert.Equal(created, current);
    }

    [Theory]
    [InlineData("/tasks?page=0")]
    [InlineData("/tasks?page=10001")]
    [InlineData("/tasks?pageSize=0")]
    [InlineData("/tasks?pageSize=101")]
    public async Task PaginationLimitsAreValidated(string path)
    {
        await using var factory = new TaskFlowFactory();
        using var client = factory.CreateClient();
        using var response = await client.GetAsync(path);
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task PaginationIsOrderedAndBounded()
    {
        await using var factory = new TaskFlowFactory();
        using var client = factory.CreateClient();
        foreach (string title in new[] { "First", "Second", "Third" })
        {
            using var response = await client.PostAsJsonAsync("/tasks", new { title });
            Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        }
        var result = await client.GetFromJsonAsync<JsonElement>("/tasks?page=2&pageSize=1");
        Assert.Equal(1, result.GetProperty("items").GetArrayLength());
        Assert.Equal("Second", result.GetProperty("items")[0].GetProperty("title").GetString());
    }

    [Fact]
    public async Task UnknownWritesReturnNotFoundAndHealthResponds()
    {
        await using var factory = new TaskFlowFactory();
        using var client = factory.CreateClient();
        using var update = await client.PutAsJsonAsync("/tasks/999", new { title = "Missing", isComplete = true });
        using var delete = await client.DeleteAsync("/tasks/999");
        using var health = await client.GetAsync("/health");
        Assert.Equal(HttpStatusCode.NotFound, update.StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, delete.StatusCode);
        Assert.Equal(HttpStatusCode.OK, health.StatusCode);
    }
}

public sealed class TaskFlowFactory : WebApplicationFactory<Program>
{
    private readonly SqliteConnection connection = CreateConnection();

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");
        builder.ConfigureServices(services =>
        {
            services.RemoveAll<DbContextOptions<TaskDbContext>>();
            services.RemoveAll<IDbContextOptionsConfiguration<TaskDbContext>>();
            services.AddDbContext<TaskDbContext>(options => options.UseSqlite(connection));
        });
    }

    public override async ValueTask DisposeAsync()
    {
        await base.DisposeAsync();
        await connection.DisposeAsync();
    }

    private static SqliteConnection CreateConnection()
    {
        var connection = new SqliteConnection("Data Source=:memory:");
        connection.Open();
        return connection;
    }
}