namespace TourPlanner.Application.Dtos.Tours;

public sealed record CreateTourRequestDto(
    string Name,
    string Description,
    string From,
    string To,
    Domain.Enums.TransportType TransportType);