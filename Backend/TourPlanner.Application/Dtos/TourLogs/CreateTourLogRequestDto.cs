namespace TourPlanner.Application.Dtos.TourLogs;

public sealed record CreateTourLogRequestDto(
    DateTimeOffset AccomplishedAt,
    string Comment,
    TourPlanner.Domain.TourDifficulty Difficulty,
    double TotalDistanceKm,
    double TotalTimeMinutes,
    int Rating);


