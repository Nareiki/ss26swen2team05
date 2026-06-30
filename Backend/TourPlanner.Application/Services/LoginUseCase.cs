using FluentValidation;
using TourPlanner.Application.Abstractions.UseCases;
using TourPlanner.Application.Common.Exceptions;
using TourPlanner.Application.Contracts.Persistence;
using TourPlanner.Application.Contracts.Security;
using TourPlanner.Application.Dtos.Auth;
using TourPlanner.Domain.Entities;

namespace TourPlanner.Application.Services;

public sealed class LoginUseCase(
    IValidator<LoginRequestDto> validator,
    IUserRepository users,
    IPasswordHasher passwordHasher,
    ITokenService tokenService,
    IUserSessionRepository sessions,
    IUnitOfWork unitOfWork) : ILoginUseCase
{
    public async Task<AuthResponseDto> ExecuteAsync(LoginRequestDto request, CancellationToken cancellationToken = default)
    {
        validator.ValidateAndThrow(request);

        var user = await users.GetByUserNameAsync(request.UserName, cancellationToken)
                   ?? throw new TourPlannerUnauthorizedException("Invalid user name or password.");

        if (!passwordHasher.Verify(user.PasswordHash, request.Password))
        {
            throw new TourPlannerUnauthorizedException("Invalid user name or password.");
        }

        var tokens = await tokenService.GenerateTokenPairAsync(user, cancellationToken);
        await sessions.AddAsync(UserSession.Create(user.Id, tokens.RefreshToken, tokens.ExpiresAt), cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return new AuthResponseDto(user.Id, user.UserName, tokens.AccessToken, tokens.RefreshToken, tokens.ExpiresAt);
    }
}