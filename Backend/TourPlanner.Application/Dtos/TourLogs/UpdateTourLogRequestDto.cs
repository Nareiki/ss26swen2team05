namespace TourPlanner.Application.Dtos.TourLogs;

public sealed record UpdateTourLogRequestDto(
    DateTimeOffset AccomplishedAt,
    string Comment,
    TourPlanner.Domain.TourDifficulty Difficulty,
    double TotalDistanceKm,
    double TotalTimeMinutes,
    int Rating);


