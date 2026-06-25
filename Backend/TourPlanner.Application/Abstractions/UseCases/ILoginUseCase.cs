using TourPlanner.Application.Dtos.Auth;

namespace TourPlanner.Application.Abstractions.UseCases;

public interface ILoginUseCase {
    Task<AuthResponseDto> ExecuteAsync(LoginRequestDto request, CancellationToken cancellationToken = default);
}