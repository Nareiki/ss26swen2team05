using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using NUnit.Framework;
using TourPlanner.Application.Dtos.Auth;
using TourPlanner.Application.Dtos.Tours;
using TourPlanner.Application.Dtos.TourLogs;
using TourPlanner.Domain;
using TransportType = TourPlanner.Domain.Enums.TransportType;

namespace TourPlanner.Tests;

[TestFixture]
public sealed class IntegrationTests
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web)
    {
        Converters = { new JsonStringEnumConverter() }
    };

    [Test]
    public async Task Register_Login_CreateTour_And_Search_WorksOverHttp()
    {
        await using var factory = CreateFactory();
        var client = factory.CreateClient();

        var auth = await RegisterAndLoginAsync(client, "integration-user");

        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", auth.AccessToken);

        var createTourResponse = await client.PostAsJsonAsync("/api/tours", new CreateTourRequestDto(
            "Weekend Hike",
            "Mountain trail",
            "Vienna",
            "Semmering",
            TransportType.Hiking));

        Assert.That(createTourResponse.StatusCode, Is.EqualTo(HttpStatusCode.Created));

        var toursResponse = await client.GetFromJsonAsync<IReadOnlyList<TourSummaryResponseDto>>("/api/tours", JsonOptions);
        Assert.That(toursResponse, Is.Not.Null);
        var tours = toursResponse ?? throw new AssertionException("Tours response was null.");
        Assert.That(tours, Has.Count.EqualTo(1));
        Assert.That(tours[0].Name, Is.EqualTo("Weekend Hike"));

        var searchResponse = await client.GetFromJsonAsync<TourSearchResponseDto>("/api/search?q=Weekend", JsonOptions);
        Assert.That(searchResponse, Is.Not.Null);
        var search = searchResponse ?? throw new AssertionException("Search response was null.");
        Assert.That(search.Tours, Has.Count.EqualTo(1));
        Assert.That(search.Tours[0].Name, Is.EqualTo("Weekend Hike"));
    }

    [Test]
    public async Task InvalidTourInput_ReturnsValidationProblem()
    {
        await using var factory = CreateFactory();
        var client = factory.CreateClient();
        var auth = await RegisterAndLoginAsync(client, "validation-user");
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", auth.AccessToken);

        var response = await client.PostAsJsonAsync("/api/tours", new CreateTourRequestDto(
            string.Empty,
            "Description",
            "From",
            "To",
            TransportType.Walking));

        Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.BadRequest));

        var payload = await response.Content.ReadAsStringAsync();
        Assert.That(payload, Does.Contain("Validation failed"));
    }

    [Test]
    public async Task DuplicateRegistration_ReturnsConflict()
    {
        await using var factory = CreateFactory();
        var client = factory.CreateClient();

        var first = await client.PostAsJsonAsync("/api/auth/register", new RegisterRequestDto("duplicate-user", "Password123!"));
        Assert.That(first.StatusCode, Is.EqualTo(HttpStatusCode.OK));

        var second = await client.PostAsJsonAsync("/api/auth/register", new RegisterRequestDto("duplicate-user", "Password123!"));
        Assert.That(second.StatusCode, Is.EqualTo(HttpStatusCode.Conflict));
    }

    [Test]
    public async Task CreateTourLog_RecalculatesTourMetricsAndIsVisibleInTourDetails()
    {
        await using var factory = CreateFactory();
        var client = factory.CreateClient();
        var auth = await RegisterAndLoginAsync(client, "log-user");
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", auth.AccessToken);

        var tourResponse = await client.PostAsJsonAsync("/api/tours", new CreateTourRequestDto(
            "City Walk",
            "A short walk",
            "Vienna",
            "Bratislava",
            TransportType.Walking));
        Assert.That(tourResponse.StatusCode, Is.EqualTo(HttpStatusCode.Created));

        var tours = await client.GetFromJsonAsync<IReadOnlyList<TourSummaryResponseDto>>("/api/tours", JsonOptions);
        var tourId = tours![0].Id;

        var logResponse = await client.PostAsJsonAsync($"/api/tours/{tourId}/logs", new CreateTourLogRequestDto(
            DateTimeOffset.UtcNow,
            "Nice day",
            TourDifficulty.Easy,
            6,
            80,
            5));

        Assert.That(logResponse.StatusCode, Is.EqualTo(HttpStatusCode.Created));

        var details = await client.GetFromJsonAsync<TourDetailResponseDto>($"/api/tours/{tourId}", JsonOptions);
        Assert.That(details, Is.Not.Null);
        var tourDetails = details ?? throw new AssertionException("Tour details response was null.");
        Assert.That(tourDetails.Logs, Has.Count.EqualTo(1));
        Assert.That(tourDetails.Popularity, Is.EqualTo(1));
    }

    private static TourPlanner.Tests.Support.TourPlannerWebApplicationFactory CreateFactory()
        => new TourPlanner.Tests.Support.TourPlannerWebApplicationFactory(Guid.NewGuid().ToString("N"));

    private static async Task<AuthResponseDto> RegisterAndLoginAsync(HttpClient client, string userName)
    {
        var register = await client.PostAsJsonAsync("/api/auth/register", new RegisterRequestDto(userName, "Password123!"));
        Assert.That(register.StatusCode, Is.EqualTo(HttpStatusCode.OK));

        var response = await client.PostAsJsonAsync("/api/auth/login", new LoginRequestDto(userName, "Password123!"));
        Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.OK));

        var auth = await response.Content.ReadFromJsonAsync<AuthResponseDto>(JsonOptions);
        Assert.That(auth, Is.Not.Null);
        return auth!;
    }
}







