namespace TourPlanner.Application.Dtos.Tours;

public sealed record TourRecommendationResponseDto(IReadOnlyList<TourSummaryResponseDto> RecommendedTours);

