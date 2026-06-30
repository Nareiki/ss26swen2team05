using TourPlanner.Application.Common.Exceptions;
using TourPlanner.Application.Abstractions;
using TourPlanner.Application.Abstractions.Context;
using TourPlanner.Application.Abstractions.UseCases;
using TourPlanner.Application.Contracts.Persistence;
using TourPlanner.Application.Dtos.TourLogs;
using TourPlanner.Application.Dtos.Tours;
using TourPlanner.Domain;
using TourPlanner.Domain.Entities;

namespace TourPlanner.Application.Services;

public sealed class SearchUseCase(
    ITourRepository tours,
    ITourLogRepository tourLogs,
    ICurrentUserContext currentUser) : ISearchUseCase
{
    public async Task<TourSearchResponseDto> SearchAsync(string query, CancellationToken cancellationToken = default)
    {
        EnsureAuthenticated();

        var normalizedQuery = query?.Trim() ?? string.Empty;
        var tourItems = await tours.GetByUserIdAsync(currentUser.UserId, cancellationToken);
        var matchedTours = tourItems.Where(tour => Matches(tour.BuildSearchDocument(), normalizedQuery)).Select(ToSummary).ToArray();

        var matchedLogs = new List<TourLogResponseDto>();
        foreach (var tour in tourItems)
        {
            var logs = await tourLogs.GetByTourIdAsync(tour.Id, currentUser.UserId, cancellationToken);
            matchedLogs.AddRange(logs.Where(log => Matches(log.BuildSearchDocument(), normalizedQuery)).Select(ToResponse));
        }

        return new TourSearchResponseDto(matchedTours, matchedLogs);
    }

    private void EnsureAuthenticated()
    {
        if (!currentUser.IsAuthenticated)
        {
            throw new TourPlannerUnauthorizedException("The current request is not authenticated.");
        }
    }

    private static bool Matches(string document, string query)
        => string.IsNullOrWhiteSpace(query) || document.Contains(query, StringComparison.OrdinalIgnoreCase);

    private static TourSummaryResponseDto ToSummary(Tour tour)
        => new(tour.Id, tour.Name, tour.Description, tour.From, tour.To, tour.TransportType, tour.DistanceKm, tour.EstimatedMinutes, tour.Popularity, tour.ChildFriendliness, tour.ImagePath);

    private static TourLogResponseDto ToResponse(TourLog log)
        => new(log.Id, log.TourId, log.AccomplishedAt, log.Comment, log.Difficulty, log.TotalDistanceKm, log.TotalTimeMinutes, log.Rating);
}


