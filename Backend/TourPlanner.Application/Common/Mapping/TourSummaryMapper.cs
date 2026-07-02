using TourPlanner.Application.Abstractions.Mapping;
using TourPlanner.Application.CommonDtos.Tours;
using TourPlanner.Domain.Entities;

namespace TourPlanner.Application.Common.Mapping;

public sealed class TourSummaryMapper : IMappableToResponse<Tour, TourSummaryResponseDto> {
    public static TourSummaryResponseDto MapToResponse(Tour tour) => new(
        tour.Id, 
        tour.Name, 
        tour.Description, 
        tour.From, 
        tour.To, 
        tour.TransportType, 
        tour.DistanceKm, 
        tour.EstimatedMinutes, 
        tour.Popularity, 
        tour.ChildFriendliness, 
        tour.ImagePath
        );
}