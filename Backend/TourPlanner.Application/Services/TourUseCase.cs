using FluentValidation;
using TourPlanner.Application.Abstractions;
using TourPlanner.Application.Abstractions.Context;
using TourPlanner.Application.Abstractions.UseCases;
using TourPlanner.Application.Common.Exceptions;
using TourPlanner.Application.Contracts.Files;
using TourPlanner.Application.Contracts.Persistence;
using TourPlanner.Application.Dtos.Tours;
using TourPlanner.Application.Dtos.TourLogs;
using TourPlanner.Domain;
using TourPlanner.Domain.Entities;
using TourPlanner.Domain.Metrics;
using IOpenRouteService = TourPlanner.Application.Contracts.Routing.IOpenRouteService;

namespace TourPlanner.Application.Services;

public sealed class TourUseCase(
    IValidator<CreateTourRequestDto> createTourRequestValidator,
    IValidator<UpdateTourRequestDto> updateTourRequestValidator,
    ITourRepository tours,
    ITourLogRepository tourLogs,
    IOpenRouteService routeService,
    IFileStorage fileStorage,
    ICurrentUserContext currentUser,
    IUnitOfWork unitOfWork) : ITourUseCase
{
    public async Task<TourSummaryResponseDto> CreateAsync(CreateTourRequestDto request, CancellationToken cancellationToken = default)
    {
        createTourRequestValidator.ValidateAndThrow(request);
        EnsureAuthenticated();

        var domainTransportType = request.TransportType;
        var route = await routeService.BuildRouteAsync(request.From, request.To, domainTransportType, cancellationToken);
        var tour = Tour.Create(
            currentUser.UserId,
            request.Name,
            request.Description,
            request.From,
            request.To,
            domainTransportType,
            route.DistanceKm,
            route.EstimatedMinutes,
            route.RouteInformation);

        await tours.AddAsync(tour, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ToSummary(tour);
    }

    public async Task<TourDetailResponseDto> GetByIdAsync(Guid tourId, CancellationToken cancellationToken = default)
    {
        EnsureAuthenticated();
        var tour = await RequireTourAsync(tourId, cancellationToken);
        var logs = await tourLogs.GetByTourIdAsync(tour.Id, currentUser.UserId, cancellationToken);
        return ToDetail(tour, logs);
    }

    public async Task<IReadOnlyList<TourSummaryResponseDto>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        EnsureAuthenticated();
        var items = await tours.GetByUserIdAsync(currentUser.UserId, cancellationToken);
        return items.Select(ToSummary).ToArray();
    }

    public async Task<TourSummaryResponseDto> UpdateAsync(Guid tourId, UpdateTourRequestDto request, CancellationToken cancellationToken = default)
    {
        updateTourRequestValidator.ValidateAndThrow(request);
        EnsureAuthenticated();

        var tour = await RequireTourAsync(tourId, cancellationToken);
        var domainTransportType = request.TransportType;
        var route = await routeService.BuildRouteAsync(request.From, request.To, domainTransportType, cancellationToken);

        tour.Update(
            request.Name,
            request.Description,
            request.From,
            request.To,
            domainTransportType,
            route.DistanceKm,
            route.EstimatedMinutes,
            route.RouteInformation);

        await unitOfWork.SaveChangesAsync(cancellationToken);
        return ToSummary(tour);
    }

    public async Task DeleteAsync(Guid tourId, CancellationToken cancellationToken = default)
    {
        EnsureAuthenticated();
        var tour = await RequireTourAsync(tourId, cancellationToken);
        if (!string.IsNullOrWhiteSpace(tour.ImagePath))
        {
            await fileStorage.DeleteFileAsync(tour.ImagePath, cancellationToken);
        }

        tours.Remove(tour);
        await unitOfWork.SaveChangesAsync(cancellationToken);
    }

    public async Task<TourInsightResponseDto> GetInsightsAsync(Guid tourId, CancellationToken cancellationToken = default)
    {
        EnsureAuthenticated();
        var tour = await RequireTourAsync(tourId, cancellationToken);
        var logs = await tourLogs.GetByTourIdAsync(tour.Id, currentUser.UserId, cancellationToken);
        var metrics = TourMetricsCalculator.Calculate(logs);
        tour.UpdateMetrics(metrics.Popularity, metrics.ChildFriendliness);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        return new TourInsightResponseDto(tour.Id, metrics.LogCount, metrics.AverageDifficulty, metrics.AverageDistanceKm, metrics.AverageTimeMinutes, metrics.Popularity, metrics.ChildFriendliness);
    }

    public async Task<IReadOnlyList<TourSummaryResponseDto>> GetRecommendedAsync(int take = 5, CancellationToken cancellationToken = default)
    {
        EnsureAuthenticated();
        var items = await tours.GetByUserIdAsync(currentUser.UserId, cancellationToken);
        return items
            .OrderByDescending(tour => tour.ChildFriendliness)
            .ThenByDescending(tour => tour.Popularity)
            .Take(Math.Max(1, take))
            .Select(ToSummary)
            .ToArray();
    }

    public async Task<UploadTourImageResponseDto> UploadImageAsync(Guid tourId, string fileName, byte[] content, CancellationToken cancellationToken = default)
    {
        EnsureAuthenticated();
        if (string.IsNullOrWhiteSpace(fileName))
        {
            throw new ArgumentException("File name must not be empty.", nameof(fileName));
        }

        var tour = await RequireTourAsync(tourId, cancellationToken);
        var safeName = Path.GetFileName(fileName);
        var storagePath = Path.Combine("tour-images", currentUser.UserId.ToString("N"), tour.Id.ToString("N"), safeName)
            .Replace('\\', '/');

        var savedPath = await fileStorage.SaveFileAsync(storagePath, content, cancellationToken);
        tour.UpdateImagePath(savedPath);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        return new UploadTourImageResponseDto(savedPath);
    }

    private async Task<Tour> RequireTourAsync(Guid tourId, CancellationToken cancellationToken)
        => await tours.GetByIdAsync(tourId, currentUser.UserId, cancellationToken)
           ?? throw new TourPlannerNotFoundException("Tour was not found.");

    private void EnsureAuthenticated()
    {
        if (!currentUser.IsAuthenticated)
        {
            throw new TourPlannerUnauthorizedException("The current request is not authenticated.");
        }
    }

    private static TourSummaryResponseDto ToSummary(Tour tour)
        => new(tour.Id, tour.Name, tour.Description, tour.From, tour.To, tour.TransportType, tour.DistanceKm, tour.EstimatedMinutes, tour.Popularity, tour.ChildFriendliness, tour.ImagePath);

    private static TourDetailResponseDto ToDetail(Tour tour, IReadOnlyList<TourLog> logs)
        => new(
            tour.Id,
            tour.Name,
            tour.Description,
            tour.From,
            tour.To,
            tour.TransportType,
            tour.DistanceKm,
            tour.EstimatedMinutes,
            tour.RouteInformation,
            tour.Popularity,
            tour.ChildFriendliness,
            tour.ImagePath,
            logs.Select(ToResponse).ToArray());

    private static TourLogResponseDto ToResponse(TourLog log)
        => new(log.Id, log.TourId, log.AccomplishedAt, log.Comment, log.Difficulty, log.TotalDistanceKm, log.TotalTimeMinutes, log.Rating);
}



