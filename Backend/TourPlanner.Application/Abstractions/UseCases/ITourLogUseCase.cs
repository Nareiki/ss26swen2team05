using TourPlanner.Application.Dtos.TourLogs;

namespace TourPlanner.Application.Abstractions.UseCases;

public interface ITourLogUseCase
{
    Task<TourLogResponseDto> CreateAsync(Guid tourId, CreateTourLogRequestDto request, CancellationToken cancellationToken = default);

    Task<TourLogResponseDto> GetByIdAsync(Guid tourLogId, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<TourLogResponseDto>> GetByTourIdAsync(Guid tourId, CancellationToken cancellationToken = default);

    Task<TourLogResponseDto> UpdateAsync(Guid tourLogId, UpdateTourLogRequestDto request, CancellationToken cancellationToken = default);

    Task DeleteAsync(Guid tourLogId, CancellationToken cancellationToken = default);
}

