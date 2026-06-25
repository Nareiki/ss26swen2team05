using TourPlanner.Application.Dtos.Auth;

namespace TourPlanner.Application.Abstractions.UseCases;

public interface IRegisterUseCase { 
    Task<AuthResponseDto> ExecuteAsync(RegisterRequestDto request, CancellationToken cancellationToken = default);
}