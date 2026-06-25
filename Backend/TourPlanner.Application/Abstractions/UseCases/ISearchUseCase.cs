using TourPlanner.Application.Dtos.Tours;

namespace TourPlanner.Application.Abstractions.UseCases;

public interface ISearchUseCase
{
    Task<TourSearchResponseDto> SearchAsync(string query, CancellationToken cancellationToken = default);
}

