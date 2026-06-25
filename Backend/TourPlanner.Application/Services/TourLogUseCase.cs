using FluentValidation;
using TourPlanner.Application.Common.Exceptions;
using TourPlanner.Application.Abstractions.Context;
using TourPlanner.Application.Abstractions.UseCases;
using TourPlanner.Application.Dtos.TourLogs;
using TourPlanner.Contracts.Persistence;
using TourPlanner.Domain;

namespace TourPlanner.Application.Services;

public sealed class TourLogUseCase(
    IValidator<CreateTourLogRequestDto> createTourLogRequestValidator,
    IValidator<UpdateTourLogRequestDto> updateTourLogRequestValidator,
    ITourRepository tours,
    ITourLogRepository tourLogs,
    ICurrentUserContext currentUser,
    IUnitOfWork unitOfWork) : ITourLogUseCase
{
    public async Task<TourLogResponseDto> CreateAsync(Guid tourId, CreateTourLogRequestDto request, CancellationToken cancellationToken = default)
    {
        createTourLogRequestValidator.ValidateAndThrow(request);
        var tour = await RequireTourAsync(tourId, cancellationToken);

        var log = TourLog.Create(tour.Id, request.AccomplishedAt, request.Comment, request.Difficulty, request.TotalDistanceKm, request.TotalTimeMinutes, request.Rating);
        await tourLogs.AddAsync(log, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        await RecalculateMetricsAsync(tour.Id, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        return ToResponse(log);
    }

    public async Task<TourLogResponseDto> GetByIdAsync(Guid tourLogId, CancellationToken cancellationToken = default)
    {
        EnsureAuthenticated();
        var log = await tourLogs.GetByIdAsync(tourLogId, currentUser.UserId, cancellationToken)
            ?? throw new KeyNotFoundException("Tour log was not found.");
        return ToResponse(log);
    }

    public async Task<IReadOnlyList<TourLogResponseDto>> GetByTourIdAsync(Guid tourId, CancellationToken cancellationToken = default)
    {
        EnsureAuthenticated();
        await RequireTourAsync(tourId, cancellationToken);
        var items = await tourLogs.GetByTourIdAsync(tourId, currentUser.UserId, cancellationToken);
        return items.Select(ToResponse).ToArray();
    }

    public async Task<TourLogResponseDto> UpdateAsync(Guid tourLogId, UpdateTourLogRequestDto request, CancellationToken cancellationToken = default)
    {
        updateTourLogRequestValidator.ValidateAndThrow(request);
        EnsureAuthenticated();

        var log = await tourLogs.GetByIdAsync(tourLogId, currentUser.UserId, cancellationToken)
            ?? throw new TourPlannerNotFoundException("Tour log was not found.");

        log.Update(request.AccomplishedAt, request.Comment, request.Difficulty, request.TotalDistanceKm, request.TotalTimeMinutes, request.Rating);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        await RecalculateMetricsAsync(log.TourId, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        return ToResponse(log);
    }

    public async Task DeleteAsync(Guid tourLogId, CancellationToken cancellationToken = default)
    {
        EnsureAuthenticated();
        var log = await tourLogs.GetByIdAsync(tourLogId, currentUser.UserId, cancellationToken)
            ?? throw new TourPlannerNotFoundException("Tour log was not found.");

        var tourId = log.TourId;
        tourLogs.Remove(log);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        await RecalculateMetricsAsync(tourId, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);
    }

    private async Task RecalculateMetricsAsync(Guid tourId, CancellationToken cancellationToken)
    {
        var tour = await RequireTourAsync(tourId, cancellationToken);
        var logs = await tourLogs.GetByTourIdAsync(tour.Id, currentUser.UserId, cancellationToken);
        var metrics = TourMetricsCalculator.Calculate(logs);
        tour.UpdateMetrics(metrics.Popularity, metrics.ChildFriendliness);
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

    private static TourLogResponseDto ToResponse(TourLog log)
        => new(log.Id, log.TourId, log.AccomplishedAt, log.Comment, log.Difficulty, log.TotalDistanceKm, log.TotalTimeMinutes, log.Rating);
}



