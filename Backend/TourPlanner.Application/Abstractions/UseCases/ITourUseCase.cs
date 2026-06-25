using TourPlanner.Application.Dtos.Tours;

namespace TourPlanner.Application.Abstractions.UseCases;

public interface ITourUseCase
{
    Task<TourSummaryResponseDto> CreateAsync(CreateTourRequestDto request, CancellationToken cancellationToken = default);

    Task<TourDetailResponseDto> GetByIdAsync(Guid tourId, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<TourSummaryResponseDto>> GetAllAsync(CancellationToken cancellationToken = default);

    Task<TourSummaryResponseDto> UpdateAsync(Guid tourId, UpdateTourRequestDto request, CancellationToken cancellationToken = default);

    Task DeleteAsync(Guid tourId, CancellationToken cancellationToken = default);

    Task<TourInsightResponseDto> GetInsightsAsync(Guid tourId, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<TourSummaryResponseDto>> GetRecommendedAsync(int take = 5, CancellationToken cancellationToken = default);

    Task<UploadTourImageResponseDto> UploadImageAsync(Guid tourId, string fileName, byte[] content, CancellationToken cancellationToken = default);
}

