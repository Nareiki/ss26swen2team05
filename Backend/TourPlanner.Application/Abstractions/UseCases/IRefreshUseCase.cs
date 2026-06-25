using TourPlanner.Application.Dtos.Auth;

namespace TourPlanner.Application.Abstractions.UseCases;

public interface IRefreshUseCase {
    Task<AuthResponseDto> ExecuteAsync(RefreshTokenRequestDto request, CancellationToken cancellationToken = default);
}