using System.Text.Json;
using TourPlanner.Application.Common.Exceptions;
using TourPlanner.Application.Abstractions.Context;
using TourPlanner.Application.Abstractions.UseCases;
using TourPlanner.Application.Dtos.TourLogs;
using TourPlanner.Application.Dtos.Tours;
using TourPlanner.Contracts.Persistence;
using TourPlanner.Domain;

namespace TourPlanner.Application.Services;

public sealed class ImportExportUseCase(
    ITourRepository tours,
    ITourLogRepository tourLogs,
    ICurrentUserContext currentUser,
    IUnitOfWork unitOfWork) : IImportExportUseCase
{
    public async Task<TourExportResponseDto> ExportAsync(CancellationToken cancellationToken = default)
    {
        EnsureAuthenticated();
        var payload = new List<TourDetailResponseDto>();
        var userTours = await tours.GetByUserIdAsync(currentUser.UserId, cancellationToken);

        foreach (var tour in userTours)
        {
            var logs = await tourLogs.GetByTourIdAsync(tour.Id, currentUser.UserId, cancellationToken);
            payload.Add(new TourDetailResponseDto(
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
                logs.Select(log => new TourLogResponseDto(log.Id, log.TourId, log.AccomplishedAt, log.Comment, log.Difficulty, log.TotalDistanceKm, log.TotalTimeMinutes, log.Rating)).ToArray()));
        }

        var json = JsonSerializer.Serialize(payload, new JsonSerializerOptions(JsonSerializerDefaults.Web) { WriteIndented = true });
        var bytes = System.Text.Encoding.UTF8.GetBytes(json);
        var fileName = $"tour-planner-export-{DateTimeOffset.UtcNow:yyyyMMddHHmmss}.json";
        return new TourExportResponseDto(fileName, "application/json", bytes);
    }

    public async Task<TourImportResultDto> ImportAsync(string fileName, byte[] content, CancellationToken cancellationToken = default)
    {
        EnsureAuthenticated();
        _ = fileName;
        var json = System.Text.Encoding.UTF8.GetString(content);
        var importedTours = JsonSerializer.Deserialize<List<TourDetailResponseDto>>(json, new JsonSerializerOptions(JsonSerializerDefaults.Web))
            ?? throw new InvalidOperationException("The import file does not contain valid tour data.");

        var importedTourCount = 0;
        var importedLogCount = 0;

        foreach (var importedTour in importedTours)
        {
            var tour = Tour.Create(
                currentUser.UserId,
                importedTour.Name,
                importedTour.Description,
                importedTour.From,
                importedTour.To,
                importedTour.TransportType,
                importedTour.DistanceKm,
                importedTour.EstimatedMinutes,
                importedTour.RouteInformation);
            tour.UpdateImagePath(importedTour.ImagePath);

            await tours.AddAsync(tour, cancellationToken);
            importedTourCount++;

            var createdLogs = new List<TourLog>();
            foreach (var log in importedTour.Logs)
            {
                var importedLog = TourLog.Create(tour.Id, log.AccomplishedAt, log.Comment, log.Difficulty, log.TotalDistanceKm, log.TotalTimeMinutes, log.Rating);
                await tourLogs.AddAsync(importedLog, cancellationToken);
                createdLogs.Add(importedLog);
                importedLogCount++;
            }

            var metrics = TourMetricsCalculator.Calculate(createdLogs);
            tour.UpdateMetrics(metrics.Popularity, metrics.ChildFriendliness);
        }

        await unitOfWork.SaveChangesAsync(cancellationToken);
        return new TourImportResultDto(importedTourCount, importedLogCount);
    }

    private void EnsureAuthenticated()
    {
        if (!currentUser.IsAuthenticated)
        {
            throw new TourPlannerUnauthorizedException("The current request is not authenticated.");
        }
    }
}



