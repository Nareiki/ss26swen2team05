
using TourPlanner.Application.Dtos.TourLogs;

namespace TourPlanner.Application.Dtos.Tours;

public sealed record TourSearchResponseDto(IReadOnlyList<TourSummaryResponseDto> Tours, IReadOnlyList<TourLogResponseDto> TourLogs);

