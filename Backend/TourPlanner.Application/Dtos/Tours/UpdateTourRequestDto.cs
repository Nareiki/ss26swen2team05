using TourPlanner.Domain.Enums;

namespace TourPlanner.Application.Dtos.Tours;

public sealed record UpdateTourRequestDto(
    string Name,
    string Description,
    string From,
    string To,
    TransportType TransportType);

