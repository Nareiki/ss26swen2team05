using TourPlanner.Application.Abstractions.Context;
using TourPlanner.Application.Abstractions.UseCases;
using TourPlanner.Application.Common;
using TourPlanner.Application.Common.Exceptions;
using TourPlanner.Application.Common.Mapping;
using TourPlanner.Application.CommonDtos.Tours;
using TourPlanner.Application.Contracts.Persistence;
using TourPlanner.Application.Contracts.Routing;

namespace TourPlanner.Application.UseCases.Tours.UpdateTour;

public class UpdateTourUseCase (
    ITourRepository tours,
    IOpenRouteService routeService,
    ICurrentUserContext currentUser,
    IUnitOfWork unitOfWork) : IUseCase<UpdateTourRequest, TourSummaryResponseDto> {
    
    public async Task<TourSummaryResponseDto> ExecuteAsync(UpdateTourRequest request, CancellationToken cancellationToken = default) {
        var tour = await tours.GetByIdOrThrowAsync(request.TourId, currentUser.UserId, cancellationToken);

        var route = await routeService.BuildRouteAsync(request.From, request.To, request.TransportType, cancellationToken);

        tour.Update(
            request.Name,
            request.Description,
            request.From,
            request.To,
            request.TransportType,
            route.DistanceKm,
            route.EstimatedMinutes,
            route.RouteInformation);

        await unitOfWork.SaveChangesAsync(cancellationToken);
    
        return TourSummaryMapper.MapToResponse(tour);
    }
}