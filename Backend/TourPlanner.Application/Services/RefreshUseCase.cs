using FluentValidation;
using TourPlanner.Application.Abstractions.UseCases;
using TourPlanner.Application.Common.Exceptions;
using TourPlanner.Application.Contracts.Persistence;
using TourPlanner.Application.Contracts.Security;
using TourPlanner.Application.Contracts.Time;
using TourPlanner.Application.Dtos.Auth;

namespace TourPlanner.Application.Services;

public sealed class RefreshUseCase(
    IValidator<RefreshTokenRequestDto> validator,
    IUserSessionRepository sessions,
    IClock clock,
    IUserRepository users,
    ITokenService tokenService,
    IUnitOfWork unitOfWork) : IRefreshUseCase
{
    public async Task<AuthResponseDto> ExecuteAsync(RefreshTokenRequestDto request, CancellationToken cancellationToken = default)
    {
        validator.ValidateAndThrow(request);

        var session = await sessions.GetByRefreshTokenAsync(request.RefreshToken, cancellationToken)
                      ?? throw new TourPlannerUnauthorizedException("The refresh token is invalid or expired.");

        if (session.ExpiresAt <= clock.UtcNow)
        {
            throw new TourPlannerUnauthorizedException("The refresh token is invalid or expired.");
        }

        var user = await users.GetByIdAsync(session.UserId, cancellationToken)
                   ?? throw new TourPlannerNotFoundException("The associated user no longer exists.");

        var tokens = await tokenService.GenerateTokenPairAsync(user, cancellationToken);
        session.Renew(tokens.RefreshToken, tokens.ExpiresAt);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return new AuthResponseDto(user.Id, user.UserName, tokens.AccessToken, tokens.RefreshToken, tokens.ExpiresAt);
    }
}