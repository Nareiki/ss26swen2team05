using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.Extensions.Options;
using TourPlanner.Contracts.Routing;
using TourPlanner.Domain;
using TourPlanner.Domain.Enums;
using TourPlanner.Infrastructure.Options;

namespace TourPlanner.Infrastructure.Services;

public sealed class OpenRouteServiceClient(HttpClient httpClient, IOptions<OpenRouteOptions> options) : IOpenRouteService
{
    public async Task<RoutePlan> BuildRouteAsync(string from, string to, TransportType transportType, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(options.Value.ApiKey))
        {
            return CreateFallbackRoute(from, to, transportType);
        }

        try
        {
            var fromCoordinates = await GeocodeAsync(from, cancellationToken);
            var toCoordinates = await GeocodeAsync(to, cancellationToken);
            var profile = MapProfile(transportType);
            var requestUri = $"/v2/directions/{profile}/geojson";

            using var request = new HttpRequestMessage(HttpMethod.Post, requestUri);
            request.Headers.Add("Authorization", options.Value.ApiKey);
            request.Content = JsonContent.Create(new
            {
                coordinates = new[] { fromCoordinates, toCoordinates }
            });

            using var response = await httpClient.SendAsync(request, cancellationToken);
            if (!response.IsSuccessStatusCode)
            {
                return CreateFallbackRoute(from, to, transportType);
            }

            var json = await response.Content.ReadAsStringAsync(cancellationToken);
            using var document = JsonDocument.Parse(json);
            var summary = document.RootElement.GetProperty("features")[0].GetProperty("properties").GetProperty("summary");
            var distanceKm = summary.GetProperty("distance").GetDouble() / 1000.0;
            var durationMinutes = summary.GetProperty("duration").GetDouble() / 60.0;
            return new RoutePlan(distanceKm, durationMinutes, json);
        }
        catch
        {
            return CreateFallbackRoute(from, to, transportType);
        }
    }

    private async Task<double[]> GeocodeAsync(string location, CancellationToken cancellationToken)
    {
        var requestUri = $"/geocode/search?text={Uri.EscapeDataString(location)}&size=1";
        using var request = new HttpRequestMessage(HttpMethod.Get, requestUri);
        request.Headers.Add("Authorization", options.Value.ApiKey);

        using var response = await httpClient.SendAsync(request, cancellationToken);
        response.EnsureSuccessStatusCode();

        using var document = JsonDocument.Parse(await response.Content.ReadAsStringAsync(cancellationToken));
        var feature = document.RootElement.GetProperty("features")[0];
        var coordinates = feature.GetProperty("geometry").GetProperty("coordinates");
        return new[] { coordinates[0].GetDouble(), coordinates[1].GetDouble() };
    }

    private static string MapProfile(TransportType transportType)
        => transportType switch
        {
            TransportType.Walking => "foot-walking",
            TransportType.Hiking => "foot-walking",
            TransportType.Bicycling => "cycling-regular",
            TransportType.Car => "driving-car",
            TransportType.PublicTransport => "driving-car",
            TransportType.Train => "driving-car",
            TransportType.Bus => "driving-car",
            _ => "driving-car"
        };

    private static RoutePlan CreateFallbackRoute(string from, string to, TransportType transportType)
    {
        var distance = Math.Max(1, ((from.Length + to.Length) * 0.75) + ((int)transportType * 1.5));
        var speed = transportType switch
        {
            TransportType.Walking => 5d,
            TransportType.Hiking => 4d,
            TransportType.Bicycling => 15d,
            TransportType.Car => 55d,
            TransportType.PublicTransport => 30d,
            TransportType.Train => 80d,
            TransportType.Bus => 35d,
            _ => 25d
        };

        var minutes = (distance / speed) * 60d;
        var routeInformation = JsonSerializer.Serialize(new
        {
            type = "FeatureCollection",
            fallback = true,
            from,
            to,
            transportType = transportType.ToString(),
            distanceKm = Math.Round(distance, 2),
            estimatedMinutes = Math.Round(minutes, 2)
        });

        return new RoutePlan(Math.Round(distance, 2), Math.Round(minutes, 2), routeInformation);
    }
}

